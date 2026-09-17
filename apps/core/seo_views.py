from xml.sax.saxutils import escape

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_GET

from .sitemaps import public_indexable_paths


@require_GET
@cache_control(public=True, max_age=3600)
def sitemap_xml(request):
    """Serve the approved canonical public URL set as a root XML sitemap."""
    locations = (
        escape(request.build_absolute_uri(path), {'"': "&quot;"})
        for path in public_indexable_paths()
    )
    entries = "".join(f"<url><loc>{location}</loc></url>" for location in locations)
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{entries}"
        "</urlset>"
    )
    response = HttpResponse(body, content_type="application/xml; charset=utf-8")
    response.headers["X-Robots-Tag"] = "noindex"
    return response


def page_not_found(request, exception=None):
    """Render the public 404 design while preserving the real HTTP 404 status."""
    return render(
        request,
        "public_preview/pages/404.html",
        {
            "page_key": "404",
            "source_page_name": "404.html",
        },
        status=404,
    )
