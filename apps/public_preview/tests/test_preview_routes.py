import re
from pathlib import Path

import pytest
from django.conf import settings
from django.urls import reverse

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES, RETIRED_PLATFORM_PAGES


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
def test_services_public_index_is_clean_and_database_catalog_is_preserved(client):
    public_response = client.get(reverse("services:index"))
    catalog_response = client.get(reverse("services:catalog"))

    assert reverse("services:index") == "/services/"
    assert reverse("services:catalog") == "/services/catalog/"
    assert public_response.status_code == 200
    assert catalog_response.status_code == 200


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


def test_imported_pages_extend_shared_base_without_duplicate_shell():
    pages_dir = Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages"

    for page_name in REQUIRED_PAGES:
        source = (pages_dir / page_name).read_text(encoding="utf-8")
        assert source.lstrip().startswith('{% extends "public_preview/base.html" %}')
        assert 'id="ibtikarSiteHeader"' not in source
        assert 'class="ibt-shell-footer"' not in source


def test_repeated_public_structures_use_shared_includes():
    pages_dir = Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages"
    combined = "\n".join(
        (pages_dir / page_name).read_text(encoding="utf-8") for page_name in REQUIRED_PAGES
    )

    assert combined.count('include "public_preview/components/breadcrumbs.html"') >= 3
    assert combined.count('include "public_preview/components/section_heading.html"') >= 3
    assert combined.count('include "public_preview/components/page_cta.html"') >= 1


def test_shared_public_components_keep_django_autoescaping_enabled():
    components_dir = Path(settings.BASE_DIR) / "templates" / "public_preview" / "components"
    reusable = ("breadcrumbs.html", "section_heading.html", "page_cta.html")

    for filename in reusable:
        source = (components_dir / filename).read_text(encoding="utf-8")
        assert "|safe" not in source
        assert "{% autoescape off %}" not in source
