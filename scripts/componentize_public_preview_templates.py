#!/usr/bin/env python3
"""Replace safe repeated page structures with shared Django includes.

This pass is intentionally conservative: it only replaces structures whose
markup is identical and whose content can be passed without changing semantics.
Anything structurally unique stays inside its page template.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"

BREADCRUMB_INCLUDE = 'include "public_preview/components/breadcrumbs.html"'
HEADING_INCLUDE = 'include "public_preview/components/section_heading.html"'

SIMPLE_BREADCRUMB_RE = re.compile(
    r'<nav class="breadcrumbs" aria-label="مسار التنقل">\s*'
    r'<a href="\{% url \'public_preview:home\' %\}">الرئيسية</a>\s*'
    r'<span>←</span>\s*'
    r'<span aria-current="page">(?P<label>[^<]+)</span>\s*'
    r'</nav>',
    re.DOTALL,
)

SECTION_HEADING_RE = re.compile(
    r'<div class="platform-heading reveal">\s*'
    r'<span class="section-kicker">(?P<kicker>[^<]+)</span>\s*'
    r'<h2>(?P<title>[^<]+)</h2>\s*'
    r'<p>(?P<description>[^<]+)</p>\s*'
    r'</div>',
    re.DOTALL,
)


def quoted(value: str) -> str | None:
    """Return a safe Django-template quoted literal or None when ambiguous."""
    value = " ".join(value.split())
    if '"' in value or "{%" in value or "{{" in value:
        return None
    return f'"{value}"'


def componentize(source: str) -> tuple[str, int, int]:
    breadcrumb_count = 0
    heading_count = 0

    def breadcrumb(match: re.Match[str]) -> str:
        nonlocal breadcrumb_count
        label = quoted(match.group("label"))
        if label is None:
            return match.group(0)
        breadcrumb_count += 1
        return (
            '{% include "public_preview/components/breadcrumbs.html" '
            f"with current_label={label} %}}"
        )

    source = SIMPLE_BREADCRUMB_RE.sub(breadcrumb, source)

    def heading(match: re.Match[str]) -> str:
        nonlocal heading_count
        kicker = quoted(match.group("kicker"))
        title = quoted(match.group("title"))
        description = quoted(match.group("description"))
        if None in (kicker, title, description):
            return match.group(0)
        heading_count += 1
        return (
            '{% include "public_preview/components/section_heading.html" '
            f"with kicker={kicker} title={title} description={description} %}}"
        )

    source = SECTION_HEADING_RE.sub(heading, source)
    return source, breadcrumb_count, heading_count


def main() -> None:
    total_breadcrumbs = 0
    total_headings = 0
    combined_after = []

    for path in sorted(PAGES_DIR.glob("*.html")):
        source = path.read_text(encoding="utf-8")
        updated, breadcrumbs, headings = componentize(source)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
        combined_after.append(updated)
        total_breadcrumbs += breadcrumbs
        total_headings += headings

    combined = "\n".join(combined_after)
    if total_breadcrumbs == 0 and BREADCRUMB_INCLUDE not in combined:
        raise RuntimeError("No reusable breadcrumb structures or includes were found.")
    if total_headings == 0 and HEADING_INCLUDE not in combined:
        raise RuntimeError("No reusable section headings or includes were found.")

    print(
        "Reusable structures synchronized: "
        f"{total_breadcrumbs} new breadcrumbs, {total_headings} new section headings."
    )


if __name__ == "__main__":
    main()
