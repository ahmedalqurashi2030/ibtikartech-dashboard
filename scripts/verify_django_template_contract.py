#!/usr/bin/env python3
"""Verify the public website follows the native Django template contract.

This guard intentionally checks presentation architecture only. It never imports
models, reads the database, or mutates backend state.
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

TEMPLATES = ROOT / "templates" / "public_preview"
PAGES_DIR = TEMPLATES / "pages"
COMPONENTS_DIR = TEMPLATES / "components"
BASE_TEMPLATE = TEMPLATES / "base.html"

BODY_OPEN = "{% block body %}"
CONTENT_OPEN = "{% block content %}"
PAGE_SCRIPTS_OPEN = "{% block page_scripts %}"
BLOCK_END = "{% endblock %}"

LEGACY_PAGE_LINK_RE = re.compile(
    r'(?:href|action)=(["\'])[^"\']+\.html(?:[?#][^"\']*)?\1', re.IGNORECASE
)
LOCAL_ROUTE_RE = re.compile(
    r'(?P<attr>href|action)=(?P<quote>["\'])'
    r'(?P<path>/[^"\'?#]*)'
    r'(?P<suffix>[?#][^"\']*)?(?P=quote)',
    re.IGNORECASE,
)
SCRIPT_OPEN_RE = re.compile(r"<script(?P<attrs>[^>]*)>", re.IGNORECASE)


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


def verify_page(path: Path, failures: list[str]) -> None:
    source = path.read_text(encoding="utf-8")
    name = path.name

    if not source.lstrip().startswith('{% extends "public_preview/base.html" %}'):
        failures.append(f"{name}: does not extend public_preview/base.html")
    if source.count(BODY_OPEN) != 1:
        failures.append(f"{name}: expected exactly one {{% block body %}}")
    if CONTENT_OPEN in source:
        failures.append(f"{name}: legacy {{% block content %}} remains")
    if PAGE_SCRIPTS_OPEN in source or "page_scripts" in source:
        failures.append(f"{name}: legacy page_scripts contract remains")
    if "{% include " in source or "public_preview/components/" in source:
        failures.append(f"{name}: page-specific sections must stay inline")
    if 'id="ibtikarSiteHeader"' in source or 'class="ibt-shell-footer"' in source:
        failures.append(f"{name}: shared header/footer duplicated inside child template")
    if LEGACY_PAGE_LINK_RE.search(source):
        failures.append(f"{name}: legacy .html href/action remains")

    for match in LOCAL_ROUTE_RE.finditer(source):
        clean_path = match.group("path")
        route_name = KNOWN_CLEAN_PATHS.get(clean_path)
        if route_name:
            failures.append(
                f"{name}: literal internal route {clean_path} remains; "
                f"use {{% url '{route_name}' %}}"
            )

    try:
        body = block_payload(source, BODY_OPEN)
    except RuntimeError as exc:
        failures.append(f"{name}: {exc}")
        return

    # Page-owned scripts live at the tail of body. Keep external scripts
    # non-blocking so parsing of the shared footer is not delayed.
    main_end = body.lower().rfind("</main>")
    if main_end >= 0:
        tail = body[main_end + len("</main>") :]
        for script in SCRIPT_OPEN_RE.finditer(tail):
            attrs = script.group("attrs")
            if not external_script_is_nonblocking(attrs):
                failures.append(
                    f"{name}: page-owned tail script must use defer/async/module: "
                    f"<script{attrs}>"
                )


def verify_base(failures: list[str]) -> None:
    base = BASE_TEMPLATE.read_text(encoding="utf-8")
    if base.count(BODY_OPEN) != 1:
        failures.append("base.html: expected exactly one {% block body %}")
    if CONTENT_OPEN in base:
        failures.append("base.html: legacy {% block content %} remains")
    if PAGE_SCRIPTS_OPEN in base or "page_scripts" in base:
        failures.append("base.html: legacy page_scripts contract remains")

    expected = ("document_head.html", "header.html", "footer.html")
    for component in expected:
        include = f'{{% include "public_preview/components/{component}" %}}'
        if include not in base:
            failures.append(f"base.html: missing {component} include")
        if not (COMPONENTS_DIR / component).is_file():
            failures.append(f"components/{component}: missing file")

    if 'include "public_preview/components/runtime.html"' in base:
        failures.append("base.html: unnecessary global runtime include remains")


def main() -> None:
    failures: list[str] = []
    verify_base(failures)

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
        f"{len(REQUIRED_PAGES)}/{len(REQUIRED_PAGES)} pages."
    )


if __name__ == "__main__":
    main()
