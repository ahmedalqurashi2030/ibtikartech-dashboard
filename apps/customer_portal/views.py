from django.contrib import messages
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from apps.crm.models import Store
from apps.sales.models import Inquiry, Quote
from apps.services.models import Service

from .decorators import portal_contact_required
from .forms import ContactProfileForm, CustomerPreferenceForm
from .models import CustomerPreference, SavedService


@portal_contact_required
def overview(request):
    contact = request.portal_contact
    saved_services = list(
        SavedService.objects.filter(contact=contact)
        .select_related("service", "service__category")[:4]
    )
    inquiries = list(
        Inquiry.objects.filter(contact=contact)
        .select_related("service", "store")[:4]
    )
    quotes = list(
        Quote.objects.filter(contact=contact)
        .select_related("opportunity", "organization")[:4]
    )
    stores = list(
        Store.objects.filter(primary_contact=contact, status=Store.Status.ACTIVE)[:4]
    )

    context = {
        "contact": contact,
        "saved_services": saved_services,
        "saved_services_count": SavedService.objects.filter(contact=contact).count(),
        "inquiries": inquiries,
        "inquiries_count": Inquiry.objects.filter(contact=contact).count(),
        "quotes": quotes,
        "quotes_count": Quote.objects.filter(contact=contact).count(),
        "stores": stores,
        "stores_count": Store.objects.filter(
            primary_contact=contact,
            status=Store.Status.ACTIVE,
        ).count(),
    }
    return render(request, "portal/overview.html", context)


@portal_contact_required
def saved_services(request):
    items = (
        SavedService.objects.filter(contact=request.portal_contact)
        .select_related("service", "service__category")
        .order_by("-created_at")
    )
    return render(
        request,
        "portal/saved_services.html",
        {"contact": request.portal_contact, "saved_services": items},
    )


@require_POST
@portal_contact_required
def toggle_saved_service(request, service_id):
    service = get_object_or_404(Service, id=service_id, is_active=True)
    saved, created = SavedService.objects.get_or_create(
        contact=request.portal_contact,
        service=service,
    )
    if created:
        messages.success(request, "تم حفظ الخدمة في حسابك.")
    else:
        saved.delete()
        messages.success(request, "تمت إزالة الخدمة من المحفوظات.")
    return redirect("customer_portal:saved_services")


@portal_contact_required
def inquiries(request):
    items = (
        Inquiry.objects.filter(contact=request.portal_contact)
        .select_related("service", "store", "assigned_to")
        .order_by("-created_at")
    )
    return render(
        request,
        "portal/inquiries.html",
        {"contact": request.portal_contact, "inquiries": items},
    )


@portal_contact_required
def quotes(request):
    items = (
        Quote.objects.filter(contact=request.portal_contact)
        .select_related("opportunity", "organization")
        .prefetch_related("items")
        .order_by("-created_at")
    )
    return render(
        request,
        "portal/quotes.html",
        {"contact": request.portal_contact, "quotes": items},
    )


@portal_contact_required
def stores(request):
    items = Store.objects.filter(
        primary_contact=request.portal_contact,
        status=Store.Status.ACTIVE,
    ).order_by("name")
    return render(
        request,
        "portal/stores.html",
        {"contact": request.portal_contact, "stores": items},
    )


@portal_contact_required
def profile(request):
    contact = request.portal_contact
    preference, _ = CustomerPreference.objects.get_or_create(contact=contact)

    profile_form = ContactProfileForm(instance=contact, prefix="profile")
    preference_form = CustomerPreferenceForm(
        instance=preference,
        contact=contact,
        prefix="preferences",
    )

    if request.method == "POST":
        form_type = request.POST.get("form_type")
        if form_type == "profile":
            profile_form = ContactProfileForm(
                request.POST,
                instance=contact,
                prefix="profile",
            )
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, "تم تحديث بياناتك الأساسية.")
                return redirect("customer_portal:profile")
        elif form_type == "preferences":
            preference_form = CustomerPreferenceForm(
                request.POST,
                instance=preference,
                contact=contact,
                prefix="preferences",
            )
            if preference_form.is_valid():
                preference_form.save()
                messages.success(request, "تم تحديث تفضيلات البوابة.")
                return redirect("customer_portal:profile")
        else:
            return HttpResponseBadRequest("Unknown portal form.")

    return render(
        request,
        "portal/profile.html",
        {
            "contact": contact,
            "profile_form": profile_form,
            "preference_form": preference_form,
        },
    )
