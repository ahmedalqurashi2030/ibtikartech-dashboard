from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from .models import FollowUpTask, Inquiry, Opportunity, Quote, QuoteItem


class InquiryViewSet(ModelViewSet):
    model = Inquiry
    icon = "form"
    menu_label = "الاستفسارات والطلبات"
    list_display = ("contact", "inquiry_type", "service", "status", "assigned_to", "created_at")
    list_filter = ("inquiry_type", "status", "assigned_to", "service")
    search_fields = ("contact__full_name", "contact__email", "message", "source")
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "contact",
        "service",
        "store",
        "inquiry_type",
        "message",
        "requirements_data",
        "source",
        "status",
        "assigned_to",
    )


class OpportunityViewSet(ModelViewSet):
    model = Opportunity
    icon = "group"
    menu_label = "الفرص"
    list_display = (
        "title",
        "contact",
        "stage",
        "estimated_value",
        "currency",
        "assigned_to",
        "expected_close_date",
    )
    list_filter = ("stage", "assigned_to", "service", "expected_close_date")
    search_fields = ("title", "contact__full_name", "contact__email", "lost_reason")
    search_backend_name = None
    ordering = ("-updated_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "contact",
        "organization",
        "store",
        "inquiry",
        "service",
        "title",
        "stage",
        "estimated_value",
        "currency",
        "assigned_to",
        "expected_close_date",
        "lost_reason",
        "closed_at",
    )


class FollowUpTaskViewSet(ModelViewSet):
    model = FollowUpTask
    icon = "date"
    menu_label = "المتابعات"
    list_display = ("title", "opportunity", "task_type", "status", "assigned_to", "due_at")
    list_filter = ("task_type", "status", "assigned_to", "due_at")
    search_fields = ("title", "description", "opportunity__title", "contact__full_name")
    search_backend_name = None
    ordering = ("status", "due_at", "-created_at")
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "opportunity",
        "contact",
        "assigned_to",
        "title",
        "description",
        "task_type",
        "status",
        "due_at",
        "completed_at",
    )


class QuoteViewSet(ModelViewSet):
    model = Quote
    icon = "doc-full"
    menu_label = "عروض الأسعار"
    list_display = (
        "quote_number",
        "contact",
        "status",
        "grand_total",
        "currency",
        "valid_until",
        "created_at",
    )
    list_filter = ("status", "currency", "valid_until", "created_by")
    search_fields = ("quote_number", "contact__full_name", "contact__email", "opportunity__title")
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    inspect_view_fields = (
        "quote_number",
        "opportunity",
        "contact",
        "organization",
        "status",
        "currency",
        "subtotal",
        "discount",
        "tax",
        "grand_total",
        "valid_until",
        "sent_at",
        "accepted_at",
        "rejected_at",
        "created_by",
        "created_at",
        "updated_at",
    )
    form_fields = (
        "opportunity",
        "contact",
        "organization",
        "status",
        "currency",
        "valid_until",
        "notes",
        "terms",
        "sent_at",
        "accepted_at",
        "rejected_at",
        "created_by",
    )


class QuoteItemViewSet(ModelViewSet):
    model = QuoteItem
    icon = "list-ul"
    menu_label = "بنود عروض الأسعار"
    list_display = (
        "service_name_snapshot",
        "quote",
        "quantity",
        "unit_price",
        "discount",
        "tax",
        "total",
    )
    list_filter = ("quote", "service")
    search_fields = ("service_name_snapshot", "description_snapshot", "quote__quote_number")
    search_backend_name = None
    ordering = ("quote", "sort_order", "created_at")
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "quote",
        "service",
        "service_name_snapshot",
        "description_snapshot",
        "quantity",
        "unit_price",
        "discount",
        "tax",
        "sort_order",
    )


class SalesViewSetGroup(ViewSetGroup):
    menu_label = "المبيعات"
    menu_icon = "list-ul"
    menu_order = 200
    items = (
        InquiryViewSet,
        OpportunityViewSet,
        FollowUpTaskViewSet,
        QuoteViewSet,
        QuoteItemViewSet,
    )


@hooks.register("register_admin_viewset")
def register_sales_viewsets():
    return SalesViewSetGroup()
