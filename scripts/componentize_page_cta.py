#!/usr/bin/env python3
"""Replace matching page CTA markup with a shared parameterized include."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"

PAGE_CTA_RE = re.compile(
    r'<section class="page-cta"><div class="container"><div class="cta-card reveal"><div>'
    r'<span class="section-kicker">(?P<kicker>.*?)</span>'
    r'<h2>(?P<title>.*?)</h2><p>(?P<description>.*?)</p></div>'
    r'<div class="cta-actions">'
    r'<a class="(?P<primary_class>[^"]+)" href="\{% url \'(?P<primary_url>[^\']+)\' %\}'
    r'(?P<primary_fragment>#[^"]*)?">(?P<primary_label>[^<]+)</a>'
    r'(?:<a class="(?P<secondary_class>[^"]+)" href="\{% url \'(?P<secondary_url>[^\']+)\' %\}'
    r'(?P<secondary_fragment>#[^"]*)?">(?P<secondary_label>[^<]+)</a>)?'
    r'</div></div></div></section>',
    re.DOTALL,
)


def quote(value: str | None) -> str | None:
    if value is None:
        return None
    value = " ".join(value.split())
    if '"' in value or "{%" in value or "{{" in value:
        return None
    return f'"{value}"'


def replacement(match: re.Match[str]) -> str:
    values = {
        key: quote(match.group(key))
        for key in (
            "kicker",
            "title",
            "description",
            "primary_class",
            "primary_url",
            "primary_fragment",
            "primary_label",
            "secondary_class",
            "secondary_url",
            "secondary_fragment",
            "secondary_label",
        )
    }
    required = (
        "kicker",
        "title",
        "description",
        "primary_class",
        "primary_url",
        "primary_label",
    )
    if any(values[key] is None for key in required):
        return match.group(0)

    args = [
        f"kicker={values['kicker']}",
        f"title={values['title']}",
        f"description={values['description']}",
        f"primary_class={values['primary_class']}",
        f"primary_url_name={values['primary_url']}",
        f"primary_label={values['primary_label']}",
    ]
    if values["primary_fragment"]:
        args.append(f"primary_fragment={values['primary_fragment']}")

    if values["secondary_url"] and values["secondary_label"] and values["secondary_class"]:
        args.extend(
            [
                f"secondary_class={values['secondary_class']}",
                f"secondary_url_name={values['secondary_url']}",
                f"secondary_label={values['secondary_label']}",
            ]
        )
        if values["secondary_fragment"]:
            args.append(f"secondary_fragment={values['secondary_fragment']}")

    return (
        '{% include "public_preview/components/page_cta.html" with '
        + " ".join(args)
        + " %}"
    )


def main() -> None:
    total = 0
    for path in sorted(PAGES_DIR.glob("*.html")):
        source = path.read_text(encoding="utf-8")
        updated, count = PAGE_CTA_RE.subn(replacement, source)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
            total += count
    if total == 0:
        raise RuntimeError("No matching reusable page CTA structures were found.")
    print(f"Componentized {total} shared page CTA section(s).")


if __name__ == "__main__":
    main()
