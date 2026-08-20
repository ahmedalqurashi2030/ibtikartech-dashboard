from django.urls import path

from apps.public_preview.manifest import SERVICE_PAGE_ROUTES
from apps.public_preview.views import preview_page

from . import views

app_name = "services"

urlpatterns = [
    # The approved public services experience owns /services/.
    path("", preview_page, {"page_name": "services.html"}, name="index"),
    # Keep the original database-backed index reachable while the approved public
    # frontend is progressively bound to service models.
    path("catalog/", views.service_index, name="catalog"),
]

for page_name, (route, route_name) in SERVICE_PAGE_ROUTES.items():
    urlpatterns.append(
        path(route, preview_page, {"page_name": page_name}, name=route_name)
    )

urlpatterns += [
    path("<slug:slug>/request/", views.service_request, name="request"),
    path("<slug:slug>/", views.service_detail, name="detail"),
]
