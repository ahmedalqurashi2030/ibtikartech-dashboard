BASE_TEMPLATE = "templates/public_preview/base.html"
COMPONENT_STYLES = "static/public_preview/assets/css/components.css"
INNER_STYLES = "static/public_preview/assets/css/pages/inner.css"
UX_SYSTEM = "static/public_preview/assets/css/pages/ux-system-v1.css"


def _read(path: str) -> str:
    with open(path, encoding="utf-8") as source_file:
        return source_file.read()


def test_public_base_loads_one_canonical_component_system():
    base = _read(BASE_TEMPLATE)
    inner = _read(INNER_STYLES)

    assert base.count("public_preview/assets/css/components.css") == 1
    assert "components.css" not in inner


def test_canonical_components_own_shared_interaction_contracts():
    source = _read(COMPONENT_STYLES)

    for marker in (
        "--ibt-component-border",
        ".btn-primary",
        ".platform-card",
        ".faq-item",
        ".form-message",
        ".cta-card",
        "@media (prefers-reduced-motion: reduce)",
    ):
        assert marker in source

    assert ":focus-visible" in source
    assert 'input:not([type="checkbox"])' in source
    assert "var(--ibt-target-min, 44px)" in source


def test_transitional_ux_layer_does_not_reclaim_component_ownership():
    source = _read(UX_SYSTEM)

    for retired_owner in (
        ":where(.btn, .button, .platform-button)",
        ":where(form)",
        ":where(.goal, .route-card, .service-item, .library-card)",
    ):
        assert retired_owner not in source
