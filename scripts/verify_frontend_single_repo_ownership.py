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

from apps.public_preview.asset_contract import (  # noqa: E402
    FAMILY_ASSET_EXTENSION_BLOCKS,
    ROUTE_SCOPED_ASSET_CONSUMERS,
)
from apps.public_preview.manifest import REQUIRED_PAGES, RETIRED_PLATFORM_PAGES  # noqa: E402
from apps.public_preview.template_contract import (  # noqa: E402
    BASE_TEMPLATE_PARENT,
    FAMILY_REQUIRED_BLOCKS,
    block_tag,
    extends_tag,
    page_parent,
)

MANIFEST_PATH = ROOT / "docs" / "frontend-preview-manifest.json"
TEMPLATES_DIR = ROOT / "templates" / "public_preview"
PAGES_DIR = TEMPLATES_DIR / "pages"
BASE_TEMPLATE = TEMPLATES_DIR / "base.html"
ASSETS_DIR = ROOT / "static" / "public_preview" / "assets"
OWNERSHIP_WORKFLOW = ROOT / ".github" / "workflows" / "frontend-ownership-qa.yml"

RETIRED_EXTERNAL_IMPORT_PATHS = (
    ROOT / "scripts" / "import_frontend_preview.py",
    ROOT / "scripts" / "verify_public_section_preservation.py",
    ROOT / ".github" / "workflows" / "frontend-preview-import.yml",
    ROOT / ".github" / "workflows" / "frontend-refinement-import-qa.yml",
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
    if not OWNERSHIP_WORKFLOW.is_file():
        fail("Frontend Ownership QA workflow is missing.")


def verify_dashboard_owned_pages() -> None:
    missing: list[str] = []
    invalid: list[str] = []
    for page_name in REQUIRED_PAGES:
        path = PAGES_DIR / page_name
        if not path.is_file():
            missing.append(page_name)
            continue
        source = path.read_text(encoding="utf-8")
        parent = page_parent(page_name)
        if not source.lstrip().startswith(extends_tag(parent)):
            invalid.append(f"{page_name}: missing approved {parent} inheritance")
        expected_body_blocks = 1 if parent == BASE_TEMPLATE_PARENT else 0
        if source.count("{% block body %}") != expected_body_blocks:
            invalid.append(
                f"{page_name}: expected {expected_body_blocks} body block(s)"
            )
        if "{% block content %}" in source or "page_scripts" in source:
            invalid.append(f"{page_name}: legacy template block contract returned")

    for parent in FAMILY_REQUIRED_BLOCKS:
        family = ROOT / "templates" / parent
        if not family.is_file():
            missing.append(parent)
        elif not family.read_text(encoding="utf-8").lstrip().startswith(
            extends_tag(BASE_TEMPLATE_PARENT)
        ):
            invalid.append(f"{parent}: family must extend {BASE_TEMPLATE_PARENT}")

    if missing:
        fail("Dashboard-owned public templates missing: " + ", ".join(missing))
    if invalid:
        fail("Dashboard-owned public page contract failed:\n- " + "\n- ".join(invalid))


def verify_dashboard_owned_assets() -> None:
    missing = [relative for relative in REQUIRED_OWNED_ASSETS if not (ASSETS_DIR / relative).is_file()]
    if missing:
        fail("Dashboard-owned frontend assets missing: " + ", ".join(missing))





def block_payload(source: str, block_name: str) -> str | None:
    opener = block_tag(block_name)
    start = source.find(opener)
    if start < 0:
        return None
    body_start = start + len(opener)
    end = source.find("{% endblock %}", body_start)
    if end < 0:
        fail(f"Unclosed template block: {block_name}")
    return source[body_start:end]


def effective_family_asset_count(
    page_source: str,
    family_source: str,
    parent: str,
    asset: str,
) -> int:
    block_name = FAMILY_ASSET_EXTENSION_BLOCKS.get(parent, {}).get(
        Path(asset).suffix
    )
    if block_name:
        override = block_payload(page_source, block_name)
        if override is not None:
            return override.count(asset)
        return family_source.count(asset)
    return page_source.count(asset) + family_source.count(asset)


def verify_route_scoped_asset_consumers() -> None:
    base_source = BASE_TEMPLATE.read_text(encoding="utf-8")
    family_sources = {
        parent: (ROOT / "templates" / parent).read_text(encoding="utf-8")
        for parent in FAMILY_REQUIRED_BLOCKS
    }
    invalid: list[str] = []

    for asset, expected_consumers in ROUTE_SCOPED_ASSET_CONSUMERS.items():
        if asset in base_source:
            invalid.append(f"{asset}: route-scoped asset returned to base.html")
        actual_consumers: set[str] = set()

        for page_name in REQUIRED_PAGES:
            page_source = (PAGES_DIR / page_name).read_text(encoding="utf-8")
            parent = page_parent(page_name)
            if parent == BASE_TEMPLATE_PARENT:
                effective_count = page_source.count(asset)
            else:
                effective_count = effective_family_asset_count(
                    page_source,
                    family_sources[parent],
                    parent,
                    asset,
                )

            if effective_count not in (0, 1):
                invalid.append(
                    f"{page_name}: expected zero or one effective {asset} reference, "
                    f"found {effective_count}"
                )
            elif effective_count == 1:
                actual_consumers.add(page_name)

        expected = set(expected_consumers)
        if actual_consumers != expected:
            missing = sorted(expected - actual_consumers)
            unexpected = sorted(actual_consumers - expected)
            invalid.append(
                f"{asset}: missing consumers={missing}, unexpected consumers={unexpected}"
            )

    if invalid:
        fail("Route-scoped frontend asset contract failed:\n- " + "\n- ".join(invalid))


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
    verify_route_scoped_asset_consumers()
    verify_no_external_frontend_clone_contract()
    print(
        "Dashboard frontend ownership verified: "
        f"{len(REQUIRED_PAGES)} pages, {len(FAMILY_REQUIRED_BLOCKS)} page families, "
        f"{len(REQUIRED_OWNED_ASSETS)} canonical assets, and "
        f"{len(ROUTE_SCOPED_ASSET_CONSUMERS)} route-scoped asset contracts "
        "are repository-owned."
    )


if __name__ == "__main__":
    main()
