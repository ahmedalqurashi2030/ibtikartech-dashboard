from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.views.decorators.cache import cache_control, never_cache
from django.views.decorators.http import require_GET

from .sitemaps import PUBLIC_SITE_ORIGIN


def _noindex(response):
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


@require_GET
@never_cache
def healthz(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return _noindex(JsonResponse({"status": "unhealthy"}, status=503))
    return _noindex(JsonResponse({"status": "ok"}))


@require_GET
@cache_control(public=True, max_age=3600)
def robots_txt(request):
    lines = (
        "User-agent: *",
        "Allow: /",
        "Disallow: /control/",
        "Disallow: /django-admin/",
        "Disallow: /portal/",
        f"Sitemap: {PUBLIC_SITE_ORIGIN}/sitemap.xml",
    )
    return HttpResponse("\n".join(lines) + "\n", content_type="text/plain; charset=utf-8")
