from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from .models import Service, ServiceCategory


class ServiceCategoryViewSet(ModelViewSet):
    model = ServiceCategory
    icon = "folder-open-inverse"
    menu_label = "تصنيفات الخدمات"
    list_display = ("name", "slug", "sort_order", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "short_description")
    search_backend_name = None
    ordering = ("sort_order", "name")
    sort_order_field = "sort_order"
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "name",
        "slug",
        "short_description",
        "description",
        "image",
        "icon",
        "seo_title",
        "seo_description",
        "sort_order",
        "is_active",
    )


class ServiceViewSet(ModelViewSet):
    model = Service
    icon = "pick"
    menu_label = "الخدمات"
    list_display = (
        "name",
        "category",
        "price_type",
        "price",
        "currency",
        "is_featured",
        "is_active",
        "sort_order",
    )
    list_filter = ("category", "price_type", "action_type", "is_featured", "is_active")
    search_fields = ("name", "slug", "short_description", "description")
    search_backend_name = None
    ordering = ("category__sort_order", "sort_order", "name")
    sort_order_field = "sort_order"
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "category",
        "name",
        "slug",
        "short_description",
        "description",
        "price_type",
        "price",
        "currency",
        "delivery_time",
        "scope",
        "exclusions",
        "deliverables",
        "requirements",
        "process",
        "revision_policy",
        "featured_image",
        "gallery_data",
        "action_type",
        "action_url",
        "is_featured",
        "is_active",
        "sort_order",
        "seo_title",
        "seo_description",
    )


class ServicesViewSetGroup(ViewSetGroup):
    menu_label = "كتالوج الخدمات"
    menu_icon = "pick"
    menu_order = 150
    items = (ServiceCategoryViewSet, ServiceViewSet)


@hooks.register("register_admin_viewset")
def register_service_viewsets():
    return ServicesViewSetGroup()
