#!/usr/bin/env python3
"""Verify the Django refactor preserves approved page sections and their content.

The approved frontend source is the content authority. Page sections remain as
full HTML inside each Django child template; this verifier does not account for
components/includes because section components are intentionally not part of the
public architecture.
"""

from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.public_preview.manifest import REQUIRED_PAGES  # noqa: E402

PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
SECTION_RE = re.compile(r"<section\b", re.IGNORECASE)
WHITESPACE_RE = re.compile(r"\s+")
DJANGO_TAG_RE = re.compile(r"{[%{#].*?[}%#]}", re.DOTALL)


def normalize_text(value: str) -> str:
    value = DJANGO_TAG_RE.sub("", value)
    return WHITESPACE_RE.sub(" ", value).strip()


class TagTextCollector(HTMLParser):
    """Collect normalized text for every occurrence of one HTML tag in start order."""

    def __init__(self, target_tag: str) -> None:
        super().__init__(convert_charrefs=True)
        self.target_tag = target_tag
        self.buffers: list[list[str]] = []
        self.open_targets: list[int] = []
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        if tag in {"script", "style"}:
            self.ignored_depth += 1
            return
        if tag == self.target_tag:
            index = len(self.buffers)
            self.buffers.append([])
            self.open_targets.append(index)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style"}:
            if self.ignored_depth:
                self.ignored_depth -= 1
            return
        if tag == self.target_tag and self.open_targets:
            self.open_targets.pop()

    def handle_data(self, data: str) -> None:
        if self.ignored_depth or not self.open_targets:
            return
        for index in self.open_targets:
            self.buffers[index].append(data)

    def values(self) -> list[str]:
        return [normalize_text(" ".join(parts)) for parts in self.buffers]


def extract_tag_texts(source: str, tag: str) -> list[str]:
    parser = TagTextCollector(tag)
    parser.feed(source)
    parser.close()
    return parser.values()


def first_difference(expected: list[str], actual: list[str]) -> str | None:
    if len(expected) != len(actual):
        return f"count differs: source={len(expected)}, Django={len(actual)}"
    for index, (left, right) in enumerate(zip(expected, actual, strict=True), start=1):
        if left != right:
            return (
                f"item {index} text differs; "
                f"source={left[:140]!r}, Django={right[:140]!r}"
            )
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    source_root = args.source.resolve()

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

        source = source_path.read_text(encoding="utf-8")
        template = template_path.read_text(encoding="utf-8")

        source_count = len(SECTION_RE.findall(source))
        template_count = len(SECTION_RE.findall(template))
        if source_count != template_count:
            failures.append(
                f"{page_name}: source has {source_count} section(s), "
                f"Django template has {template_count} section(s)"
            )
            continue

        section_difference = first_difference(
            extract_tag_texts(source, "section"),
            extract_tag_texts(template, "section"),
        )
        if section_difference:
            failures.append(f"{page_name}: section content {section_difference}")
            continue

        # Main-level comparison also protects text that may legitimately sit
        # between sections while the global header/footer live in base.html.
        main_difference = first_difference(
            extract_tag_texts(source, "main"),
            extract_tag_texts(template, "main"),
        )
        if main_difference:
            failures.append(f"{page_name}: main content {main_difference}")

    if failures:
        raise RuntimeError("Public content preservation failed:\n- " + "\n- ".join(failures))

    print(
        "Section and main-content preservation passed for "
        f"{len(REQUIRED_PAGES)}/{len(REQUIRED_PAGES)} pages."
    )


if __name__ == "__main__":
    main()
