from django.urls import path

from . import views

app_name = "services"

urlpatterns = [
    path("", views.service_index, name="index"),
    path("<slug:slug>/", views.service_detail, name="detail"),
    path("<slug:slug>/request/", views.service_request, name="request"),
]
