#!/usr/bin/env python3
"""Normalize imported canonical/structured-data URLs to production clean routes."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES  # noqa: E402

PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
PRODUCTION_ORIGIN = "https://ibtikartech.co"
PREVIEW_ORIGINS = (
    "https://ibtikar-tech-frontend-rc.dev-sakhr.chatgpt.site/site/",
    "https://ibtikar-tech-frontend-rc.dev-sakhr.chatgpt.site/site",
)


def clean_url_tag(page_name: str) -> str:
    pattern_name = PAGE_URL_NAMES[page_name]
    return f"{PRODUCTION_ORIGIN}{{% url '{pattern_name}' %}}"


def normalize_page(page_name: str) -> int:
    path = PAGES_DIR / page_name
    source = path.read_text(encoding="utf-8")
    updated = source
    replacements = 0

    for target_page in REQUIRED_PAGES:
        pattern_name = PAGE_URL_NAMES.get(target_page)
        if not pattern_name:
            continue
        clean = clean_url_tag(target_page)
        candidates = {
            f"{PRODUCTION_ORIGIN}/{target_page}",
            *(f"{origin.rstrip('/')}/{target_page}" for origin in PREVIEW_ORIGINS),
        }
        for candidate in candidates:
            count = updated.count(candidate)
            if count:
                updated = updated.replace(candidate, clean)
                replacements += count

    if updated != source:
        path.write_text(updated, encoding="utf-8")
    return replacements


def main() -> None:
    total = sum(normalize_page(page_name) for page_name in REQUIRED_PAGES)
    print(f"Normalized {total} canonical/structured-data URL reference(s).")


if __name__ == "__main__":
    main()
