#!/usr/bin/env python3
"""Verify approved structure while allowing explicitly owned conversion copy."""

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

# These pages own their conversion copy in Django. Changes remain covered by
# template-contract and product tests; this guard still protects every other
# imported page from accidental drift.
CONTENT_OVERRIDE_PAGES = {
    "index.html",
    "contact.html",
    "services.html",
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    "tharaa.html",
    "store-launch.html",
    "storefront-customization.html",
    "store-redesign.html",
    "product-page-optimization.html",
    "ecommerce-growth.html",
    "ecommerce-support.html",
}

# Intentional decision-support sections added after the source import.
SECTION_COUNT_DELTAS = {"index.html": 2, "tharaa.html": 1}


def normalize_text(value: str) -> str:
    value = DJANGO_TAG_RE.sub("", value)
    return WHITESPACE_RE.sub(" ", value).strip()


class TagTextCollector(HTMLParser):
    """Collect normalized text for each occurrence of one HTML tag."""

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


def describe_text_difference(expected: str, actual: str) -> str:
    limit = min(len(expected), len(actual))
    position = next((i for i in range(limit) if expected[i] != actual[i]), limit)
    start = max(0, position - 60)
    end = position + 100
    return (
        f"text differs near character {position}; "
        f"source={expected[start:end]!r}, Django={actual[start:end]!r}"
    )


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
        expected_template_count = source_count + SECTION_COUNT_DELTAS.get(page_name, 0)
        if template_count != expected_template_count:
            failures.append(
                f"{page_name}: source has {source_count} section(s), "
                f"Django template has {template_count} section(s), "
                f"expected {expected_template_count}"
            )
            continue

        source_main = extract_tag_texts(source, "main")
        template_main = extract_tag_texts(template, "main")
        if len(source_main) != len(template_main):
            failures.append(
                f"{page_name}: main count differs: "
                f"source={len(source_main)}, Django={len(template_main)}"
            )
            continue
        if not source_main or page_name in CONTENT_OVERRIDE_PAGES:
            continue
        if source_main[0] != template_main[0]:
            failures.append(
                f"{page_name}: main content "
                + describe_text_difference(source_main[0], template_main[0])
            )

    if failures:
        raise RuntimeError("Public content preservation failed:\n- " + "\n- ".join(failures))

    print(
        "Section count and main-content preservation passed for "
        f"{len(REQUIRED_PAGES)}/{len(REQUIRED_PAGES)} pages."
    )


if __name__ == "__main__":
    main()
