from django.urls import reverse

import pytest


EXPLICIT_SERVICE_PAGES = (
    ("index", "/services/"),
    ("store-launch", "/services/store-launch/"),
    ("storefront-customization", "/services/storefront-customization/"),
    ("store-redesign", "/services/store-redesign/"),
    ("product-page-optimization", "/services/product-page-optimization/"),
    ("ecommerce-growth", "/services/ecommerce-growth/"),
    ("ecommerce-support", "/services/ecommerce-support/"),
)


@pytest.mark.parametrize("route_name,expected_path", EXPLICIT_SERVICE_PAGES)
def test_public_service_pages_use_explicit_named_routes(client, route_name, expected_path):
    url = reverse(f"services:{route_name}")

    assert url == expected_path
    response = client.get(url)
    assert response.status_code == 200


def test_public_services_do_not_expose_database_catalog(client):
    response = client.get("/services/catalog/")
    assert response.status_code == 404


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
