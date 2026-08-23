BASE_TEMPLATE = "templates/public_preview/base.html"
DOCUMENT_HEAD = "templates/public_preview/components/document_head.html"
TYPOGRAPHY_SYSTEM = "static/public_preview/foundation/typography-system.css"
SHELL_RUNTIME = "static/public_preview/assets/js/ibtikar-shell.js"
RELATED_RUNTIME = "static/public_preview/assets/js/service-related-cards.js"
SERVICES_RUNTIME = "static/public_preview/assets/js/source-services.js"
SERVICES_EXPERIENCE = "static/public_preview/assets/js/services-experience.js"
HOME_SOURCE_RUNTIME = "static/public_preview/assets/js/source-home.js"
INTERACTION_QA = "scripts/interaction_qa_clean_urls.cjs"
BROWSER_QA = "scripts/browser_qa_clean_urls.cjs"


def _read_source(path):
    with open(path, encoding="utf-8") as source_file:
        return source_file.read()


def test_public_base_loads_one_stable_typography_system():
    source = _read_source(BASE_TEMPLATE)

    assert source.count("typography-system.css") == 1
    assert "public_preview/foundation/typography-system.css" in source
    assert "public_preview/assets/css/pages/typography-system.css" not in source
    assert "public_preview/dashboard/typography-system.css" not in source
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


def test_homepage_legacy_shell_is_removed_during_parse_without_losing_theme_restore():
    head_source = _read_source(DOCUMENT_HEAD)
    home_runtime = _read_source(HOME_SOURCE_RUNTIME)

    assert "[data-approved-legacy-shell], .ibtx-legacy-mobile-menu" in head_source
    assert "classList.contains('source-home')" in head_source
    assert "if (!onHomepage()) return" in head_source
    assert "MutationObserver" in head_source
    assert "observer.observe(document.documentElement" in head_source
    assert "removeLegacyShell(document)" in head_source
    assert "observer.disconnect()" in head_source
    assert "localStorage.getItem('ibtikar-theme')" in home_runtime


def test_shared_related_services_runtime_is_deferred_and_single_owned():
    base_source = _read_source(BASE_TEMPLATE)
    shell_source = _read_source(SHELL_RUNTIME)
    related_source = _read_source(RELATED_RUNTIME)

    expected = (
        "public_preview/assets/js/service-related-cards.js' %}\" "
        "defer></script>"
    )
    assert expected in base_source
    assert "relatedTracks" not in shell_source
    assert "ibt-related-track" not in shell_source
    assert "Product-like related-service sliders" not in shell_source

    assert "const relatedSelectors" in related_source
    assert "document.querySelector(relatedSelectors)" in related_source
    assert "categoryPages" not in related_source
    assert "body.dataset.page" not in related_source


def test_services_runtime_uses_dom_count_and_guards_optional_canvas():
    source = _read_source(SERVICES_RUNTIME)

    assert "String(items.length).padStart(2, '0')" in source
    assert "!canvas || typeof canvas.getContext !== 'function'" in source
    assert " / 06" not in source


def test_services_experience_matches_current_five_family_taxonomy():
    source = _read_source(SERVICES_EXPERIENCE)

    expected_order = (
        "mode:'store', index:'01'",
        "mode:'site', index:'02'",
        "mode:'brand', index:'03'",
        "mode:'growth', index:'04'",
        "mode:'app', index:'05'",
    )
    positions = [source.find(marker) for marker in expected_order]
    assert all(position >= 0 for position in positions)
    assert positions == sorted(positions)
    assert "PRIMARY_FAMILIES.length" in source
    assert "ستة محاور" not in source
    assert "mode:'auto', index:'06'" not in source


def test_browser_qa_validates_semantic_services_count_not_legacy_six():
    source = _read_source(BROWSER_QA)

    assert "servicesStageText" in source
    assert "String(metrics.servicesStageText || '').split('/')" in source
    assert "metrics.servicesAxes < 5" in source
    assert "stageTotal !== metrics.servicesAxes" in source
    assert "metrics.servicesAxes !== 6" not in source


def test_deep_interaction_qa_uses_live_contact_submission_contract():
    source = _read_source(INTERACTION_QA)

    assert "live local-test submission + reference" in source
    assert "وصل طلبك إلى الفريق" in source
    assert "رقم المرجع:" in source
    assert "ibtikar:lastBrief" not in source
    assert "Contact local draft failed" not in source
