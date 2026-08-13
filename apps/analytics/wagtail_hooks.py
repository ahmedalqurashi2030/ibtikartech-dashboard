from django.urls import path
from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSet, ViewSetGroup

from . import control_views


class DashboardViewSet(ViewSet):
    name = "ibtikar_dashboard"
    icon = "dashboard"
    menu_label = "لوحة المؤشرات"

    def get_urlpatterns(self):
        return [path("", control_views.dashboard, name="index")]


class AnalyticsEventsViewSet(ViewSet):
    name = "analytics_events"
    icon = "view"
    menu_label = "الأحداث"

    def get_urlpatterns(self):
        return [path("", control_views.event_index, name="index")]


class AnalyticsViewSetGroup(ViewSetGroup):
    menu_label = "التقارير والتحليلات"
    menu_icon = "dashboard"
    menu_order = 50
    items = (DashboardViewSet, AnalyticsEventsViewSet)


@hooks.register("register_admin_viewset")
def register_analytics_viewsets():
    return AnalyticsViewSetGroup()
