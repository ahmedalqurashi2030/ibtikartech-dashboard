#!/usr/bin/env python3
"""Guard the public frontend as a single-repository Dashboard-owned surface.

`ibtikartech-dashboard` is the authoritative source for the deployed public site.
This check intentionally blocks reintroducing an external frontend import pipeline
that could overwrite committed Django templates or production-served assets.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from apps.public_preview.manifest import REQUIRED_PAGES, RETIRED_PLATFORM_PAGES  # noqa: E402

MANIFEST_PATH = ROOT / "docs" / "frontend-preview-manifest.json"
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"
ASSETS_DIR = ROOT / "static" / "public_preview" / "assets"

RETIRED_EXTERNAL_IMPORT_PATHS = (
    ROOT / "scripts" / "import_frontend_preview.py",
    ROOT / "scripts" / "verify_public_section_preservation.py",
    ROOT / ".github" / "workflows" / "frontend-preview-import.yml",
)

REQUIRED_OWNED_ASSETS = (
    "css/ibtikar-shell.css",
    "js/page-shell.js",
    "js/ibtikar-shell.js",
    "js/services-experience.js",
    "js/source-services.js",
    "js/service-related-cards.js",
    "css/pages/service-related-cards.css",
)


def fail(message: str) -> None:
    raise RuntimeError(message)


def verify_manifest() -> None:
    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if data.get("source_repository") != "ahmedalqurashi2030/ibtikartech-dashboard":
        fail("Frontend manifest must identify ibtikartech-dashboard as the authoritative source.")
    if data.get("source_ref") != "main":
        fail("Frontend manifest source_ref must be main.")
    if data.get("mode") != "dashboard-authoritative":
        fail("Frontend manifest mode must be dashboard-authoritative.")
    if data.get("external_frontend_import") is not False:
        fail("Frontend manifest must explicitly disable external_frontend_import.")
    if tuple(data.get("required_pages", ())) != tuple(REQUIRED_PAGES):
        fail("Frontend manifest required_pages drifted from apps.public_preview.manifest.")
    if tuple(data.get("retired_platform_pages", ())) != tuple(RETIRED_PLATFORM_PAGES):
        fail("Frontend manifest retired_platform_pages drifted from apps.public_preview.manifest.")


def verify_retired_importers_are_absent() -> None:
    restored = [str(path.relative_to(ROOT)) for path in RETIRED_EXTERNAL_IMPORT_PATHS if path.exists()]
    if restored:
        fail("External frontend import paths must stay retired: " + ", ".join(restored))


def verify_dashboard_owned_pages() -> None:
    missing: list[str] = []
    invalid: list[str] = []
    for page_name in REQUIRED_PAGES:
        path = PAGES_DIR / page_name
        if not path.is_file():
            missing.append(page_name)
            continue
        source = path.read_text(encoding="utf-8")
        if not source.lstrip().startswith('{% extends "public_preview/base.html" %}'):
            invalid.append(f"{page_name}: missing public_preview/base.html inheritance")
        if source.count("{% block body %}") != 1:
            invalid.append(f"{page_name}: expected exactly one body block")
        if "{% block content %}" in source or "page_scripts" in source:
            invalid.append(f"{page_name}: legacy template block contract returned")
    if missing:
        fail("Dashboard-owned public pages missing: " + ", ".join(missing))
    if invalid:
        fail("Dashboard-owned public page contract failed:\n- " + "\n- ".join(invalid))


def verify_dashboard_owned_assets() -> None:
    missing = [relative for relative in REQUIRED_OWNED_ASSETS if not (ASSETS_DIR / relative).is_file()]
    if missing:
        fail("Dashboard-owned frontend assets missing: " + ", ".join(missing))


def verify_no_external_frontend_clone_contract() -> None:
    # Build the old repository token dynamically so this guard does not trigger itself.
    old_repo = "ahmedalqurashi2030/" + "ibtikartech"
    forbidden = (
        old_repo + ".git",
        "/tmp/ibtikartech-source",
        "--source /tmp/ibtikartech-source",
    )
    candidates = [
        *sorted((ROOT / ".github" / "workflows").glob("*.yml")),
        *sorted((ROOT / ".github" / "workflows").glob("*.yaml")),
        *sorted((ROOT / "scripts").glob("*.py")),
    ]
    this_file = Path(__file__).resolve()
    violations: list[str] = []
    for path in candidates:
        if path.resolve() == this_file:
            continue
        text = path.read_text(encoding="utf-8")
        for marker in forbidden:
            if marker in text:
                violations.append(f"{path.relative_to(ROOT)} contains retired external marker {marker!r}")
    if violations:
        fail("External frontend ownership returned:\n- " + "\n- ".join(violations))


def main() -> None:
    verify_manifest()
    verify_retired_importers_are_absent()
    verify_dashboard_owned_pages()
    verify_dashboard_owned_assets()
    verify_no_external_frontend_clone_contract()
    print(
        "Dashboard frontend ownership verified: "
        f"{len(REQUIRED_PAGES)} pages and {len(REQUIRED_OWNED_ASSETS)} canonical assets are repository-owned."
    )


if __name__ == "__main__":
    main()
