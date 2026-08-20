from django.urls import path
from django.views.generic import RedirectView

from .manifest import PAGE_URL_NAMES, PUBLIC_PAGE_ROUTES, SERVICE_PAGE_ROUTES
from .views import preview_page

app_name = "public_preview"

urlpatterns = [
    path(
        route,
        preview_page,
        {"page_name": page_name},
        name=route_name,
    )
    for page_name, (route, route_name) in PUBLIC_PAGE_ROUTES.items()
]

# Preserve old inbound links and search-engine history without exposing .html in
# the canonical browser URL. Service-family redirects may target another namespace.
for page_name, pattern_name in PAGE_URL_NAMES.items():
    urlpatterns.append(
        path(
            page_name,
            RedirectView.as_view(pattern_name=pattern_name, permanent=True, query_string=True),
            name=f"legacy-{page_name.removesuffix('.html')}",
        )
    )

# SERVICE_PAGE_ROUTES is imported intentionally so Django checks fail if the
# shared manifest is accidentally removed while services/urls.py still relies on it.
assert SERVICE_PAGE_ROUTES
