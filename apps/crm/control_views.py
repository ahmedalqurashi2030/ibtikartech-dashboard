from functools import wraps

from django.contrib import messages
from django.contrib.auth.decorators import login_required, permission_required, user_passes_test
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from apps.projects.models import Project
from apps.sales.models import Inquiry, Opportunity, Quote
from apps.support.models import SupportTicket

from .control_forms import ActivityEventCreateForm, ConsentRecordCreateForm
from .models import ActivityEvent, ConsentRecord, Contact


def control_permission(permission):
    def decorator(view_func):
        @wraps(view_func)
        @login_required(login_url="/control/login/")
        @user_passes_test(
            lambda user: user.is_active and user.is_staff,
            login_url="/control/login/",
        )
        @permission_required(permission, raise_exception=True)
        def wrapped(request, *args, **kwargs):
            return view_func(request, *args, **kwargs)

        return wrapped

    return decorator


def _contact_timeline(contact):
    events = []

    for item in contact.activity_events.all()[:15]:
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "CRM",
                "title": item.title,
                "status": item.event_type,
                "description": item.description,
            }
        )

    for item in contact.inquiries.all()[:10]:
        service_name = item.service.name if item.service_id else item.get_inquiry_type_display()
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "طلب",
                "title": service_name,
                "status": item.get_status_display(),
                "description": item.message,
            }
        )

    for item in contact.opportunities.all()[:10]:
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "فرصة",
                "title": item.title,
                "status": item.get_stage_display(),
                "description": "",
            }
        )

    for item in contact.quotes.all()[:10]:
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "عرض سعر",
                "title": item.quote_number,
                "status": item.get_status_display(),
                "description": f"{item.grand_total} {item.currency}",
            }
        )

    for item in contact.projects.all()[:10]:
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "مشروع",
                "title": item.name,
                "status": item.get_status_display(),
                "description": f"نسبة الإنجاز {item.progress_percentage}%",
            }
        )

    for item in contact.support_tickets.all()[:10]:
        events.append(
            {
                "occurred_at": item.created_at,
                "kind": "دعم",
                "title": item.subject,
                "status": item.get_status_display(),
                "description": item.ticket_number,
            }
        )

    return sorted(events, key=lambda event: event["occurred_at"], reverse=True)[:50]


@control_permission("crm.view_contact")
def customer360_index(request):
    query = request.GET.get("q", "").strip()
    lifecycle = request.GET.get("lifecycle", "").strip()
    status = request.GET.get("status", "").strip()

    contacts = Contact.objects.select_related("user", "owner")
    if query:
        contacts = contacts.filter(
            Q(full_name__icontains=query)
            | Q(email__icontains=query)
            | Q(phone__icontains=query)
        )
    if lifecycle in Contact.LifecycleStage.values:
        contacts = contacts.filter(lifecycle_stage=lifecycle)
    if status in Contact.Status.values:
        contacts = contacts.filter(status=status)

    paginator = Paginator(contacts.order_by("-last_activity_at", "-created_at"), 40)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(
        request,
        "control/crm/customer360_index.html",
        {
            "page_obj": page_obj,
            "query": query,
            "selected_lifecycle": lifecycle,
            "selected_status": status,
            "lifecycle_choices": Contact.LifecycleStage.choices,
            "status_choices": Contact.Status.choices,
        },
    )


@control_permission("crm.view_contact")
def customer360_detail(request, contact_id):
    contact = get_object_or_404(
        Contact.objects.select_related("user", "owner"),
        id=contact_id,
    )

    organization_links = list(
        contact.organization_links.select_related("organization").order_by("-is_primary", "created_at")
    )
    stores = list(contact.stores.select_related("organization").order_by("name"))
    saved_services = list(
        contact.saved_services.select_related("service", "service__category")[:12]
    )
    consents = list(contact.consent_records.all()[:12])
    inquiries = list(
        Inquiry.objects.filter(contact=contact).select_related("service", "store")[:12]
    )
    opportunities = list(
        Opportunity.objects.filter(contact=contact).select_related("service", "assigned_to")[:12]
    )
    quotes = list(
        Quote.objects.filter(contact=contact).select_related("opportunity")[:12]
    )
    projects = list(
        Project.objects.filter(contact=contact).select_related("manager", "store")[:12]
    )
    tickets = list(
        SupportTicket.objects.filter(contact=contact).select_related("project", "assigned_to")[:12]
    )

    return render(
        request,
        "control/crm/customer360_detail.html",
        {
            "contact": contact,
            "organization_links": organization_links,
            "stores": stores,
            "saved_services": saved_services,
            "consents": consents,
            "inquiries": inquiries,
            "opportunities": opportunities,
            "quotes": quotes,
            "projects": projects,
            "tickets": tickets,
            "timeline": _contact_timeline(contact),
            "counts": {
                "stores": contact.stores.count(),
                "inquiries": contact.inquiries.count(),
                "opportunities": contact.opportunities.count(),
                "quotes": contact.quotes.count(),
                "projects": contact.projects.count(),
                "tickets": contact.support_tickets.count(),
            },
        },
    )


@control_permission("crm.view_consentrecord")
def consent_index(request):
    query = request.GET.get("q", "").strip()
    records = ConsentRecord.objects.select_related("contact")
    if query:
        records = records.filter(
            Q(contact__full_name__icontains=query)
            | Q(contact__email__icontains=query)
            | Q(purpose__icontains=query)
            | Q(source__icontains=query)
        )

    page_obj = Paginator(records.order_by("-created_at"), 50).get_page(request.GET.get("page"))
    return render(
        request,
        "control/crm/consent_index.html",
        {"page_obj": page_obj, "query": query},
    )


@control_permission("crm.add_consentrecord")
def consent_add(request):
    form = ConsentRecordCreateForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        record = form.save()
        messages.success(request, "تمت إضافة سجل الموافقة إلى السجل التاريخي.")
        return redirect(f"{reverse('consent_ledger:index')}?q={record.contact.email}")

    return render(
        request,
        "control/crm/consent_add.html",
        {"form": form},
    )


@control_permission("crm.view_activityevent")
def activity_index(request):
    query = request.GET.get("q", "").strip()
    events = ActivityEvent.objects.select_related("contact", "actor_user")
    if query:
        events = events.filter(
            Q(contact__full_name__icontains=query)
            | Q(contact__email__icontains=query)
            | Q(title__icontains=query)
            | Q(event_type__icontains=query)
        )

    page_obj = Paginator(events.order_by("-created_at"), 50).get_page(request.GET.get("page"))
    return render(
        request,
        "control/crm/activity_index.html",
        {"page_obj": page_obj, "query": query},
    )


@control_permission("crm.add_activityevent")
def activity_add(request):
    form = ActivityEventCreateForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        event = form.save(commit=False)
        event.actor_user = request.user
        event.save()
        messages.success(request, "تمت إضافة النشاط إلى Timeline العميل.")
        return redirect(f"{reverse('crm_activity:index')}?q={event.contact.email}")

    return render(
        request,
        "control/crm/activity_add.html",
        {"form": form},
    )
