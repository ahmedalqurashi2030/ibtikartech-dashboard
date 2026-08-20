#!/usr/bin/env python3
"""Verify the Django refactor preserves every approved public <section>.

The source frontend remains the content authority. Shared components may move a
section out of a child template, so effective section counts include any shared
component invoked by that page.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from apps.public_preview.manifest import REQUIRED_PAGES

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
COMPONENTS_DIR = ROOT / "templates" / "public_preview" / "components"
SECTION_RE = re.compile(r"<section\b", re.IGNORECASE)
INCLUDE_RE = re.compile(
    r'{%\s*include\s+["\']public_preview/components/(?P<component>[^"\']+)["\']'
)


def count_sections(source: str) -> int:
    return len(SECTION_RE.findall(source))


def component_section_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for path in COMPONENTS_DIR.glob("*.html"):
        count = count_sections(path.read_text(encoding="utf-8"))
        if count:
            counts[path.name] = count
    return counts


def effective_template_section_count(source: str, component_counts: dict[str, int]) -> int:
    total = count_sections(source)
    for match in INCLUDE_RE.finditer(source):
        total += component_counts.get(match.group("component"), 0)
    return total


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    source_root = args.source.resolve()

    component_counts = component_section_counts()
    failures: list[str] = []

    for page_name in REQUIRED_PAGES:
        source_path = source_root / page_name
        template_path = PAGES_DIR / page_name
        if not source_path.is_file():
            failures.append(f"{page_name}: approved source page missing")
            continue
        if not template_path.is_file():
            failures.append(f"{page_name}: Django child template missing")
            continue

        source_count = count_sections(source_path.read_text(encoding="utf-8"))
        template_count = effective_template_section_count(
            template_path.read_text(encoding="utf-8"), component_counts
        )
        if source_count != template_count:
            failures.append(
                f"{page_name}: source has {source_count} section(s), "
                f"Django output has {template_count} effective section(s)"
            )

    if failures:
        raise RuntimeError("Section preservation failed:\n- " + "\n- ".join(failures))

    print(
        f"Section preservation passed for {len(REQUIRED_PAGES)}/{len(REQUIRED_PAGES)} pages."
    )


if __name__ == "__main__":
    main()
