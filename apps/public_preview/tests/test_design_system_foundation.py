TOKENS = "static/public_preview/assets/css/tokens.css"
BASE = "static/public_preview/assets/css/base.css"
COMPONENTS = "static/public_preview/assets/css/components.css"
HEADER = "templates/public_preview/components/header.html"
MOBILE_MENU = "templates/public_preview/components/mobile_menu.html"


def _read(path: str) -> str:
    with open(path, encoding="utf-8-sig") as source_file:
        return source_file.read()


def test_foundation_owns_interaction_and_layout_tokens():
    tokens = _read(TOKENS)

    for contract in (
        "--ibt-target-min: 44px;",
        "--ibt-control-h: 46px;",
        "--ibt-gutter: clamp(18px, 3vw, 28px);",
        "--ibt-reading: 68ch;",
        "--ibt-radius-control: 10px;",
        "--ibt-focus-width: 3px;",
        "--ibt-focus-offset: 3px;",
        "--ibt-gradient-action:",
    ):
        assert contract in tokens

    assert "@media (max-width: 760px)" in tokens
    assert "--ibt-gutter: 16px;" in tokens


def test_base_owns_focus_controls_reading_width_and_anchor_offset():
    base = _read(BASE)

    assert "outline: var(--ibt-focus-width) solid var(--ibt-focus-color);" in base
    assert "outline-offset: var(--ibt-focus-offset);" in base
    assert "min-height: var(--ibt-control-h);" in base
    assert "border-radius: var(--ibt-radius-control);" in base
    assert "max-width: var(--ibt-reading);" in base
    assert "var(--ibt-gutter) * 2" in base
    assert "scroll-margin-top: calc(var(--ibt-header-h) + 24px);" in base
    assert "scroll-margin-top: calc(var(--ibt-header-h) + 14px);" in base
    assert "@media (prefers-reduced-motion: reduce)" in base


def test_shared_components_do_not_shrink_compact_actions_below_target():
    components = _read(COMPONENTS)

    assert ".btn-small" in components
    assert "min-height: var(--ibt-target-min);" in components
    assert "min-height: 42px" not in components
    assert "touch-action: manipulation;" in components
    assert "@media (prefers-reduced-motion: reduce)" in components


def test_primary_actions_use_the_accessible_action_gradient():
    components = _read(COMPONENTS)

    assert "background: var(--ibt-gradient-action, var(--ibt-gradient));" in components
    primary_block = components.split(".btn-primary,", 1)[1].split(".btn-outline,", 1)[0]
    assert "color: #fff;" in primary_block
    assert "background: var(--ibt-gradient)" not in primary_block


def test_primary_navigation_has_one_justified_mega_menu():
    header = _read(HEADER)
    mobile = _read(MOBILE_MENU)

    # Services need discovery depth; the single-product destination does not.
    assert header.count("data-ibt-mega-menu") == 1
    assert header.count('aria-hidden="true" inert data-ibt-mega-menu') == 1
    assert header.count("data-ibt-mega-toggle") == 1
    assert 'data-nav-key="products"' in header
    assert ">منتجاتنا</a>" in header
    assert 'data-nav-key="products"' in mobile
    assert "منتجاتنا — ثيم ثراء" in mobile
