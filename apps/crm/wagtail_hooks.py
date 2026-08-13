from django.urls import path
from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSet, ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from . import control_views
from .models import Contact, Organization, OrganizationContact, Store


class ContactViewSet(ModelViewSet):
    model = Contact
    icon = "user"
    menu_label = "جهات الاتصال"
    list_display = (
        "full_name",
        "email",
        "phone",
        "lifecycle_stage",
        "status",
        "owner",
        "last_activity_at",
    )
    list_filter = ("lifecycle_stage", "status", "owner", "preferred_language")
    search_fields = ("full_name", "email", "phone", "first_source")
    search_backend_name = None
    ordering = ("-last_activity_at", "-created_at")
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "user",
        "full_name",
        "email",
        "phone",
        "lifecycle_stage",
        "status",
        "preferred_language",
        "owner",
        "first_source",
        "first_contact_at",
        "last_activity_at",
    )


class OrganizationViewSet(ModelViewSet):
    model = Organization
    icon = "site"
    menu_label = "المنظمات"
    list_display = ("name", "legal_name", "industry", "status", "updated_at")
    list_filter = ("status", "industry")
    search_fields = ("name", "legal_name", "website", "industry")
    search_backend_name = None
    ordering = ("name",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = ("name", "legal_name", "website", "industry", "status")


class OrganizationContactViewSet(ModelViewSet):
    model = OrganizationContact
    icon = "link"
    menu_label = "روابط المنظمات"
    list_display = ("organization", "contact", "role_title", "is_primary", "created_at")
    list_filter = ("is_primary", "organization")
    search_fields = (
        "organization__name",
        "contact__full_name",
        "contact__email",
        "role_title",
    )
    search_backend_name = None
    ordering = ("organization__name", "-is_primary", "contact__full_name")
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = ("organization", "contact", "role_title", "is_primary")


class StoreViewSet(ModelViewSet):
    model = Store
    icon = "site"
    menu_label = "المتاجر"
    list_display = (
        "name",
        "platform",
        "primary_contact",
        "organization",
        "status",
        "updated_at",
    )
    list_filter = ("platform", "status", "organization")
    search_fields = (
        "name",
        "url",
        "external_store_id",
        "primary_contact__full_name",
        "primary_contact__email",
    )
    search_backend_name = None
    ordering = ("name",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "primary_contact",
        "organization",
        "name",
        "url",
        "platform",
        "external_store_id",
        "status",
        "notes",
    )


class Customer360ViewSet(ViewSet):
    name = "customer_360"
    icon = "user"
    menu_label = "Customer 360"

    def get_urlpatterns(self):
        return [
            path("", control_views.customer360_index, name="index"),
            path("<uuid:contact_id>/", control_views.customer360_detail, name="detail"),
        ]


class ConsentLedgerViewSet(ViewSet):
    name = "consent_ledger"
    icon = "lock"
    menu_label = "سجل الموافقات"

    def get_urlpatterns(self):
        return [
            path("", control_views.consent_index, name="index"),
            path("add/", control_views.consent_add, name="add"),
        ]


class ActivityTimelineViewSet(ViewSet):
    name = "crm_activity"
    icon = "history"
    menu_label = "Timeline CRM"

    def get_urlpatterns(self):
        return [
            path("", control_views.activity_index, name="index"),
            path("add/", control_views.activity_add, name="add"),
        ]


class CRMViewSetGroup(ViewSetGroup):
    menu_label = "CRM"
    menu_icon = "group"
    menu_order = 100
    items = (
        Customer360ViewSet,
        ContactViewSet,
        OrganizationViewSet,
        OrganizationContactViewSet,
        StoreViewSet,
        ConsentLedgerViewSet,
        ActivityTimelineViewSet,
    )


@hooks.register("register_admin_viewset")
def register_crm_viewsets():
    return CRMViewSetGroup()
