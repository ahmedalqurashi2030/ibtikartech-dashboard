from django.contrib import messages
from django.db.models import Prefetch
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from apps.crm.models import Store
from apps.projects.choices import ApprovalStatus, ProjectVisibility
from apps.projects.forms import ApprovalResponseForm
from apps.projects.models import Approval, Project, ProjectFile, ProjectStage, ProjectUpdate
from apps.projects.services import ApprovalResponseError, respond_to_approval
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
    projects = list(
        Project.objects.filter(contact=contact)
        .select_related("store", "manager")[:4]
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
        "projects": projects,
        "projects_count": Project.objects.filter(contact=contact).count(),
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
def projects(request):
    items = (
        Project.objects.filter(contact=request.portal_contact)
        .select_related("quote", "store", "manager")
        .prefetch_related("stages")
        .order_by("-updated_at")
    )
    return render(
        request,
        "portal/projects.html",
        {"contact": request.portal_contact, "projects": items},
    )


@portal_contact_required
def project_detail(request, project_id):
    contact = request.portal_contact
    project_queryset = (
        Project.objects.filter(contact=contact)
        .select_related("quote", "store", "manager", "organization")
        .prefetch_related(
            Prefetch(
                "stages",
                queryset=ProjectStage.objects.order_by("sort_order", "created_at"),
            ),
            Prefetch(
                "updates",
                queryset=ProjectUpdate.objects.filter(
                    visibility=ProjectVisibility.CUSTOMER
                ).select_related("stage", "author"),
                to_attr="customer_updates",
            ),
            Prefetch(
                "files",
                queryset=ProjectFile.objects.filter(
                    visibility=ProjectVisibility.CUSTOMER
                ).select_related("uploaded_by"),
                to_attr="customer_files",
            ),
            Prefetch(
                "approvals",
                queryset=Approval.objects.filter(
                    requested_from_contact=contact
                ).order_by("-requested_at"),
                to_attr="customer_approvals",
            ),
        )
    )
    project = get_object_or_404(project_queryset, id=project_id)
    for approval in project.customer_approvals:
        if approval.status == ApprovalStatus.PENDING:
            approval.response_form = ApprovalResponseForm(
                prefix=f"approval-{approval.id}"
            )

    return render(
        request,
        "portal/project_detail.html",
        {"contact": contact, "project": project},
    )


@require_POST
@portal_contact_required
def respond_project_approval(request, project_id, approval_id):
    project = get_object_or_404(
        Project,
        id=project_id,
        contact=request.portal_contact,
    )
    form = ApprovalResponseForm(
        request.POST,
        prefix=f"approval-{approval_id}",
    )
    if not form.is_valid():
        messages.error(request, "تحقق من قرار الموافقة والملاحظة ثم حاول مرة أخرى.")
        return redirect("customer_portal:project_detail", project_id=project.id)

    try:
        respond_to_approval(
            approval_id=approval_id,
            project=project,
            contact=request.portal_contact,
            decision=form.cleaned_data["decision"],
            response_note=form.cleaned_data["response_note"],
        )
    except ApprovalResponseError:
        messages.error(request, "تعذر تسجيل الرد. قد تكون الموافقة أُجيب عليها مسبقًا.")
    else:
        messages.success(request, "تم تسجيل ردك على الموافقة.")
    return redirect("customer_portal:project_detail", project_id=project.id)


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
