from django.urls import path
from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSet, ViewSetGroup

from . import control_views


class AuditLogViewSet(ViewSet):
    name = "audit_log"
    icon = "history"
    menu_label = "سجل التدقيق"

    def get_urlpatterns(self):
        return [path("", control_views.audit_index, name="index")]


class SystemViewSetGroup(ViewSetGroup):
    menu_label = "النظام"
    menu_icon = "cog"
    menu_order = 900
    items = (AuditLogViewSet,)


@hooks.register("register_admin_viewset")
def register_system_viewsets():
    return SystemViewSetGroup()
