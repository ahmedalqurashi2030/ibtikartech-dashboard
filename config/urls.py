from django.contrib import admin
from django.urls import include, path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls

from apps.core.views import healthz

urlpatterns = [
    path("healthz/", healthz, name="healthz"),
    path("django-admin/", admin.site.urls),
    path("control/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("accounts/", include("allauth.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("portal/support/", include("apps.support.portal_urls")),
    path("portal/", include("apps.customer_portal.urls")),
    path("", include(wagtail_urls)),
]
