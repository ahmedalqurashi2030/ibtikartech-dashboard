from django.core.exceptions import ValidationError
from django.db import transaction

from .choices import TicketStatus
from .models import SupportTicket, TicketMessage


class SupportMessageError(Exception):
    """Raised when a customer message cannot be added safely."""


@transaction.atomic
def add_customer_message(*, ticket_id, contact, body, attachment=None):
    try:
        ticket = SupportTicket.objects.select_for_update().get(
            id=ticket_id,
            contact=contact,
        )
    except SupportTicket.DoesNotExist as exc:
        raise SupportMessageError("Ticket not found for this contact.") from exc

    if ticket.status == TicketStatus.CLOSED:
        raise SupportMessageError("Closed tickets cannot receive new customer messages.")

    message = TicketMessage(
        ticket=ticket,
        sender_contact=contact,
        body=(body or "").strip(),
        attachment=attachment,
        is_internal=False,
    )
    try:
        message.full_clean()
    except ValidationError as exc:
        raise SupportMessageError("Customer message validation failed.") from exc
    message.save()

    update_fields = ["updated_at"]
    if ticket.status in {TicketStatus.WAITING_CUSTOMER, TicketStatus.RESOLVED}:
        ticket.status = TicketStatus.OPEN
        update_fields.append("status")
    ticket.save(update_fields=update_fields)

    return message
