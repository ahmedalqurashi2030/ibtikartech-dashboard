#!/usr/bin/env python3
"""Replace matching plain-text page CTA markup with a shared parameterized include.

Only structurally identical CTAs with plain text are componentized. CTAs with
inline HTML stay in their page template so reusable components never require
``safe`` rendering and remain suitable for future dynamic content.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
CTA_INCLUDE = 'include "public_preview/components/page_cta.html"'

PAGE_CTA_RE = re.compile(
    r'<section class="page-cta"><div class="container"><div class="cta-card reveal"><div>'
    r'<span class="section-kicker">(?P<kicker>[^<]*)</span>'
    r'<h2>(?P<title>[^<]*)</h2><p>(?P<description>[^<]*)</p></div>'
    r'<div class="cta-actions">'
    r'<a class="(?P<primary_class>[^"]+)" href="\{% url \'(?P<primary_url>[^\']+)\' %\}'
    r'(?P<primary_fragment>#[^"]*)?">(?P<primary_label>[^<]+)</a>'
    r'(?:<a class="(?P<secondary_class>[^"]+)" href="\{% url \'(?P<secondary_url>[^\']+)\' %\}'
    r'(?P<secondary_fragment>#[^"]*)?">(?P<secondary_label>[^<]+)</a>)?'
    r'</div></div></div></section>',
    re.DOTALL,
)
CTA_INCLUDE_RE = re.compile(
    r'{%\s*include\s+"public_preview/components/page_cta\.html"(?P<args>.*?)%}',
    re.DOTALL,
)


def quote(value: str | None) -> str | None:
    if value is None:
        return None
    value = " ".join(value.split())
    if any(token in value for token in ('"', "{%", "{{", "<", ">")):
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


def validate_existing_includes(source: str, path: Path) -> None:
    for match in CTA_INCLUDE_RE.finditer(source):
        args = match.group("args")
        if "<" in args or ">" in args or "|safe" in args:
            raise RuntimeError(
                f"Unsafe/rich page CTA include found in {path.name}; keep rich markup inline."
            )


def main() -> None:
    total = 0
    combined_after = []
    for path in sorted(PAGES_DIR.glob("*.html")):
        source = path.read_text(encoding="utf-8")
        updated, count = PAGE_CTA_RE.subn(replacement, source)
        validate_existing_includes(updated, path)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
        combined_after.append(updated)
        total += count

    combined = "\n".join(combined_after)
    if total == 0 and CTA_INCLUDE not in combined:
        raise RuntimeError("No matching reusable page CTA structures or includes were found.")
    print(f"Reusable page CTA structures synchronized; {total} new replacement(s).")


if __name__ == "__main__":
    main()
