import pytest
from django.urls import resolve, reverse

from apps.public_preview import views as public_views
from apps.services import public_views as service_public_views

PUBLIC_VIEW_ROUTES = (
    ("public_preview:home", public_views.home, "/"),
    ("public_preview:ecommerce", public_views.ecommerce, "/ecommerce/"),
    ("public_preview:websites", public_views.websites, "/websites/"),
    ("public_preview:brand-content", public_views.brand_content, "/brand-content/"),
    ("public_preview:growth", public_views.growth, "/growth/"),
    ("public_preview:custom-systems", public_views.custom_systems, "/custom-systems/"),
    ("public_preview:tharaa", public_views.tharaa, "/tharaa/"),
    ("public_preview:portfolio", public_views.portfolio, "/portfolio/"),
    ("public_preview:knowledge", public_views.knowledge, "/knowledge/"),
    (
        "public_preview:article-product-page",
        public_views.article_product_page,
        "/knowledge/product-page/",
    ),
    (
        "public_preview:article-store-launch",
        public_views.article_store_launch,
        "/knowledge/store-launch/",
    ),
    (
        "public_preview:article-store-redesign",
        public_views.article_store_redesign,
        "/knowledge/store-redesign/",
    ),
    ("public_preview:about", public_views.about, "/about/"),
    ("public_preview:contact", public_views.contact, "/contact/"),
)

SERVICE_VIEW_ROUTES = (
    ("services:index", service_public_views.services, "/services/"),
    (
        "services:store-launch",
        service_public_views.store_launch,
        "/services/store-launch/",
    ),
    (
        "services:storefront-customization",
        service_public_views.storefront_customization,
        "/services/storefront-customization/",
    ),
    (
        "services:store-redesign",
        service_public_views.store_redesign,
        "/services/store-redesign/",
    ),
    (
        "services:product-page-optimization",
        service_public_views.product_page_optimization,
        "/services/product-page-optimization/",
    ),
    (
        "services:ecommerce-growth",
        service_public_views.ecommerce_growth,
        "/services/ecommerce-growth/",
    ),
    (
        "services:ecommerce-support",
        service_public_views.ecommerce_support,
        "/services/ecommerce-support/",
    ),
)


@pytest.mark.parametrize(
    "route_name,view_func,expected_path",
    PUBLIC_VIEW_ROUTES + SERVICE_VIEW_ROUTES,
)
def test_clean_url_resolves_directly_to_explicit_python_view(
    route_name,
    view_func,
    expected_path,
):
    path = reverse(route_name)
    match = resolve(path)

    assert path == expected_path
    assert ".html" not in path
    assert match.func is view_func


@pytest.mark.parametrize(
    "legacy_path,clean_route_name",
    (
        ("/index.html", "public_preview:home"),
        ("/services.html", "services:index"),
        ("/portfolio.html", "public_preview:portfolio"),
        ("/knowledge.html", "public_preview:knowledge"),
        ("/contact.html", "public_preview:contact"),
        ("/store-launch.html", "services:store-launch"),
        ("/storefront-customization.html", "services:storefront-customization"),
        ("/store-redesign.html", "services:store-redesign"),
        ("/product-page-optimization.html", "services:product-page-optimization"),
        ("/ecommerce-growth.html", "services:ecommerce-growth"),
        ("/ecommerce-support.html", "services:ecommerce-support"),
    ),
)
def test_legacy_html_url_never_renders_and_only_redirects(
    client,
    legacy_path,
    clean_route_name,
):
    response = client.get(legacy_path, follow=False)

    assert response.status_code == 301
    assert response["Location"] == reverse(clean_route_name)
    assert ".html" not in response["Location"]
