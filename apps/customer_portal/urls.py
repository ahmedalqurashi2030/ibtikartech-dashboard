from django.urls import path

from . import views

app_name = "customer_portal"

urlpatterns = [
    path("", views.overview, name="overview"),
    path("saved-services/", views.saved_services, name="saved_services"),
    path(
        "saved-services/<uuid:service_id>/toggle/",
        views.toggle_saved_service,
        name="toggle_saved_service",
    ),
    path("inquiries/", views.inquiries, name="inquiries"),
    path("quotes/", views.quotes, name="quotes"),
    path("stores/", views.stores, name="stores"),
    path("profile/", views.profile, name="profile"),
]
