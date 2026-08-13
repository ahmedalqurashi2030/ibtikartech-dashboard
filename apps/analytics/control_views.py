from datetime import timedelta

from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Sum
from django.shortcuts import render
from django.utils import timezone

from apps.crm.models import Contact
from apps.projects.choices import ProjectStatus
from apps.projects.models import Project
from apps.sales.choices import InquiryStatus, OpportunityStage, QuoteStatus
from apps.sales.models import Inquiry, Opportunity, Quote
from apps.support.choices import TicketStatus
from apps.support.models import SupportTicket

from .models import AnalyticsEvent


def staff_control_required(view_func):
    return login_required(login_url="/control/login/")(
        user_passes_test(
            lambda user: user.is_active and user.is_staff,
            login_url="/control/login/",
        )(view_func)
    )


@staff_control_required
def dashboard(request):
    since = timezone.now() - timedelta(days=30)
    active_stages = [
        OpportunityStage.NEW,
        OpportunityStage.CONTACTED,
        OpportunityStage.QUALIFIED,
        OpportunityStage.QUOTE_SENT,
        OpportunityStage.NEGOTIATION,
    ]
    active_project_statuses = [
        ProjectStatus.PLANNING,
        ProjectStatus.WAITING_CLIENT,
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.REVIEW,
        ProjectStatus.REVISION,
        ProjectStatus.ON_HOLD,
    ]
    open_ticket_statuses = [
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
        TicketStatus.WAITING_CUSTOMER,
    ]

    pipeline = Opportunity.objects.filter(stage__in=active_stages)
    accepted_quotes = Quote.objects.filter(
        status=QuoteStatus.ACCEPTED,
        accepted_at__gte=since,
    )
    events = AnalyticsEvent.objects.filter(occurred_at__gte=since)

    top_services = list(
        events.filter(service__isnull=False)
        .values("service__name")
        .annotate(total=Count("id"))
        .order_by("-total")[:8]
    )
    top_events = list(
        events.values("event_name")
        .annotate(total=Count("id"))
        .order_by("-total")[:10]
    )

    context = {
        "period_days": 30,
        "kpis": {
            "contacts": Contact.objects.count(),
            "new_contacts": Contact.objects.filter(created_at__gte=since).count(),
            "new_inquiries": Inquiry.objects.filter(
                status__in=[InquiryStatus.NEW, InquiryStatus.REVIEWING]
            ).count(),
            "pipeline_count": pipeline.count(),
            "pipeline_value": pipeline.aggregate(total=Sum("estimated_value"))["total"] or 0,
            "accepted_quote_value": accepted_quotes.aggregate(total=Sum("grand_total"))[
                "total"
            ]
            or 0,
            "active_projects": Project.objects.filter(
                status__in=active_project_statuses
            ).count(),
            "open_tickets": SupportTicket.objects.filter(
                status__in=open_ticket_statuses
            ).count(),
            "events": events.count(),
            "whatsapp_clicks": events.filter(event_name="whatsapp_click").count(),
            "tharaa_marketplace_clicks": events.filter(
                event_name="tharaa_marketplace_click"
            ).count(),
        },
        "top_services": top_services,
        "top_events": top_events,
        "recent_events": events.select_related("contact", "service")[:20],
    }
    return render(request, "control/analytics/dashboard.html", context)


@staff_control_required
def event_index(request):
    events = AnalyticsEvent.objects.select_related("contact", "service", "user")[:250]
    return render(
        request,
        "control/analytics/events.html",
        {"events": events},
    )
