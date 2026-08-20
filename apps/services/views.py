from django.contrib import messages
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from apps.crm.models import Contact
from apps.customer_portal.services import ContactResolutionError, get_or_link_contact_for_user
from apps.sales.choices import InquiryType
from apps.sales.models import Inquiry

from .forms import ServiceInquiryForm
from .models import Service, ServiceCategory


class PublicContactResolutionError(Exception):
    pass


def service_index(request):
    active_services = Service.objects.filter(is_active=True).order_by(
        "sort_order",
        "name",
    )
    categories = (
        ServiceCategory.objects.filter(is_active=True)
        .prefetch_related(Prefetch("services", queryset=active_services))
        .order_by("sort_order", "name")
    )
    return render(request, "services/index.html", {"categories": categories})


def service_detail(request, slug):
    service = get_object_or_404(
        Service.objects.select_related("category"),
        slug=slug,
        is_active=True,
        category__is_active=True,
    )
    return render(request, "services/detail.html", {"service": service})


def _guest_contact(form):
    email = form.cleaned_data["email"]
    phone = form.cleaned_data["phone"]
    matches = list(
        Contact.objects.select_for_update()
        .filter(email__iexact=email, status=Contact.Status.ACTIVE)
        .order_by("created_at")[:3]
    )

    if len(matches) > 1 and phone:
        phone_matches = [contact for contact in matches if contact.phone == phone]
        if len(phone_matches) == 1:
            matches = phone_matches

    if len(matches) > 1:
        raise PublicContactResolutionError(
            "تعذر ربط الطلب تلقائيًا بملف عميل واحد. تواصل معنا وسنساعدك."
        )

    now = timezone.now()
    if matches:
        contact = matches[0]
        changed_fields = ["last_activity_at", "updated_at"]
        contact.last_activity_at = now
        if phone and not contact.phone:
            contact.phone = phone
            changed_fields.append("phone")
        if not contact.first_contact_at:
            contact.first_contact_at = now
            changed_fields.append("first_contact_at")
        contact.save(update_fields=changed_fields)
        return contact

    return Contact.objects.create(
        full_name=form.cleaned_data["full_name"],
        email=email,
        phone=phone,
        first_source="WEB_SERVICE",
        first_contact_at=now,
        last_activity_at=now,
    )


def _resolve_contact(request, form):
    if request.user.is_authenticated:
        try:
            contact = get_or_link_contact_for_user(request.user)
        except ContactResolutionError as exc:
            raise PublicContactResolutionError(
                "تعذر ربط حسابك بملف العميل تلقائيًا. تواصل معنا للمراجعة."
            ) from exc
        now = timezone.now()
        contact.last_activity_at = now
        if not contact.first_contact_at:
            contact.first_contact_at = now
            contact.save(update_fields=["first_contact_at", "last_activity_at", "updated_at"])
        else:
            contact.save(update_fields=["last_activity_at", "updated_at"])
        return contact
    return _guest_contact(form)


@require_http_methods(["GET", "POST"])
@transaction.atomic
def service_request(request, slug):
    service = get_object_or_404(
        Service.objects.select_related("category"),
        slug=slug,
        is_active=True,
        category__is_active=True,
    )

    initial = {}
    if request.user.is_authenticated:
        initial = {
            "full_name": request.user.get_full_name(),
            "email": request.user.email,
        }
    form = ServiceInquiryForm(request.POST or None, initial=initial)

    if request.method == "POST" and form.is_valid():
        try:
            contact = _resolve_contact(request, form)
        except PublicContactResolutionError as exc:
            form.add_error(None, str(exc))
        else:
            Inquiry.objects.create(
                contact=contact,
                service=service,
                inquiry_type=InquiryType.SERVICE,
                message=form.cleaned_data["message"],
                source="WEB_SERVICE",
                requirements_data={
                    "store_url": form.cleaned_data.get("store_url", ""),
                    "submitted_name": form.cleaned_data["full_name"],
                    "submitted_email": form.cleaned_data["email"],
                    "submitted_phone": form.cleaned_data["phone"],
                    "utm_source": request.GET.get("utm_source", "")[:120],
                    "utm_medium": request.GET.get("utm_medium", "")[:120],
                    "utm_campaign": request.GET.get("utm_campaign", "")[:160],
                },
            )
            messages.success(request, "وصل طلبك إلى فريق ابتكار تك وسنتابع معك.")
            detail_url = reverse("services:detail", kwargs={"slug": service.slug})
            return redirect(f"{detail_url}?sent=1")

    return render(
        request,
        "services/request.html",
        {"service": service, "form": form},
    )
