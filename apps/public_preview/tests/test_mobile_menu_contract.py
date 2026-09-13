from pathlib import Path


MOBILE_MENU = Path("templates/public_preview/components/mobile_menu.html")


def _source() -> str:
    return MOBILE_MENU.read_text(encoding="utf-8")


def test_mobile_services_group_opens_for_solution_context():
    source = _source()

    assert "ns == 'services'" in source
    for route_name in (
        "ecommerce",
        "websites",
        "brand-content",
        "growth",
        "custom-systems",
    ):
        assert f"current == '{route_name}'" in source
    assert "<details class=\"ibt-shell-mobile-group\"" in source
    assert " open{% endif %}>" in source


def test_mobile_solution_links_expose_the_current_subsection():
    source = _source()

    assert 'class="is-active" aria-current="page"' in source
    assert "ns == 'services' and current != 'index'" in source
