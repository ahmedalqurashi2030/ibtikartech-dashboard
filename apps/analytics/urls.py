from django.urls import path

from . import views

app_name = "analytics"

urlpatterns = [
    path("events/collect/", views.collect_event, name="collect_event"),
]
