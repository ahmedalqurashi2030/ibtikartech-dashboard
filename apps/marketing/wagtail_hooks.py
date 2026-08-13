from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from .models import AttributionTouch, Campaign


class CampaignViewSet(ModelViewSet):
    model = Campaign
    icon = "megaphone"
    menu_label = "الحملات"
    list_display = (
        "name",
        "channel",
        "status",
        "utm_source",
        "utm_medium",
        "starts_at",
        "ends_at",
    )
    list_filter = ("channel", "status")
    search_fields = ("name", "utm_source", "utm_medium", "utm_campaign", "notes")
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "name",
        "channel",
        "status",
        "starts_at",
        "ends_at",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "notes",
    )


class AttributionTouchViewSet(ModelViewSet):
    model = AttributionTouch
    icon = "link"
    menu_label = "الإسناد التسويقي"
    list_display = (
        "contact",
        "campaign",
        "touch_type",
        "source",
        "medium",
        "campaign_name",
        "occurred_at",
    )
    list_filter = ("touch_type", "campaign", "source", "medium")
    search_fields = (
        "contact__full_name",
        "contact__email",
        "campaign__name",
        "campaign_name",
        "source",
        "medium",
        "landing_page",
    )
    search_backend_name = None
    ordering = ("-occurred_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "campaign",
        "contact",
        "anonymous_session_id",
        "touch_type",
        "source",
        "medium",
        "campaign_name",
        "landing_page",
        "referrer",
        "metadata",
        "occurred_at",
    )


class MarketingViewSetGroup(ViewSetGroup):
    menu_label = "التسويق"
    menu_icon = "megaphone"
    menu_order = 500
    items = (CampaignViewSet, AttributionTouchViewSet)


@hooks.register("register_admin_viewset")
def register_marketing_viewsets():
    return MarketingViewSetGroup()
