from django.urls import path
from django.views.generic import RedirectView

from . import views

app_name = "services"

urlpatterns = [
    # The approved public marketing page owns /services/. Keep the original
    # database-backed service catalogue available under an explicit namespace.
    path(
        "",
        RedirectView.as_view(pattern_name="public_preview:services", permanent=True),
        name="index",
    ),
    path("catalog/", views.service_index, name="catalog"),
    path("catalog/<slug:slug>/", views.service_detail, name="detail"),
    path("catalog/<slug:slug>/request/", views.service_request, name="request"),
    # Compatibility aliases for pre-refactor dynamic URLs. Approved marketing
    # routes are mounted earlier and intentionally win for their exact slugs.
    path("<slug:slug>/request/", views.service_request, name="legacy-request"),
    path("<slug:slug>/", views.service_detail, name="legacy-detail"),
]
