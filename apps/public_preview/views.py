from django.http import HttpResponsePermanentRedirect
from django.shortcuts import render
from django.urls import reverse


def _render_public_page(request, template_name: str, page_key: str):
    """Render a public website page without deriving its URL from the template filename."""
    return render(
        request,
        f"public_preview/pages/{template_name}",
        {
            "page_key": page_key,
            # Kept only as internal frontend metadata for existing page-specific JS.
            # It is never used to build the browser URL.
            "source_page_name": template_name,
        },
    )


def home(request):
    return _render_public_page(request, "index.html", "index")


def ecommerce(request):
    return _render_public_page(request, "ecommerce.html", "ecommerce")


def websites(request):
    return _render_public_page(request, "websites.html", "websites")


def brand_content(request):
    return _render_public_page(request, "brand-content.html", "brand-content")


def growth(request):
    return _render_public_page(request, "growth.html", "growth")


def custom_systems(request):
    return _render_public_page(request, "custom-systems.html", "custom-systems")


def tharaa(request):
    return _render_public_page(request, "tharaa.html", "tharaa")


def portfolio(request):
    return _render_public_page(request, "portfolio.html", "portfolio")


def knowledge(request):
    return _render_public_page(request, "knowledge.html", "knowledge")


def article_product_page(request):
    return _render_public_page(request, "article-product-page.html", "article-product-page")


def article_store_launch(request):
    return _render_public_page(request, "article-store-launch.html", "article-store-launch")


def article_store_redesign(request):
    return _render_public_page(request, "article-store-redesign.html", "article-store-redesign")


def about(request):
    return _render_public_page(request, "about.html", "about")


def contact(request):
    return _render_public_page(request, "contact.html", "contact")


def not_found_preview(request):
    return _render_public_page(request, "404.html", "404")


def legacy_page_redirect(request, route_name: str):
    """Move old *.html inbound URLs permanently to the canonical clean URL."""
    target = reverse(route_name)
    query_string = request.META.get("QUERY_STRING", "")
    if query_string:
        target = f"{target}?{query_string}"
    return HttpResponsePermanentRedirect(target)
