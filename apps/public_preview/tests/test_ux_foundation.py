from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[3]
BASE_TEMPLATE = BASE_DIR / "templates" / "public_preview" / "base.html"
TYPOGRAPHY_SYSTEM = (
    BASE_DIR
    / "static"
    / "public_preview"
    / "assets"
    / "css"
    / "pages"
    / "typography-system.css"
)


def test_public_base_loads_one_canonical_typography_system():
    source = BASE_TEMPLATE.read_text(encoding="utf-8")

    assert source.count("typography-system.css") == 1
    assert "typography-scale-refinement-v1.css" not in source
    assert "typography-scale-refinement-v2.css" not in source


def test_canonical_typography_system_keeps_required_responsive_roles():
    source = TYPOGRAPHY_SYSTEM.read_text(encoding="utf-8")

    required_roles = (
        "--ibt-type-hero",
        "--ibt-type-section",
        "--ibt-type-section-compact",
        "--ibt-type-card",
        "--ibt-type-lead",
        "--ibt-type-copy",
    )
    for role in required_roles:
        assert role in source

    assert "@media (max-width: 1024px)" in source
    assert "@media (max-width: 820px)" in source
    assert "@media (max-width: 560px)" in source
    assert "@media (max-width: 520px)" in source


def test_shared_related_services_runtime_is_deferred():
    source = BASE_TEMPLATE.read_text(encoding="utf-8")

    assert "public_preview/assets/js/service-related-cards.js' %}\" defer>" in source
