import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.crm.models import Contact
from apps.projects.models import Project

from ..choices import TicketStatus
from ..models import SupportTicket, TicketMessage
from ..services import SupportMessageError, add_customer_message


@pytest.fixture
def contact(db):
    return Contact.objects.create(full_name="عميل الدعم", email="support@example.com")


@pytest.fixture
def other_contact(db):
    return Contact.objects.create(full_name="عميل آخر", email="support-other@example.com")


@pytest.fixture
def staff_user(db):
    return get_user_model().objects.create_user(
        email="support-agent@example.com",
        password="test-password-123",
        is_staff=True,
    )


@pytest.fixture
def ticket(contact):
    return SupportTicket.objects.create(
        contact=contact,
        subject="مشكلة في المتجر",
        description="تفاصيل المشكلة",
    )


@pytest.mark.django_db
def test_ticket_project_must_belong_to_same_contact(contact, other_contact):
    project = Project.objects.create(contact=other_contact, name="مشروع عميل آخر")
    ticket = SupportTicket(
        contact=contact,
        project=project,
        subject="تذكرة غير متطابقة",
        description="تفاصيل",
    )

    with pytest.raises(ValidationError) as exc_info:
        ticket.full_clean()

    assert "project" in exc_info.value.message_dict


@pytest.mark.django_db
def test_closed_ticket_requires_closed_timestamp(contact):
    ticket = SupportTicket(
        contact=contact,
        subject="تذكرة مغلقة",
        description="تفاصيل",
        status=TicketStatus.CLOSED,
    )

    with pytest.raises(ValidationError) as exc_info:
        ticket.full_clean()

    assert "closed_at" in exc_info.value.message_dict

    ticket.closed_at = timezone.now()
    ticket.full_clean()


@pytest.mark.django_db
def test_ticket_message_requires_exactly_one_sender(ticket, contact, staff_user):
    no_sender = TicketMessage(ticket=ticket, body="بدون مرسل")
    with pytest.raises(ValidationError):
        no_sender.full_clean()

    two_senders = TicketMessage(
        ticket=ticket,
        sender_user=staff_user,
        sender_contact=contact,
        body="مرسلان",
    )
    with pytest.raises(ValidationError):
        two_senders.full_clean()


@pytest.mark.django_db
def test_customer_message_cannot_be_internal(ticket, contact):
    message = TicketMessage(
        ticket=ticket,
        sender_contact=contact,
        body="رسالة عميل",
        is_internal=True,
    )

    with pytest.raises(ValidationError) as exc_info:
        message.full_clean()

    assert "is_internal" in exc_info.value.message_dict


@pytest.mark.django_db
def test_customer_reply_reopens_resolved_ticket(ticket, contact):
    ticket.status = TicketStatus.RESOLVED
    ticket.save(update_fields=["status", "updated_at"])

    message = add_customer_message(
        ticket_id=ticket.id,
        contact=contact,
        body="المشكلة ما زالت موجودة",
    )

    ticket.refresh_from_db()
    assert message.sender_contact_id == contact.id
    assert ticket.status == TicketStatus.OPEN


@pytest.mark.django_db
def test_closed_ticket_rejects_customer_reply(ticket, contact):
    ticket.status = TicketStatus.CLOSED
    ticket.closed_at = timezone.now()
    ticket.save(update_fields=["status", "closed_at", "updated_at"])

    with pytest.raises(SupportMessageError):
        add_customer_message(
            ticket_id=ticket.id,
            contact=contact,
            body="محاولة رد بعد الإغلاق",
        )

    assert ticket.messages.count() == 0
