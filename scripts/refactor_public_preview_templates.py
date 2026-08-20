#!/usr/bin/env python3
"""Convert imported static preview documents into Django page templates.

The approved frontend source remains the content authority. This post-import step
only changes document architecture and URLs: the global document shell moves to
base.html, while every page keeps the complete HTML for all of its own sections.
No section is replaced by a reusable include or database-backed model.

Public child templates use one presentation contract:
- ``{% extends \"public_preview/base.html\" %}``
- page metadata in ``{% block head %}``
- body attributes in ``{% block body_attrs %}``
- all page sections and page-owned runtime in ``{% block body %}``

There is intentionally no ``page_scripts`` block. Page-owned external scripts
that used to live after the shared footer are moved to the end of ``body`` and
marked ``defer`` so they execute only after the complete document has parsed.
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

PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
PAGE_SHELL_JS = ROOT / "static" / "public_preview" / "assets" / "js" / "page-shell.js"

DOCUMENT_RE = re.compile(
    r"<!doctype\s+html>\s*<html\b[^>]*>\s*<head>(?P<head>.*?)</head>\s*"
    r"<body(?P<body_attrs>[^>]*)>(?P<body>.*)</body>\s*</html>\s*$",
    re.IGNORECASE | re.DOTALL,
)
HEADER_RE = re.compile(
    r'<header\b[^>]*id=["\']ibtikarSiteHeader["\'][^>]*>.*?</header>',
    re.IGNORECASE | re.DOTALL,
)
MOBILE_NAV_RE = re.compile(
    r'<nav\b[^>]*id=["\']ibtikarMobileMenu["\'][^>]*>.*?</nav>',
    re.IGNORECASE | re.DOTALL,
)
FOOTER_RE = re.compile(
    r'<footer\b[^>]*class=["\'][^"\']*\bibt-shell-footer\b[^"\']*["\'][^>]*>.*?</footer>',
    re.IGNORECASE | re.DOTALL,
)
SKIP_LINK_RE = re.compile(
    r'<a\b[^>]*class=["\'][^"\']*\bskip-link\b[^"\']*["\'][^>]*>.*?</a>',
    re.IGNORECASE | re.DOTALL,
)
LOCAL_PAGE_ATTR_RE = re.compile(
    r'(?P<attr>href|action)=(?P<quote>["\'])'
    r'(?P<prefix>\.?\.?/|/)?(?P<page>[A-Za-z0-9_-]+\.html)'
    r'(?P<suffix>[?#][^"\']*)?(?P=quote)',
    re.IGNORECASE,
)
LOCAL_CLEAN_ATTR_RE = re.compile(
    r'(?P<attr>href|action)=(?P<quote>["\'])'
    r'(?P<path>/[^"\'?#]*)'
    r'(?P<suffix>[?#][^"\']*)?(?P=quote)',
    re.IGNORECASE,
)
CHARSET_RE = re.compile(r'<meta\s+charset=["\'][^"\']+["\']\s*/?>', re.IGNORECASE)
VIEWPORT_RE = re.compile(
    r'<meta\s+name=["\']viewport["\'][^>]*>', re.IGNORECASE
)
IMPORT_COMMENT_RE = re.compile(
    r'^\s*\{#\s*TEMPORARY FRONTEND PREVIEW:.*?#\}\s*', re.DOTALL
)
DATA_PAGE_RE = re.compile(r'\s+data-page=(?:"[^"]*"|\'[^\']*\')', re.IGNORECASE)
SCRIPT_OPEN_RE = re.compile(r"<script(?P<attrs>[^>]*)>", re.IGNORECASE)

BLOCK_END = "{% endblock %}"
BODY_BLOCK_OPEN = "{% block body %}"
CONTENT_BLOCK_OPEN = "{% block content %}"
PAGE_SCRIPTS_BLOCK_OPEN = "{% block page_scripts %}"


def _known_clean_paths() -> dict[str, str]:
    mapping: dict[str, str] = {"/services/": "services:index"}
    for page_name, (route, _view_name) in PUBLIC_PAGE_ROUTES.items():
        mapping[f"/{route}" if route else "/"] = PAGE_URL_NAMES[page_name]
    for page_name, (route, _view_name) in SERVICE_PAGE_ROUTES.items():
        mapping[f"/services/{route}"] = PAGE_URL_NAMES[page_name]
    return mapping


CLEAN_PATH_URL_NAMES = _known_clean_paths()


def rewrite_named_urls(source: str) -> str:
    """Replace internal href/action targets with namespaced Django URLs."""

    def replace_legacy(match: re.Match[str]) -> str:
        page_name = match.group("page").lower()
        pattern_name = PAGE_URL_NAMES.get(page_name)
        if not pattern_name:
            return match.group(0)
        suffix = match.group("suffix") or ""
        return (
            f'{match.group("attr")}={match.group("quote")}'
            f"{{% url '{pattern_name}' %}}{suffix}{match.group('quote')}"
        )

    def replace_clean(match: re.Match[str]) -> str:
        pattern_name = CLEAN_PATH_URL_NAMES.get(match.group("path"))
        if not pattern_name:
            return match.group(0)
        suffix = match.group("suffix") or ""
        return (
            f'{match.group("attr")}={match.group("quote")}'
            f"{{% url '{pattern_name}' %}}{suffix}{match.group('quote')}"
        )

    source = LOCAL_PAGE_ATTR_RE.sub(replace_legacy, source)
    return LOCAL_CLEAN_ATTR_RE.sub(replace_clean, source)


def defer_external_scripts(source: str) -> str:
    """Defer page-owned external scripts moved inside the body block.

    This keeps their effective execution point after the full HTML document has
    parsed, including the shared footer/runtime, while avoiding render blocking.
    Async/module scripts keep their existing semantics.
    """

    def replace(match: re.Match[str]) -> str:
        attrs = match.group("attrs")
        lowered = attrs.lower()
        if "src=" not in lowered:
            return match.group(0)
        if re.search(r"(?:^|\s)(?:defer|async)(?:\s|=|$)", lowered):
            return match.group(0)
        if re.search(r"\btype\s*=\s*([\"\'])module\1", lowered):
            return match.group(0)
        return f"<script{attrs} defer>"

    return SCRIPT_OPEN_RE.sub(replace, source)


def clean_head(head: str) -> str:
    head = CHARSET_RE.sub("", head, count=1)
    head = VIEWPORT_RE.sub("", head, count=1)
    return rewrite_named_urls(head).strip()


def clean_body_attrs(attrs: str) -> str:
    return DATA_PAGE_RE.sub("", attrs).rstrip()


def remove_shared_shell(source: str) -> str:
    """Remove only the global shell imported from the approved static source."""
    updated = HEADER_RE.sub("", source, count=1)
    updated = MOBILE_NAV_RE.sub("", updated, count=1)
    updated = SKIP_LINK_RE.sub("", updated, count=1)
    return updated.strip()


def _block_bounds(source: str, opener: str) -> tuple[int, int, int, int] | None:
    """Return opener/body/end bounds for one top-level Django template block."""
    start = source.find(opener)
    if start < 0:
        return None
    body_start = start + len(opener)
    end = source.find(BLOCK_END, body_start)
    if end < 0:
        raise RuntimeError(f"Unclosed Django block: {opener}")
    return start, body_start, end, end + len(BLOCK_END)


def normalize_existing_child(source: str, page_name: str) -> str:
    """Migrate an already-converted child template to the native body contract."""
    updated = rewrite_named_urls(source)

    scripts = ""
    scripts_bounds = _block_bounds(updated, PAGE_SCRIPTS_BLOCK_OPEN)
    if scripts_bounds:
        start, body_start, end, block_end = scripts_bounds
        scripts = updated[body_start:end].strip()
        updated = (updated[:start].rstrip() + "\n" + updated[block_end:].lstrip()).rstrip() + "\n"

    if CONTENT_BLOCK_OPEN in updated:
        updated = updated.replace(CONTENT_BLOCK_OPEN, BODY_BLOCK_OPEN, 1)

    body_bounds = _block_bounds(updated, BODY_BLOCK_OPEN)
    if not body_bounds:
        raise RuntimeError(f"Django body block missing: {page_name}")

    if scripts:
        scripts = defer_external_scripts(scripts)
        _start, _body_start, body_end, _block_end = body_bounds
        before = updated[:body_end].rstrip()
        after = updated[body_end:]
        updated = f"{before}\n\n{scripts}\n{after.lstrip()}"

    if CONTENT_BLOCK_OPEN in updated:
        raise RuntimeError(f"Legacy content block remains: {page_name}")
    if PAGE_SCRIPTS_BLOCK_OPEN in updated or "page_scripts" in updated:
        raise RuntimeError(f"Legacy page_scripts contract remains: {page_name}")

    return updated


def convert_page(page_name: str) -> None:
    path = PAGES_DIR / page_name
    source = path.read_text(encoding="utf-8")

    if source.lstrip().startswith('{% extends "public_preview/base.html" %}'):
        updated = normalize_existing_child(source, page_name)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
        return

    source = IMPORT_COMMENT_RE.sub("", source, count=1)
    document = DOCUMENT_RE.search(source)
    if not document:
        raise RuntimeError(f"Could not parse full HTML document: {page_name}")

    head = clean_head(document.group("head"))
    body_attrs = clean_body_attrs(document.group("body_attrs"))
    body = document.group("body")

    footer = FOOTER_RE.search(body)
    if not footer:
        raise RuntimeError(f"Shared footer boundary not found: {page_name}")

    before_footer = body[: footer.start()]
    after_footer = body[footer.end() :]
    content = rewrite_named_urls(remove_shared_shell(before_footer))
    scripts = defer_external_scripts(rewrite_named_urls(after_footer.strip()))
    body_payload = content.rstrip()
    if scripts:
        body_payload = f"{body_payload}\n\n{scripts}"

    child = (
        '{% extends "public_preview/base.html" %}\n\n'
        "{% block head %}\n"
        f"{head}\n"
        "{% endblock %}\n\n"
        "{% block body_attrs %}"
        f"{body_attrs}"
        "{% endblock %}\n\n"
        "{% block body %}\n"
        f"{body_payload}\n"
        "{% endblock %}\n"
    )

    leftover_shell = (
        'id="ibtikarSiteHeader"' in child
        or 'class="ibt-shell-footer"' in child
        or "data-shell-header" in child
        or "data-shell-footer" in child
    )
    if leftover_shell:
        raise RuntimeError(f"Shared shell duplication remains after conversion: {page_name}")

    if "public_preview/components/" in child:
        raise RuntimeError(f"Section component include introduced unexpectedly: {page_name}")

    if CONTENT_BLOCK_OPEN in child or "page_scripts" in child:
        raise RuntimeError(f"Legacy child block introduced unexpectedly: {page_name}")

    unresolved = [
        match.group("page")
        for match in LOCAL_PAGE_ATTR_RE.finditer(child)
        if match.group("page").lower() in PAGE_URL_NAMES
    ]
    if unresolved:
        raise RuntimeError(
            f"Named URL conversion incomplete in {page_name}: {sorted(set(unresolved))}"
        )

    path.write_text(child, encoding="utf-8")


def patch_page_shell_runtime() -> None:
    js = PAGE_SHELL_JS.read_text(encoding="utf-8")

    old_identity = """  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();\n  const pageKey = pathname.replace(/\\.html$/, '') || 'index';"""
    new_identity = """  // Django clean URLs are canonical. Template context supplies the stable page\n  // identity so existing page-specific enhancement logic no longer depends on .html.\n  const pageKey = (document.body.dataset.page || 'index').toLowerCase();\n  const pathname = pageKey === 'index' ? 'index.html' : `${pageKey}.html`;"""
    if old_identity in js:
        js = js.replace(old_identity, new_identity, 1)
    elif "Django clean URLs are canonical" not in js:
        raise RuntimeError("page-shell.js page identity changed; refusing unsafe patch")

    old_canonical = """    const canonicalPath = pathname === 'index.html' || pathname === '' ? '/' : `/${pathname}`;\n    const canonicalUrl = `${productionOrigin}${canonicalPath}`;"""
    new_canonical = """    const browserPath = location.pathname || '/';\n    const canonicalPath = browserPath === '/' ? '/' : `${browserPath.replace(/\\/+$/, '')}/`;\n    const canonicalUrl = `${productionOrigin}${canonicalPath}`;"""
    if old_canonical in js:
        js = js.replace(old_canonical, new_canonical, 1)
    elif "const browserPath = location.pathname || '/';" not in js:
        raise RuntimeError("page-shell.js canonical logic changed; refusing unsafe patch")

    PAGE_SHELL_JS.write_text(js, encoding="utf-8")


def main() -> None:
    for page_name in REQUIRED_PAGES:
        convert_page(page_name)
    patch_page_shell_runtime()
    print(
        f"Refactored {len(REQUIRED_PAGES)} public templates with one native Django body block."
    )


if __name__ == "__main__":
    main()
