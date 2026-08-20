import re
from pathlib import Path

from django.conf import settings
from django.urls import reverse
import pytest

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES, RETIRED_PLATFORM_PAGES


PLATFORM_FAMILY_PAGES = (
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    "about.html",
)

SERVICE_DETAIL_PAGES = (
    "store-launch.html",
    "storefront-customization.html",
    "store-redesign.html",
    "product-page-optimization.html",
    "ecommerce-growth.html",
    "ecommerce-support.html",
)

SERVICE_DECISION_KEYS = ("problems", "fit", "scope", "deliverables", "exclusions")


@pytest.mark.django_db
@pytest.mark.parametrize("page_name,pattern_name", PAGE_URL_NAMES.items())
def test_clean_named_public_routes_render(client, page_name, pattern_name):
    response = client.get(reverse(pattern_name))

    assert response.status_code == 200
    html = response.content.decode()
    assert html.count('id="ibtikarSiteHeader"') == 1
    assert html.count('class="ibt-shell-footer"') == 1
    assert "data-shell-header" not in html
    assert "data-shell-footer" not in html
    assert re.search(r'(?:href|action)="[^"]+\.html(?:[?#][^"]*)?"', html) is None


@pytest.mark.django_db
@pytest.mark.parametrize("page_name,pattern_name", PAGE_URL_NAMES.items())
def test_legacy_html_routes_permanently_redirect_to_clean_urls(client, page_name, pattern_name):
    response = client.get(f"/{page_name}", follow=False)

    assert response.status_code == 301
    assert response["Location"] == reverse(pattern_name)


@pytest.mark.django_db
def test_root_is_the_named_homepage(client):
    response = client.get(reverse("public_preview:home"))

    assert response.status_code == 200
    assert reverse("public_preview:home") == "/"


@pytest.mark.django_db
def test_services_public_index_is_explicit_and_not_model_catalog(client):
    public_response = client.get(reverse("services:index"))

    assert reverse("services:index") == "/services/"
    assert public_response.status_code == 200
    assert client.get("/services/catalog/").status_code == 404
    assert client.get("/services/a-random-model-slug/").status_code == 404


@pytest.mark.django_db
@pytest.mark.parametrize("retired_page", RETIRED_PLATFORM_PAGES)
def test_retired_platform_pages_are_not_restored(client, retired_page):
    response = client.get(f"/{retired_page}")
    assert response.status_code == 404


@pytest.mark.django_db
def test_public_pages_use_django_static_asset_prefix(client):
    response = client.get(reverse("services:index"))

    assert response.status_code == 200
    html = response.content.decode()
    assert "/static/public_preview/assets/" in html
    assert 'src="assets/' not in html
    assert 'href="assets/' not in html


def _page_source(page_name: str) -> str:
    return (
        Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages" / page_name
    ).read_text(encoding="utf-8")


def test_imported_pages_extend_shared_base_without_duplicate_shell():
    for page_name in REQUIRED_PAGES:
        source = _page_source(page_name)
        assert source.lstrip().startswith('{% extends "public_preview/base.html" %}')
        assert 'id="ibtikarSiteHeader"' not in source
        assert 'class="ibt-shell-footer"' not in source
        assert "public_preview/components/" not in source


def test_global_shell_html_lives_directly_in_base_template():
    base = (Path(settings.BASE_DIR) / "templates" / "public_preview" / "base.html").read_text(
        encoding="utf-8"
    )

    assert 'id="ibtikarSiteHeader"' in base
    assert 'class="ibt-shell-footer"' in base
    assert "public_preview/components/" not in base


def test_platform_family_pages_share_one_section_structure_contract():
    """Same-function sections in platform-family pages use one DOM vocabulary."""
    for page_name in PLATFORM_FAMILY_PAGES:
        source = _page_source(page_name)
        assert '<main id="main-content">' in source
        assert '<section class="platform-hero">' in source
        assert 'class="container platform-hero__grid"' in source
        assert 'class="platform-heading reveal"' in source
        assert 'class="section-kicker"' in source
        assert '<section class="page-cta">' in source
        assert 'class="cta-card reveal"' in source
        assert 'class="cta-actions"' in source


def test_service_detail_pages_share_one_structural_contract():
    """All explicit commerce service pages use one shell, hero, tabs and panel DOM."""
    forbidden_legacy_markers = (
        'class="service-page"',
        'class="svc-container"',
        'class="svc-breadcrumb"',
        'class="svc-hero',
        'class="quick-info"',
        'class="decision-tabs',
        'data-decision-tab=',
        'data-decision-panel=',
        'class="svc-section',
        'class="svc-heading',
    )

    for page_name in SERVICE_DETAIL_PAGES:
        source = _page_source(page_name)

        assert '<main id="main-content" class="service-detail-main">' in source
        assert 'class="service-detail-shell"' in source
        assert 'class="service-detail-breadcrumb"' in source
        assert 'class="service-commerce-hero"' in source
        assert 'class="service-commerce-hero__card" data-service-commerce-hero' in source
        assert 'class="service-gallery"' in source
        assert 'class="service-gallery__main" data-service-gallery-main' in source
        assert 'data-service-gallery-src=' in source
        assert 'class="service-commerce-copy"' in source
        assert 'class="service-detail-badge"' in source
        assert 'class="service-platform-chips"' in source
        assert 'class="service-purchase-box"' in source
        assert 'class="service-assurance"' in source
        assert 'class="service-commerce-actions"' in source
        assert 'class="service-quick-info"' in source
        assert 'class="service-decision-nav"' in source
        decision_tabs_marker = (
            'class="service-detail-shell service-decision-tabs" '
            'data-service-decision-tabs'
        )
        assert decision_tabs_marker in source
        assert 'class="service-detail-heading"' in source
        assert 'class="page-cta"' in source
        assert 'commerce-service-detail.js' in source

        for key in SERVICE_DECISION_KEYS:
            assert f'data-service-decision-tab="{key}"' in source
            assert f'data-service-decision-panel="{key}"' in source

        for marker in forbidden_legacy_markers:
            assert marker not in source


def test_service_detail_pages_keep_equivalent_panel_grid_vocabulary():
    """Equivalent decision sections use the same grid/list class names across services."""
    expected_markers = (
        'class="service-problem-grid"',
        'class="service-fit-grid"',
        'class="service-scope-grid"',
        'class="service-deliverable-grid"',
        'class="service-exclusion-list"',
    )
    for page_name in SERVICE_DETAIL_PAGES:
        source = _page_source(page_name)
        for marker in expected_markers:
            assert marker in source


def test_page_sections_are_inline_not_component_includes():
    combined = "\n".join(_page_source(page_name) for page_name in REQUIRED_PAGES)

    assert "public_preview/components/" not in combined
    assert "{% include " not in combined
