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
import subprocess
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
UX_STYLESHEET_RELATIVE = Path("css/pages/ux-system-v1.css")
UX_STYLESHEET_URL = f"{STATIC_PREFIX}{UX_STYLESHEET_RELATIVE.as_posix()}"
UX_STYLESHEET_ID = "ibtikar-ux-system-v1"
DASHBOARD_GLOBAL_STYLESHEETS = (
    (
        "/static/public_preview/dashboard/service-category-refinement-v1.css",
        "ibtikar-service-category-refinement-v1",
    ),
)
DASHBOARD_REFINEMENT_LOADERS = (
    (
        "source-home",
        "/static/public_preview/dashboard/homepage-refinement-v1.css",
        "ibtikar-homepage-refinement-v1",
    ),
    (
        "source-services",
        "/static/public_preview/dashboard/services-refinement-v1.css",
        "ibtikar-services-refinement-v1",
    ),
    (
        "source-ecommerce",
        "/static/public_preview/dashboard/ecommerce-refinement-v1.css",
        "ibtikar-ecommerce-refinement-v1",
    ),
    (
        "source-tharaa",
        "/static/public_preview/dashboard/tharaa-refinement-v1.css",
        "ibtikar-tharaa-refinement-v1",
    ),
)


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


def preserve_dashboard_ux_stylesheet(assets_dir: Path) -> str | None:
    """Keep the dashboard-owned UX layer when imported source assets are replaced."""
    stylesheet = assets_dir / UX_STYLESHEET_RELATIVE
    if not stylesheet.is_file():
        return None
    return stylesheet.read_text(encoding="utf-8")


def restore_dashboard_ux_stylesheet(assets_dir: Path, content: str | None) -> None:
    if content is None:
        return
    stylesheet = assets_dir / UX_STYLESHEET_RELATIVE
    stylesheet.parent.mkdir(parents=True, exist_ok=True)
    stylesheet.write_text(content, encoding="utf-8")


def patch_dashboard_ux_loaders(assets_dir: Path) -> None:
    """Restore shared and page-specific dashboard UX loaders after source imports."""
    js_path = assets_dir / "js" / "page-shell.js"
    if not js_path.is_file():
        raise RuntimeError("page-shell.js is missing; refusing to drop dashboard UX loaders.")

    js = js_path.read_text(encoding="utf-8")
    script_marker = "  const ensureScript = (src, datasetKey) => {"
    load_marker = "  const loadEnhancements = () => {"
    if script_marker not in js or load_marker not in js:
        raise RuntimeError("page-shell.js changed; refusing an unsafe UX loader patch.")

    if "const ensureStylesheet = (href, id) =>" not in js:
        stylesheet_helper = '''  const ensureStylesheet = (href, id) => {
    if (document.getElementById(id) || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

'''
        js = js.replace(script_marker, stylesheet_helper + script_marker, 1)

    loader_lines: list[str] = []
    if UX_STYLESHEET_ID not in js:
        loader_lines.extend(
            [
                "  // Dashboard-owned final UI/UX layer; presentation only.",
                f"  ensureStylesheet('{UX_STYLESHEET_URL}', '{UX_STYLESHEET_ID}');",
            ]
        )

    for url, stylesheet_id in DASHBOARD_GLOBAL_STYLESHEETS:
        if stylesheet_id in js:
            continue
        loader_lines.append(f"  ensureStylesheet('{url}', '{stylesheet_id}');")

    if loader_lines:
        loader_lines.append("")

    for body_class, url, stylesheet_id in DASHBOARD_REFINEMENT_LOADERS:
        if stylesheet_id in js:
            continue
        loader_lines.extend(
            [
                f"  if (document.body.classList.contains('{body_class}')) {{",
                f"    ensureStylesheet('{url}', '{stylesheet_id}');",
                "  }",
            ]
        )

    if loader_lines:
        loader_block = "\n".join(loader_lines).rstrip() + "\n\n"
        js = js.replace(load_marker, loader_block + load_marker, 1)

    js_path.write_text(js, encoding="utf-8")


def patch_dashboard_journey_alignment(assets_dir: Path) -> None:
    """Keep the approved Journey film aligned with the visual reference.

    The first narrative beat remains available, but the visual timeline gets a
    controlled lead so the large identity/browser composition appears earlier,
    matching the approved homepage rhythm.
    """
    js_path = assets_dir / "js" / "source-home.js"
    js = js_path.read_text(encoding="utf-8")
    old_progress = '''  const getProgress=()=>{
    const rect=story.getBoundingClientRect();
    const scrollable=Math.max(1,story.offsetHeight-innerHeight);
    return clamp((-rect.top)/scrollable);
  };'''
    new_progress = '''  // JOURNEY_REFERENCE_ALIGNMENT: preserve the narrative, but advance the
  // cinematic composition slightly so the identity/browser scene arrives at
  // the same visual moment as the approved reference.
  const getProgress=()=>{
    const rect=story.getBoundingClientRect();
    const scrollable=Math.max(1,story.offsetHeight-innerHeight);
    const raw=clamp((-rect.top)/scrollable);
    const lead=.22;
    return clamp(lead+raw*(1-lead));
  };'''
    if 'JOURNEY_REFERENCE_ALIGNMENT' not in js:
        if old_progress not in js:
            raise RuntimeError('Journey progress engine changed; refusing unsafe patch.')
        js = js.replace(old_progress, new_progress, 1)
        js_path.write_text(js, encoding="utf-8")

    css_path = assets_dir / "css" / "pages" / "source-home.css"
    css = css_path.read_text(encoding="utf-8")
    css_marker = 'DASHBOARD JOURNEY REFERENCE ALIGNMENT 2026-08-20'
    if css_marker not in css:
        css += """

/* DASHBOARD JOURNEY REFERENCE ALIGNMENT 2026-08-20
   Keep the caption block slightly higher on desktop so the large visual
   composition owns the center of the viewport, matching the approved frame. */
@media (min-width:761px){
  body.source-home #journey .cinematic-story__captions{
    bottom:clamp(96px,15vh,156px);
  }
}
"""
        css_path.write_text(css, encoding="utf-8")


def resolve_source_commit(source_root: Path, explicit_commit: str | None) -> str:
    if explicit_commit:
        return explicit_commit
    try:
        return subprocess.check_output(
            ["git", "-C", str(source_root), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        raise RuntimeError(
            "Could not determine frontend source commit. Pass --source-commit explicitly."
        ) from None


def import_frontend(
    source_root: Path,
    destination_root: Path,
    source_commit: str | None = None,
) -> dict[str, object]:
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

    resolved_source_commit = resolve_source_commit(source_root, source_commit)
    pages_dir = destination_root / "templates" / "public_preview" / "pages"
    assets_dir = destination_root / "static" / "public_preview" / "assets"
    manifest_path = destination_root / "docs" / "frontend-preview-manifest.json"
    preserved_ux_stylesheet = preserve_dashboard_ux_stylesheet(assets_dir)

    if pages_dir.exists():
        shutil.rmtree(pages_dir)
    pages_dir.mkdir(parents=True, exist_ok=True)

    if assets_dir.exists():
        shutil.rmtree(assets_dir)
    shutil.copytree(source_assets, assets_dir)
    restore_dashboard_ux_stylesheet(assets_dir, preserved_ux_stylesheet)
    patch_runtime_assets(assets_dir)
    patch_dashboard_ux_loaders(assets_dir)
    patch_dashboard_journey_alignment(assets_dir)

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
        "source_commit": resolved_source_commit,
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
    parser.add_argument(
        "--source-commit",
        help="Exact frontend source commit. If omitted, infer it from the source Git checkout.",
    )
    args = parser.parse_args()

    manifest = import_frontend(
        args.source.resolve(),
        args.destination.resolve(),
        source_commit=args.source_commit,
    )
    print(
        f"Imported {len(manifest['required_pages'])} frontend pages "
        f"from {manifest['source_commit']}."
    )


if __name__ == "__main__":
    main()
