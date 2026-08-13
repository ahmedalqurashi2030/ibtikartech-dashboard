from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from .models import SupportTicket, TicketMessage


class SupportTicketViewSet(ModelViewSet):
    model = SupportTicket
    icon = "help"
    menu_label = "تذاكر الدعم"
    list_display = (
        "ticket_number",
        "subject",
        "contact",
        "priority",
        "status",
        "assigned_to",
        "updated_at",
    )
    list_filter = ("priority", "status", "assigned_to", "project")
    search_fields = (
        "ticket_number",
        "subject",
        "description",
        "contact__full_name",
        "contact__email",
        "project__project_number",
    )
    search_backend_name = None
    ordering = ("-updated_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "contact",
        "project",
        "subject",
        "description",
        "priority",
        "status",
        "assigned_to",
        "closed_at",
    )


class TicketMessageViewSet(ModelViewSet):
    model = TicketMessage
    icon = "comment"
    menu_label = "رسائل الدعم"
    list_display = (
        "ticket",
        "sender_user",
        "sender_contact",
        "is_internal",
        "created_at",
    )
    list_filter = ("is_internal", "ticket", "sender_user")
    search_fields = (
        "body",
        "ticket__ticket_number",
        "ticket__subject",
        "sender_contact__full_name",
        "sender_contact__email",
    )
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "ticket",
        "sender_user",
        "sender_contact",
        "body",
        "attachment",
        "is_internal",
    )


class SupportViewSetGroup(ViewSetGroup):
    menu_label = "الدعم"
    menu_icon = "help"
    menu_order = 400
    items = (SupportTicketViewSet, TicketMessageViewSet)


@hooks.register("register_admin_viewset")
def register_support_viewsets():
    return SupportViewSetGroup()
