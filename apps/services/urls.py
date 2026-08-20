from django.http import HttpResponseNotFound
from django.urls import path, re_path

from . import public_views

app_name = "services"


def _reject_unknown_public_service(request):
    """Stop unknown /services/* paths before the global Wagtail catch-all."""
    return HttpResponseNotFound()


urlpatterns = [
    path("", public_views.services, name="index"),
    path("store-launch/", public_views.store_launch, name="store-launch"),
    path(
        "storefront-customization/",
        public_views.storefront_customization,
        name="storefront-customization",
    ),
    path("store-redesign/", public_views.store_redesign, name="store-redesign"),
    path(
        "product-page-optimization/",
        public_views.product_page_optimization,
        name="product-page-optimization",
    ),
    path("ecommerce-growth/", public_views.ecommerce_growth, name="ecommerce-growth"),
    path("ecommerce-support/", public_views.ecommerce_support, name="ecommerce-support"),
    re_path(r"^.*$", _reject_unknown_public_service),
]
