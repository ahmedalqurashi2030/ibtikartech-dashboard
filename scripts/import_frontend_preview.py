#!/usr/bin/env python3
"""Import the approved static Ibtikar Tech frontend into Django preview templates.

This importer intentionally keeps page HTML/CSS/JS static. It only replaces the
shared shell slots with Django includes and rewrites local asset URLs so the
preview can run from Django without binding content to business models yet.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

REQUIRED_PAGES = (
    "index.html",
    "services.html",
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    "tharaa.html",
    "portfolio.html",
    "knowledge.html",
    "article-product-page.html",
    "article-store-launch.html",
    "article-store-redesign.html",
    "about.html",
    "contact.html",
    "store-launch.html",
    "storefront-customization.html",
    "store-redesign.html",
    "product-page-optimization.html",
    "ecommerce-growth.html",
    "ecommerce-support.html",
    "404.html",
)

RETIRED_PLATFORM_PAGES = (
    "salla.html",
    "zid.html",
    "shopify.html",
    "woocommerce.html",
    "wordpress.html",
)

HEADER_INCLUDE = '{% include "public_preview/components/header.html" %}'
FOOTER_INCLUDE = '{% include "public_preview/components/footer.html" %}'
STATIC_PREFIX = "/static/public_preview/assets/"


def replace_shell_slot(source: str, attribute: str, replacement: str) -> str:
    pattern = re.compile(
        rf"<(?P<tag>[A-Za-z][A-Za-z0-9:-]*)\b(?=[^>]*\b{re.escape(attribute)}\b)[^>]*>\s*</(?P=tag)>",
        re.IGNORECASE,
    )
    updated, count = pattern.subn(replacement, source, count=1)
    if count != 1:
        raise RuntimeError(f"Expected exactly one {attribute} slot; found {count}.")
    return updated


def rewrite_asset_urls(source: str) -> str:
    return source.replace("assets/", STATIC_PREFIX)


def patch_runtime_assets(assets_dir: Path) -> None:
    for path in assets_dir.rglob("*.js"):
        text = path.read_text(encoding="utf-8")
        updated = text.replace("assets/", STATIC_PREFIX)
        if updated != text:
            path.write_text(updated, encoding="utf-8")


def import_frontend(source_root: Path, destination_root: Path) -> dict[str, object]:
    missing = [page for page in REQUIRED_PAGES if not (source_root / page).is_file()]
    if missing:
        raise RuntimeError(f"Source frontend is missing required page(s): {', '.join(missing)}")

    accidentally_restored = [
        page for page in RETIRED_PLATFORM_PAGES if (source_root / page).exists()
    ]
    if accidentally_restored:
        raise RuntimeError(
            "Retired platform pages unexpectedly exist in source: "
            + ", ".join(accidentally_restored)
        )

    source_assets = source_root / "assets"
    if not source_assets.is_dir():
        raise RuntimeError("Source frontend assets/ directory is missing.")

    pages_dir = destination_root / "templates" / "public_preview" / "pages"
    assets_dir = destination_root / "static" / "public_preview" / "assets"
    manifest_path = destination_root / "docs" / "frontend-preview-manifest.json"

    if pages_dir.exists():
        shutil.rmtree(pages_dir)
    pages_dir.mkdir(parents=True, exist_ok=True)

    if assets_dir.exists():
        shutil.rmtree(assets_dir)
    shutil.copytree(source_assets, assets_dir)
    patch_runtime_assets(assets_dir)

    imported_pages = []
    for page_name in REQUIRED_PAGES:
        html = (source_root / page_name).read_text(encoding="utf-8")
        if "data-shell-header" in html:
            html = replace_shell_slot(html, "data-shell-header", HEADER_INCLUDE)
        if "data-shell-footer" in html:
            html = replace_shell_slot(html, "data-shell-footer", FOOTER_INCLUDE)
        html = rewrite_asset_urls(html)
        html = (
            "{# TEMPORARY FRONTEND PREVIEW: static source preserved until data binding phase. #}\n"
            + html
        )
        (pages_dir / page_name).write_text(html, encoding="utf-8")
        imported_pages.append(page_name)

    manifest = {
        "source_repository": "ahmedalqurashi2030/ibtikartech",
        "source_ref": "main",
        "mode": "temporary-static-django-preview",
        "header_footer": "source-preserved-or-django-includes",
        "source_commit": "999845f48ddaf3ed59f49b1515ff9b94474141a1",
        "business_model_binding": False,
        "required_pages": imported_pages,
        "retired_platform_pages": list(RETIRED_PLATFORM_PAGES),
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--destination", type=Path, default=Path.cwd())
    args = parser.parse_args()

    manifest = import_frontend(args.source.resolve(), args.destination.resolve())
    print(f"Imported {len(manifest['required_pages'])} frontend pages.")


if __name__ == "__main__":
    main()
