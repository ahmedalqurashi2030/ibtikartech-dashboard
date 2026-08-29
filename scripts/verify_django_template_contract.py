#!/usr/bin/env python3
"""Verify the approved Django template contracts for the public website.

This guard checks presentation architecture only. It never imports models,
reads the database, or mutates backend state.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.public_preview.manifest import (  # noqa: E402
    PAGE_URL_NAMES,
    PUBLIC_PAGE_ROUTES,
    REQUIRED_PAGES,
    SERVICE_PAGE_ROUTES,
)
from apps.public_preview.template_contract import (  # noqa: E402
    BASE_TEMPLATE_PARENT,
    FAMILY_EXTENSION_BLOCKS,
    FAMILY_REQUIRED_BLOCKS,
    FAMILY_REQUIRED_MARKERS,
    block_tag,
    extends_tag,
    page_parent,
)

TEMPLATES = ROOT / "templates" / "public_preview"
PAGES_DIR = TEMPLATES / "pages"
COMPONENTS_DIR = TEMPLATES / "components"
BASE_TEMPLATE = TEMPLATES / "base.html"

BODY_OPEN = "{% block body %}"
CONTENT_OPEN = "{% block content %}"
PAGE_SCRIPTS_OPEN = "{% block page_scripts %}"
BLOCK_END = "{% endblock %}"

LEGACY_PAGE_LINK_RE = re.compile(
    r'(?:href|action)=(["\'])[^"\']+\.html(?:[?#][^"\']*)?\1',
    re.IGNORECASE,
)
LOCAL_ROUTE_RE = re.compile(
    r'(?P<attr>href|action)=(?P<quote>["\'])'
    r'(?P<path>/[^"\'?#]*)'
    r'(?P<suffix>[?#][^"\']*)?(?P=quote)',
    re.IGNORECASE,
)
SCRIPT_OPEN_RE = re.compile(r"<script(?P<attrs>[^>]*)>", re.IGNORECASE)


def family_path(parent: str) -> Path:
    return ROOT / "templates" / parent


def known_clean_paths() -> dict[str, str]:
    mapping = {"/services/": "services:index"}
    for page_name, (route, _view_name) in PUBLIC_PAGE_ROUTES.items():
        mapping[f"/{route}" if route else "/"] = PAGE_URL_NAMES[page_name]
    for page_name, (route, _view_name) in SERVICE_PAGE_ROUTES.items():
        mapping[f"/services/{route}"] = PAGE_URL_NAMES[page_name]
    return mapping


KNOWN_CLEAN_PATHS = known_clean_paths()


def block_payload(source: str, opener: str) -> str:
    start = source.find(opener)
    if start < 0:
        raise RuntimeError(f"missing block {opener}")
    body_start = start + len(opener)
    end = source.find(BLOCK_END, body_start)
    if end < 0:
        raise RuntimeError(f"unclosed block {opener}")
    return source[body_start:end]


def external_script_is_nonblocking(attrs: str) -> bool:
    lowered = attrs.lower()
    if "src=" not in lowered:
        return True
    if re.search(r"(?:^|\s)(?:defer|async)(?:\s|=|$)", lowered):
        return True
    return bool(re.search(r"\btype\s*=\s*([\"\'])module\1", lowered))


def verify_internal_links(source: str, label: str, failures: list[str]) -> None:
    if LEGACY_PAGE_LINK_RE.search(source):
        failures.append(f"{label}: legacy .html href/action remains")

    for match in LOCAL_ROUTE_RE.finditer(source):
        clean_path = match.group("path")
        route_name = KNOWN_CLEAN_PATHS.get(clean_path)
        if route_name:
            failures.append(
                f"{label}: literal internal route {clean_path} remains; "
                f"use {{% url '{route_name}' %}}"
            )


def verify_tail_scripts(source: str, label: str, failures: list[str]) -> None:
    main_end = source.lower().rfind("</main>")
    if main_end < 0:
        return
    tail = source[main_end + len("</main>") :]
    for script in SCRIPT_OPEN_RE.finditer(tail):
        attrs = script.group("attrs")
        if not external_script_is_nonblocking(attrs):
            failures.append(
                f"{label}: page-owned tail script must use defer/async/module: "
                f"<script{attrs}>"
            )


def verify_page(path: Path, failures: list[str]) -> None:
    source = path.read_text(encoding="utf-8")
    name = path.name
    parent = page_parent(name)

    if not source.lstrip().startswith(extends_tag(parent)):
        failures.append(f"{name}: does not extend approved parent {parent}")
    if CONTENT_OPEN in source:
        failures.append(f"{name}: legacy {{% block content %}} remains")
    if PAGE_SCRIPTS_OPEN in source or "page_scripts" in source:
        failures.append(f"{name}: legacy page_scripts contract remains")
    if "{% include " in source or "public_preview/components/" in source:
        failures.append(f"{name}: page content must not import shell components")
    if 'id="ibtikarSiteHeader"' in source or 'class="ibt-shell-footer"' in source:
        failures.append(f"{name}: shared header/footer duplicated inside child template")

    if parent == BASE_TEMPLATE_PARENT:
        if source.count(BODY_OPEN) != 1:
            failures.append(f"{name}: expected exactly one {{% block body %}}")
        try:
            body = block_payload(source, BODY_OPEN)
        except RuntimeError as exc:
            failures.append(f"{name}: {exc}")
        else:
            verify_tail_scripts(body, name, failures)
    else:
        if source.count(BODY_OPEN) != 0:
            failures.append(f"{name}: family child must not override the body block")
        for block_name in FAMILY_REQUIRED_BLOCKS[parent]:
            if source.count(block_tag(block_name)) != 1:
                failures.append(
                    f"{name}: expected exactly one {{% block {block_name} %}}"
                )

    verify_internal_links(source, name, failures)


def verify_family(parent: str, failures: list[str]) -> None:
    path = family_path(parent)
    label = str(path.relative_to(ROOT))
    if not path.is_file():
        failures.append(f"{label}: approved family template is missing")
        return

    source = path.read_text(encoding="utf-8")
    if not source.lstrip().startswith(extends_tag(BASE_TEMPLATE_PARENT)):
        failures.append(f"{label}: family must extend {BASE_TEMPLATE_PARENT}")
    if source.count(BODY_OPEN) != 1:
        failures.append(f"{label}: expected exactly one {{% block body %}}")
    if "{% include " in source:
        failures.append(f"{label}: family must not import arbitrary partials")

    for marker in FAMILY_REQUIRED_MARKERS[parent]:
        if source.count(marker) != 1:
            failures.append(f"{label}: expected exactly one required marker {marker!r}")

    for block_name in FAMILY_REQUIRED_BLOCKS[parent]:
        if source.count(block_tag(block_name)) != 1:
            failures.append(
                f"{label}: expected exactly one {{% block {block_name} %}}"
            )

    for block_name in FAMILY_EXTENSION_BLOCKS[parent]:
        if source.count(block_tag(block_name)) != 1:
            failures.append(
                f"{label}: expected exactly one {{% block {block_name} %}}"
            )

    if "service_after_main" in FAMILY_EXTENSION_BLOCKS[parent]:
        if not (
            source.index("</main>")
            < source.index(block_tag("service_after_main"))
            < source.index(block_tag("service_scripts"))
        ):
            failures.append(f"{label}: after-main content and scripts are out of order")

    verify_internal_links(source, label, failures)
    verify_tail_scripts(source, label, failures)


def verify_base(failures: list[str]) -> None:
    base = BASE_TEMPLATE.read_text(encoding="utf-8")
    if base.count(BODY_OPEN) != 1:
        failures.append("base.html: expected exactly one {% block body %}")
    if CONTENT_OPEN in base:
        failures.append("base.html: legacy {% block content %} remains")
    if PAGE_SCRIPTS_OPEN in base or "page_scripts" in base:
        failures.append("base.html: legacy page_scripts contract remains")

    expected = ("document_head.html", "header.html", "footer.html", "runtime.html")
    for component in expected:
        include = f'{{% include "public_preview/components/{component}" %}}'
        if include not in base:
            failures.append(f"base.html: missing {component} include")
        if not (COMPONENTS_DIR / component).is_file():
            failures.append(f"components/{component}: missing file")


def main() -> None:
    failures: list[str] = []
    verify_base(failures)

    for parent in FAMILY_REQUIRED_BLOCKS:
        verify_family(parent, failures)

    for page_name in REQUIRED_PAGES:
        path = PAGES_DIR / page_name
        if not path.is_file():
            failures.append(f"{page_name}: required page missing")
            continue
        verify_page(path, failures)

    if failures:
        raise RuntimeError("Django public template contract failed:\n- " + "\n- ".join(failures))

    print(
        "Django public template contract passed for "
        f"{len(REQUIRED_PAGES)}/{len(REQUIRED_PAGES)} pages and "
        f"{len(FAMILY_REQUIRED_BLOCKS)} approved family template(s)."
    )


if __name__ == "__main__":
    main()
