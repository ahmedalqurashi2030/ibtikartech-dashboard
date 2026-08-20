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


def test_imported_pages_extend_shared_base_without_duplicate_shell():
    pages_dir = Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages"

    for page_name in REQUIRED_PAGES:
        source = (pages_dir / page_name).read_text(encoding="utf-8")
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


def test_repeated_sections_keep_canonical_html_inside_each_page():
    pages_dir = Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages"
    combined = "\n".join(
        (pages_dir / page_name).read_text(encoding="utf-8") for page_name in REQUIRED_PAGES
    )

    assert "public_preview/components/" not in combined

    breadcrumb_openings = combined.count('<nav class="breadcrumbs" aria-label="مسار التنقل">')
    breadcrumb_contract = re.compile(
        r'<nav class="breadcrumbs" aria-label="مسار التنقل">\s*'
        r'<a href="\{% url \'public_preview:home\' %\}">الرئيسية</a>\s*'
        r'<span aria-hidden="true">←</span>\s*'
        r'<span aria-current="page">[^<]+</span>\s*'
        r'</nav>',
        re.DOTALL,
    )
    assert breadcrumb_openings >= 3
    assert len(breadcrumb_contract.findall(combined)) == breadcrumb_openings

    heading_openings = combined.count('<div class="platform-heading reveal">')
    heading_contract = re.compile(
        r'<div class="platform-heading reveal">\s*'
        r'<span class="section-kicker">[^<]+</span>\s*'
        r'<h2>[^<]+</h2>\s*'
        r'<p>[^<]+</p>\s*'
        r'</div>',
        re.DOTALL,
    )
    assert heading_openings >= 3
    assert len(heading_contract.findall(combined)) == heading_openings

    cta_openings = combined.count('<section class="page-cta">')
    cta_contract = re.compile(
        r'<section class="page-cta">\s*<div class="container">\s*'
        r'<div class="cta-card reveal">\s*<div>\s*'
        r'<span class="section-kicker">.*?</span>\s*<h2>.*?</h2>\s*<p>.*?</p>\s*'
        r'</div>\s*<div class="cta-actions">.*?</div>\s*</div>\s*</div>\s*</section>',
        re.DOTALL,
    )
    assert cta_openings >= 1
    assert len(cta_contract.findall(combined)) == cta_openings
