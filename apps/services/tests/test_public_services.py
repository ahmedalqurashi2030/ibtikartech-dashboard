import pytest
from django.urls import reverse

EXPLICIT_SERVICE_PAGES = (
    ("index", "/services/"),
    ("store-launch", "/services/store-launch/"),
    ("storefront-customization", "/services/storefront-customization/"),
    ("store-redesign", "/services/store-redesign/"),
    ("product-page-optimization", "/services/product-page-optimization/"),
    ("ecommerce-growth", "/services/ecommerce-growth/"),
    ("ecommerce-support", "/services/ecommerce-support/"),
)


@pytest.mark.django_db
@pytest.mark.parametrize("route_name,expected_path", EXPLICIT_SERVICE_PAGES)
def test_public_service_pages_use_explicit_named_routes(client, route_name, expected_path):
    url = reverse(f"services:{route_name}")

    assert url == expected_path
    response = client.get(url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_public_services_do_not_expose_database_catalog(client):
    response = client.get("/services/catalog/")
    assert response.status_code == 404


@pytest.mark.django_db
@pytest.mark.parametrize(
    "path",
    (
        "/services/example-database-slug/",
        "/services/example-database-slug/request/",
    ),
)
def test_public_services_do_not_resolve_dynamic_model_slugs(client, path):
    response = client.get(path)
    assert response.status_code == 404

PILOT_SERVICE_FAMILY_PAGES = (
    ("store-launch", "إطلاق متجر إلكتروني | ابتكار تك"),
    ("ecommerce-growth", "الربط والقياس والنمو للمتاجر | ابتكار تك"),
)


@pytest.mark.django_db
@pytest.mark.parametrize("route_name,expected_title", PILOT_SERVICE_FAMILY_PAGES)
def test_service_family_pilot_renders_one_structural_contract(
    client,
    route_name,
    expected_title,
):
    response = client.get(reverse(f"services:{route_name}"))
    html = response.content.decode()

    assert response.status_code == 200
    assert f"<title>{expected_title}</title>" in html
    assert html.count('id="main-content"') == 1
    assert html.count('id="decision-center"') == 1
    assert html.count("commerce-service-detail.css") == 1
    assert html.count("commerce-service-detail.js") == 1
    assert 'aria-label="مسار التنقل"' in html
    assert 'aria-label="دليل قرار الخدمة"' in html

