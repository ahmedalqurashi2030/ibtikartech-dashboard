from pathlib import Path

from django.contrib import messages
from django.db.models import Prefetch
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from apps.customer_portal.decorators import portal_contact_required

from .forms import CustomerTicketMessageForm, SupportTicketCreateForm
from .models import SupportTicket, TicketMessage
from .services import SupportMessageError, add_customer_message


@portal_contact_required
def tickets(request):
    items = (
        SupportTicket.objects.filter(contact=request.portal_contact)
        .select_related("project", "assigned_to")
        .order_by("-updated_at")
    )
    return render(
        request,
        "portal/support/tickets.html",
        {"contact": request.portal_contact, "tickets": items},
    )


@portal_contact_required
def create_ticket(request):
    form = SupportTicketCreateForm(
        request.POST or None,
        contact=request.portal_contact,
    )
    if request.method == "POST" and form.is_valid():
        ticket = form.save()
        messages.success(request, "تم إنشاء تذكرة الدعم بنجاح.")
        return redirect("support_portal:ticket_detail", ticket_id=ticket.id)

    return render(
        request,
        "portal/support/create_ticket.html",
        {"contact": request.portal_contact, "form": form},
    )


@portal_contact_required
def ticket_detail(request, ticket_id):
    ticket_queryset = (
        SupportTicket.objects.filter(contact=request.portal_contact)
        .select_related("project", "assigned_to")
        .prefetch_related(
            Prefetch(
                "messages",
                queryset=TicketMessage.objects.filter(is_internal=False)
                .select_related("sender_user", "sender_contact")
                .order_by("created_at"),
                to_attr="customer_messages",
            )
        )
    )
    ticket = get_object_or_404(ticket_queryset, id=ticket_id)
    return render(
        request,
        "portal/support/ticket_detail.html",
        {
            "contact": request.portal_contact,
            "ticket": ticket,
            "message_form": CustomerTicketMessageForm(),
        },
    )


@require_POST
@portal_contact_required
def add_message(request, ticket_id):
    form = CustomerTicketMessageForm(request.POST, request.FILES)
    if not form.is_valid():
        messages.error(request, "اكتب رسالة صحيحة ثم حاول مرة أخرى.")
        return redirect("support_portal:ticket_detail", ticket_id=ticket_id)

    try:
        add_customer_message(
            ticket_id=ticket_id,
            contact=request.portal_contact,
            body=form.cleaned_data["body"],
            attachment=form.cleaned_data["attachment"],
        )
    except SupportMessageError:
        messages.error(request, "تعذر إرسال الرسالة. قد تكون التذكرة مغلقة.")
    else:
        messages.success(request, "تم إرسال رسالتك إلى فريق الدعم.")
    return redirect("support_portal:ticket_detail", ticket_id=ticket_id)


@portal_contact_required
def download_attachment(request, ticket_id, message_id):
    message = get_object_or_404(
        TicketMessage.objects.select_related("ticket"),
        id=message_id,
        ticket_id=ticket_id,
        ticket__contact=request.portal_contact,
        is_internal=False,
    )
    if not message.attachment:
        raise Http404("Attachment not found.")

    filename = Path(message.attachment.name).name
    return FileResponse(
        message.attachment.open("rb"),
        as_attachment=True,
        filename=filename,
    )
