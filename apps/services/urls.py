from django.urls import path

from apps.public_preview.views import preview_page

app_name = "services"

# Public service pages are explicit website templates. They intentionally do not
# resolve Service models or database slugs: every route is named and controlled
# by the frontend architecture so section structure can be standardized safely.
urlpatterns = [
    path("", preview_page, {"page_name": "services.html"}, name="index"),
    path(
        "store-launch/",
        preview_page,
        {"page_name": "store-launch.html"},
        name="store-launch",
    ),
    path(
        "storefront-customization/",
        preview_page,
        {"page_name": "storefront-customization.html"},
        name="storefront-customization",
    ),
    path(
        "store-redesign/",
        preview_page,
        {"page_name": "store-redesign.html"},
        name="store-redesign",
    ),
    path(
        "product-page-optimization/",
        preview_page,
        {"page_name": "product-page-optimization.html"},
        name="product-page-optimization",
    ),
    path(
        "ecommerce-growth/",
        preview_page,
        {"page_name": "ecommerce-growth.html"},
        name="ecommerce-growth",
    ),
    path(
        "ecommerce-support/",
        preview_page,
        {"page_name": "ecommerce-support.html"},
        name="ecommerce-support",
    ),
]
