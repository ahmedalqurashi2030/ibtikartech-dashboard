from pathlib import Path

BASE_TEMPLATE = Path("templates/public_preview/base.html")
UX_SYSTEM = Path("static/public_preview/assets/css/pages/ux-system-v1.css")
SHELL = Path("static/public_preview/assets/css/ibtikar-shell.css")
TYPOGRAPHY = Path("static/public_preview/foundation/typography-system.css")
SERVICE_DETAIL_FAMILY = Path("templates/public_preview/families/service_detail_base.html")


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def test_global_ux_layer_does_not_own_the_shared_shell():
    source = _read(UX_SYSTEM)

    for selector in (
        ".ibt-shell-header",
        ".ibt-shell-nav",
        ".ibt-shell-desktop-nav",
        ".ibt-shell-mega",
        ".ibt-shell-mobile-menu",
        ".ibt-mobile-backdrop",
        ".ibt-mobile-menu-head",
        ".ibt-mobile-menu-close",
        ".ibt-shell-footer",
    ):
        assert selector not in source


def test_global_ux_layer_consumes_layout_tokens_without_reclaiming_components():
    source = _read(UX_SYSTEM)

    for retired in (
        "--ibt-ux-gutter",
        "--ibt-ux-reading",
        "--ibt-ux-radius-sm",
        "--ibt-ux-radius-md",
        "--ibt-ux-radius-lg",
        "--ibt-ux-control-h",
    ):
        assert retired not in source

    assert "var(--ibt-gutter)" in source
    # Component geometry belongs to tokens/base/components, not this transitional
    # page-rhythm layer. Keeping these out prevents a second design system.
    assert "var(--ibt-control-h)" not in source
    assert "var(--ibt-radius-panel)" not in source
    assert "var(--ibt-radius-control)" not in source


def test_shared_shell_owns_effective_navigation_and_reduced_motion_rules():
    source = _read(SHELL)

    assert "Canonical effective shell refinements" in source
    assert "width: min(390px, calc(100vw - 12px));" in source
    assert "height: 100dvh;" in source
    assert "min-height: var(--ibt-target-min) !important;" in source
    assert "@media (prefers-reduced-motion: reduce)" in source


def test_service_detail_children_inherit_the_canonical_shell_from_base():
    base = _read(BASE_TEMPLATE)
    family = _read(SERVICE_DETAIL_FAMILY)
    shell_asset = "public_preview/assets/css/ibtikar-shell.css"

    assert family.lstrip().startswith('{% extends "public_preview/base.html" %}')
    assert shell_asset not in family
    assert base.count(shell_asset) == 1


def test_arabic_heading_spacing_override_is_after_responsive_rules():
    source = _read(TYPOGRAPHY)
    override = 'html[lang="ar"] body:not(.article-page) main :is(h1, h2, h3)'

    assert override in source
    assert source.rfind(override) > source.rfind("@media (max-width: 520px)")
    tail = source[source.rfind(override):]
    assert "letter-spacing: 0 !important;" in tail
