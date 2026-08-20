#!/usr/bin/env python3
"""Inline previously componentized public-preview sections back into each page.

The public site intentionally keeps complete section HTML inside every page.
This helper only reverses the three conservative includes introduced by the
current refactor branch; it does not rewrite wording or page-specific content.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"

INCLUDE_RE = re.compile(
    r'{%\s*include\s+"public_preview/components/'
    r'(?P<name>breadcrumbs|section_heading|page_cta)\.html"\s+'
    r'with\s+(?P<args>.*?)\s*%}',
    re.DOTALL,
)
ARG_RE = re.compile(r'(?P<key>[A-Za-z_][A-Za-z0-9_]*)="(?P<value>[^"]*)"')


def parse_args(raw: str) -> dict[str, str]:
    values = {match.group("key"): match.group("value") for match in ARG_RE.finditer(raw)}
    if not values:
        raise RuntimeError(f"Unable to parse include arguments: {raw!r}")
    return values


def breadcrumbs(values: dict[str, str]) -> str:
    label = values["current_label"]
    return (
        '<nav class="breadcrumbs" aria-label="مسار التنقل">\n'
        '  <a href="{% url \'public_preview:home\' %}">الرئيسية</a>\n'
        '  <span aria-hidden="true">←</span>\n'
        f'  <span aria-current="page">{label}</span>\n'
        '</nav>'
    )


def section_heading(values: dict[str, str]) -> str:
    return (
        '<div class="platform-heading reveal">\n'
        f'  <span class="section-kicker">{values["kicker"]}</span>\n'
        f'  <h2>{values["title"]}</h2>\n'
        f'  <p>{values["description"]}</p>\n'
        '</div>'
    )


def page_cta(values: dict[str, str]) -> str:
    primary_fragment = values.get("primary_fragment", "")
    secondary = ""
    if values.get("secondary_url_name"):
        secondary_fragment = values.get("secondary_fragment", "")
        secondary = (
            '\n        <a class="{secondary_class}" '
            'href="{% url \'{secondary_url}\' %}{secondary_fragment}">{secondary_label}</a>'
        ).format(
            secondary_class=values["secondary_class"],
            secondary_url=values["secondary_url_name"],
            secondary_fragment=secondary_fragment,
            secondary_label=values["secondary_label"],
        )

    return (
        '<section class="page-cta">\n'
        '  <div class="container">\n'
        '    <div class="cta-card reveal">\n'
        '      <div>\n'
        f'        <span class="section-kicker">{values["kicker"]}</span>\n'
        f'        <h2>{values["title"]}</h2>\n'
        f'        <p>{values["description"]}</p>\n'
        '      </div>\n'
        '      <div class="cta-actions">\n'
        '        <a class="{primary_class}" href="{% url \'{primary_url}\' %}{primary_fragment}">{primary_label}</a>'
        '{secondary}\n'
        '      </div>\n'
        '    </div>\n'
        '  </div>\n'
        '</section>'
    ).format(
        primary_class=values["primary_class"],
        primary_url=values["primary_url_name"],
        primary_fragment=primary_fragment,
        primary_label=values["primary_label"],
        secondary=secondary,
    )


RENDERERS = {
    "breadcrumbs": breadcrumbs,
    "section_heading": section_heading,
    "page_cta": page_cta,
}


def inline_source(source: str) -> tuple[str, int]:
    count = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal count
        values = parse_args(match.group("args"))
        count += 1
        return RENDERERS[match.group("name")](values)

    return INCLUDE_RE.sub(replace, source), count


def main() -> None:
    total = 0
    for path in sorted(PAGES_DIR.glob("*.html")):
        source = path.read_text(encoding="utf-8")
        updated, count = inline_source(source)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
        total += count

    leftovers = []
    for path in sorted(PAGES_DIR.glob("*.html")):
        if "public_preview/components/" in path.read_text(encoding="utf-8"):
            leftovers.append(path.name)
    if leftovers:
        raise RuntimeError(f"Component includes remain in: {', '.join(leftovers)}")

    print(f"Inlined {total} public section include(s) without changing their content values.")


if __name__ == "__main__":
    main()
