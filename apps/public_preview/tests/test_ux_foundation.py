BASE_TEMPLATE = "templates/public_preview/base.html"
TYPOGRAPHY_SYSTEM = "static/public_preview/dashboard/typography-system.css"


def _read_source(path):
    with open(path, encoding="utf-8") as source_file:
        return source_file.read()


def test_public_base_loads_one_protected_typography_system():
    source = _read_source(BASE_TEMPLATE)

    assert source.count("typography-system.css") == 1
    assert "public_preview/dashboard/typography-system.css" in source
    assert "public_preview/assets/css/pages/typography-system.css" not in source
    assert "typography-scale-refinement-v1.css" not in source
    assert "typography-scale-refinement-v2.css" not in source


def test_canonical_typography_system_keeps_required_responsive_roles():
    source = _read_source(TYPOGRAPHY_SYSTEM)

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
    source = _read_source(BASE_TEMPLATE)

    expected = (
        "public_preview/assets/js/service-related-cards.js' %}\" "
        "defer></script>"
    )
    assert expected in source
