import hashlib

from django.core.cache import cache
from django.db import transaction
from django.http import HttpResponsePermanentRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from apps.crm.models import Contact
from apps.sales.models import Inquiry
from apps.services.models import Service

from .forms import PublicInquiryForm


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
    initial = {
        "service": request.GET.get("service", "")[:140],
        "source": request.GET.get("source", "website")[:120],
        "goal": request.GET.get("goal", "")[:120],
    }
    if request.method == "GET":
        return render(
            request,
            "public_preview/pages/contact.html",
            {"page_key": "contact", "source_page_name": "contact.html", "inquiry_initial": initial},
        )

    fingerprint = (
        f"{request.META.get('REMOTE_ADDR', '')}:"
        f"{request.META.get('HTTP_USER_AGENT', '')[:120]}"
    )
    rate_key = f"public-inquiry:{hashlib.sha256(fingerprint.encode()).hexdigest()}"
    attempts = cache.get(rate_key, 0)
    if attempts >= 5:
        return JsonResponse(
            {
                "ok": False,
                "message": "تم تجاوز عدد المحاولات. حاول بعد دقيقة.",
            },
            status=429,
        )
    cache.set(rate_key, attempts + 1, timeout=60)

    form = PublicInquiryForm(request.POST)
    if not form.is_valid():
        return JsonResponse(
            {
                "ok": False,
                "message": "راجع الحقول المطلوبة ثم أعد الإرسال.",
                "errors": form.errors.get_json_data(),
            },
            status=400,
        )

    data = form.cleaned_data
    now = timezone.now()
    with transaction.atomic():
        contact_match = Contact.objects.none()
        if data["email"]:
            contact_match = Contact.objects.filter(email__iexact=data["email"])
        contact = contact_match.first() or Contact.objects.filter(phone=data["phone"]).first()
        if contact is None:
            contact = Contact.objects.create(
                full_name=data["full_name"],
                email=data["email"],
                phone=data["phone"],
                first_source=data["source"] or "website",
                first_contact_at=now,
                last_activity_at=now,
            )
        else:
            contact.full_name = data["full_name"]
            if data["email"]:
                contact.email = data["email"]
            contact.phone = data["phone"]
            contact.last_activity_at = now
            if not contact.first_contact_at:
                contact.first_contact_at = now
            if not contact.first_source:
                contact.first_source = data["source"] or "website"
            contact.save()

        service = (
            Service.objects.filter(slug=data["service"], is_active=True).first()
            if data["service"]
            else None
        )
        inquiry = Inquiry.objects.create(
            contact=contact,
            service=service,
            message=data["details"],
            source=data["source"] or "website",
            requirements_data={
                "company": data["company"],
                "goal": data["goal"],
                "stage": data["stage"],
                "platform": data["platform"],
                "timeline": data["timeline"],
            },
        )

    return JsonResponse(
        {
            "ok": True,
            "reference": f"IBT-{inquiry.id.hex[:8].upper()}",
            "message": (
                "وصل طلبك إلى الفريق. سنراجع النطاق ونتواصل معك "
                "عبر بيانات التواصل المرسلة."
            ),
        },
        status=201,
    )


def not_found_preview(request):
    return _render_public_page(request, "404.html", "404")


def legacy_page_redirect(request, route_name: str):
    """Move old *.html inbound URLs permanently to the canonical clean URL."""
    target = reverse(route_name)
    query_string = request.META.get("QUERY_STRING", "")
    if query_string:
        target = f"{target}?{query_string}"
    return HttpResponsePermanentRedirect(target)
