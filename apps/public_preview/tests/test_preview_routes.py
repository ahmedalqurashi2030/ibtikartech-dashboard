import pytest

from apps.public_preview.manifest import CLEAN_ALIASES, REQUIRED_PAGES, RETIRED_PLATFORM_PAGES


@pytest.mark.django_db
@pytest.mark.parametrize("page_name", REQUIRED_PAGES)
def test_source_style_preview_routes_render(client, page_name):
    response = client.get(f"/{page_name}")

    assert response.status_code == 200
    html = response.content.decode()
    assert html.count('id="ibtikarSiteHeader"') == 1
    assert html.count('class="ibt-shell-footer"') == 1
    assert "data-shell-header" not in html
    assert "data-shell-footer" not in html


@pytest.mark.django_db
def test_root_renders_original_homepage(client):
    response = client.get("/")

    assert response.status_code == 200
    html = response.content.decode()
    assert 'id="ibtikarSiteHeader"' in html
    assert 'class="ibt-shell-footer"' in html


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("clean_path", "page_name"),
    [(path, page) for path, page in CLEAN_ALIASES.items() if path],
)
def test_clean_preview_aliases_redirect_to_original_filenames(client, clean_path, page_name):
    response = client.get(f"/{clean_path}")

    assert response.status_code == 302
    assert response.headers["Location"] == f"/{page_name}"


@pytest.mark.django_db
@pytest.mark.parametrize("retired_page", RETIRED_PLATFORM_PAGES)
def test_retired_platform_pages_are_not_restored(client, retired_page):
    response = client.get(f"/{retired_page}")
    assert response.status_code == 404


@pytest.mark.django_db
def test_preview_uses_django_static_asset_prefix(client):
    response = client.get("/services.html")

    assert response.status_code == 200
    html = response.content.decode()
    assert "/static/public_preview/assets/" in html
    assert 'src="assets/' not in html
    assert 'href="assets/' not in html
