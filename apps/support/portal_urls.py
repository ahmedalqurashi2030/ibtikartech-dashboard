from django.urls import path

from . import portal_views

app_name = "support_portal"

urlpatterns = [
    path("", portal_views.tickets, name="tickets"),
    path("new/", portal_views.create_ticket, name="create_ticket"),
    path("<uuid:ticket_id>/", portal_views.ticket_detail, name="ticket_detail"),
    path(
        "<uuid:ticket_id>/message/",
        portal_views.add_message,
        name="add_message",
    ),
    path(
        "<uuid:ticket_id>/messages/<uuid:message_id>/attachment/",
        portal_views.download_attachment,
        name="download_attachment",
    ),
]
