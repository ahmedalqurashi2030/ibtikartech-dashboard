import re
from pathlib import Path

import pytest
from django.conf import settings
from django.urls import reverse

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES, RETIRED_PLATFORM_PAGES
from apps.public_preview.template_contract import (
    BASE_TEMPLATE_PARENT,
    FAMILY_ALLOWED_PARTIALS,
    FAMILY_REQUIRED_BLOCKS,
    extends_tag,
    page_parent,
)

PLATFORM_FAMILY_PAGES = (
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    "about.html",
)

SERVICE_CATEGORY_PAGES = (
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
)

ARTICLE_DETAIL_PAGES = (
    "article-product-page.html",
    "article-store-launch.html",
    "article-store-redesign.html",
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


def _component_source(component_name: str) -> str:
    return (
        Path(settings.BASE_DIR)
        / "templates"
        / "public_preview"
        / "components"
        / component_name
    ).read_text(encoding="utf-8")


def _family_source(parent: str) -> str:
    return (
        Path(settings.BASE_DIR) / "templates" / parent
    ).read_text(encoding="utf-8")


def _effective_page_source(page_name: str) -> str:
    source = _page_source(page_name)
    parent = page_parent(page_name)
    if parent == BASE_TEMPLATE_PARENT:
        return source
    return f"{_family_source(parent)}\n{source}"


def test_imported_pages_follow_approved_inheritance_without_duplicate_shell():
    include_pattern = re.compile(r'{%\s*include\s+"([^"]+)"')

    for page_name in REQUIRED_PAGES:
        source = _page_source(page_name)
        assert source.lstrip().startswith(extends_tag(page_parent(page_name)))
        assert 'id="ibtikarSiteHeader"' not in source
        assert 'class="ibt-shell-footer"' not in source
        assert "public_preview/components/" not in source

    for parent in FAMILY_REQUIRED_BLOCKS:
        family = _family_source(parent)
        assert family.lstrip().startswith(extends_tag(BASE_TEMPLATE_PARENT))
        assert 'id="ibtikarSiteHeader"' not in family
        assert 'class="ibt-shell-footer"' not in family

        allowed_partials = set(FAMILY_ALLOWED_PARTIALS[parent])
        actual_partials = include_pattern.findall(family)
        assert set(actual_partials) <= allowed_partials
        for partial in allowed_partials:
            assert actual_partials.count(partial) == 1


def test_global_shell_is_composed_from_shared_template_includes():
    base = (
        Path(settings.BASE_DIR) / "templates" / "public_preview" / "base.html"
    ).read_text(encoding="utf-8")
    header = _component_source("header.html")
    mobile_menu = _component_source("mobile_menu.html")
    footer = _component_source("footer.html")
    document_head = _component_source("document_head.html")

    assert 'include "public_preview/components/document_head.html"' in base
    assert 'include "public_preview/components/header.html"' in base
    assert 'include "public_preview/components/footer.html"' in base
    assert 'id="ibtikarSiteHeader"' not in base
    assert 'class="ibt-shell-footer"' not in base

    assert 'id="ibtikarSiteHeader"' in header
    assert 'include "public_preview/components/mobile_menu.html"' in header
    assert 'id="ibtikarMobileMenu"' in mobile_menu
    assert 'class="ibt-shell-footer"' in footer

    assert "classList.remove('no-js')" in document_head
    assert "classList.add('js-ready')" in document_head


def test_platform_family_pages_share_one_section_structure_contract():
    """Platform pages and category pages share core shell and semantic section roles."""
    for page_name in PLATFORM_FAMILY_PAGES:
        source = _effective_page_source(page_name)
        assert '<main id="main-content"' in source
        assert "service-reference" in source or "platform-hero" in source

    category_pages = SERVICE_CATEGORY_PAGES
    for page_name in category_pages:
        source = _effective_page_source(page_name)
        assert '<main id="main-content" class="service-reference">' in source
        assert 'class="hero"' in source
        assert 'section-kicker' in source
        assert 'service-paths-section' in source
        assert 'service-path-card reveal' in source
        assert 'service-path-card__fit' in source
        assert 'service-path-card__scope' in source
        assert 'service-path-card__action' in source
        assert "مناسب عندما" in source
