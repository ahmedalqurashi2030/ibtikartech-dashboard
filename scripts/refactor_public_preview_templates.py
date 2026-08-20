#!/usr/bin/env python3
"""Convert imported static preview documents into maintainable Django templates.

The approved frontend source remains the content authority. This post-import step
only changes template architecture: shared document shell, named Django URLs, and
clean-route runtime identity. It never removes page content sections.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES  # noqa: E402

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
CHARSET_RE = re.compile(r'<meta\s+charset=["\'][^"\']+["\']\s*/?>', re.IGNORECASE)
VIEWPORT_RE = re.compile(
    r'<meta\s+name=["\']viewport["\'][^>]*>', re.IGNORECASE
)
IMPORT_COMMENT_RE = re.compile(
    r'^\s*\{#\s*TEMPORARY FRONTEND PREVIEW:.*?#\}\s*', re.DOTALL
)
DATA_PAGE_RE = re.compile(r'\s+data-page=(?:"[^"]*"|\'[^\']*\')', re.IGNORECASE)

HEADER_INCLUDE = '{% include "public_preview/components/header.html" %}'
FOOTER_INCLUDE = '{% include "public_preview/components/footer.html" %}'


def rewrite_named_urls(source: str) -> str:
    """Replace local *.html href/action attributes with namespaced Django URLs."""

    def replace(match: re.Match[str]) -> str:
        page_name = match.group("page").lower()
        pattern_name = PAGE_URL_NAMES.get(page_name)
        if not pattern_name:
            return match.group(0)
        suffix = match.group("suffix") or ""
        return (
            f'{match.group("attr")}={match.group("quote")}'
            f"{{% url '{pattern_name}' %}}{suffix}{match.group('quote')}"
        )

    return LOCAL_PAGE_ATTR_RE.sub(replace, source)


def clean_head(head: str) -> str:
    head = CHARSET_RE.sub("", head, count=1)
    head = VIEWPORT_RE.sub("", head, count=1)
    return rewrite_named_urls(head).strip()


def clean_body_attrs(attrs: str) -> str:
    return DATA_PAGE_RE.sub("", attrs).rstrip()


def remove_shared_shell(before_footer: str) -> str:
    updated = before_footer.replace(HEADER_INCLUDE, "")
    updated = updated.replace(FOOTER_INCLUDE, "")
    updated = HEADER_RE.sub("", updated, count=1)
    updated = MOBILE_NAV_RE.sub("", updated, count=1)
    updated = SKIP_LINK_RE.sub("", updated, count=1)
    return updated.strip()


def convert_page(page_name: str) -> None:
    path = PAGES_DIR / page_name
    source = path.read_text(encoding="utf-8")

    if source.lstrip().startswith('{% extends "public_preview/base.html" %}'):
        # Still normalize named URLs so the script is idempotent after manual edits.
        updated = rewrite_named_urls(source)
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
    if footer:
        before_footer = body[: footer.start()]
        after_footer = body[footer.end() :]
    elif FOOTER_INCLUDE in body:
        before_footer, after_footer = body.split(FOOTER_INCLUDE, 1)
    else:
        raise RuntimeError(f"Shared footer boundary not found: {page_name}")

    content = rewrite_named_urls(remove_shared_shell(before_footer))
    scripts = rewrite_named_urls(after_footer.strip())

    child = (
        '{% extends "public_preview/base.html" %}\n\n'
        "{% block head %}\n"
        f"{head}\n"
        "{% endblock %}\n\n"
        "{% block body_attrs %}"
        f"{body_attrs}"
        "{% endblock %}\n\n"
        "{% block content %}\n"
        f"{content}\n"
        "{% endblock %}\n\n"
        "{% block page_scripts %}\n"
        f"{scripts}\n"
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
        f"Refactored {len(REQUIRED_PAGES)} public templates to Django extends/include architecture."
    )


if __name__ == "__main__":
    main()
