import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse

from apps.crm.models import Contact
from apps.projects.models import Project

from ..choices import TicketStatus
from ..models import SupportTicket, TicketMessage


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        email="support-viewer@example.com",
        password="test-password-123",
        first_name="ريم",
        last_name="العميلة",
    )


@pytest.fixture
def contact(user):
    return Contact.objects.create(
        user=user,
        full_name="ريم العميلة",
        email=user.email,
    )


@pytest.fixture
def ticket(contact):
    return SupportTicket.objects.create(
        contact=contact,
        subject="مشكلة في الطلب",
        description="تفاصيل المشكلة",
    )


@pytest.mark.django_db
def test_support_portal_requires_login(client):
    response = client.get(reverse("support_portal:tickets"))

    assert response.status_code == 302
    assert "/accounts/login/" in response.url


@pytest.mark.django_db
def test_customer_cannot_view_other_customers_ticket(client, user, ticket):
    other_contact = Contact.objects.create(
        full_name="عميل آخر",
        email="ticket-other@example.com",
    )
    other_ticket = SupportTicket.objects.create(
        contact=other_contact,
        subject="تذكرة خاصة",
        description="سرية",
    )
    client.force_login(user)

    own_response = client.get(reverse("support_portal:ticket_detail", args=[ticket.id]))
    other_response = client.get(
        reverse("support_portal:ticket_detail", args=[other_ticket.id])
    )

    assert own_response.status_code == 200
    assert other_response.status_code == 404


@pytest.mark.django_db
def test_internal_support_messages_are_not_rendered(client, user, ticket, contact):
    staff = get_user_model().objects.create_user(
        email="private-support@example.com",
        password="test-password-123",
        is_staff=True,
    )
    TicketMessage.objects.create(
        ticket=ticket,
        sender_user=staff,
        body="ملاحظة داخلية سرية",
        is_internal=True,
    )
    TicketMessage.objects.create(
        ticket=ticket,
        sender_user=staff,
        body="رد ظاهر للعميل",
        is_internal=False,
    )
    TicketMessage.objects.create(
        ticket=ticket,
        sender_contact=contact,
        body="رسالة العميل",
    )
    client.force_login(user)

    response = client.get(reverse("support_portal:ticket_detail", args=[ticket.id]))
    content = response.content.decode()

    assert response.status_code == 200
    assert "رد ظاهر للعميل" in content
    assert "رسالة العميل" in content
    assert "ملاحظة داخلية سرية" not in content


@pytest.mark.django_db
def test_customer_cannot_link_new_ticket_to_other_customers_project(client, user, contact):
    other_contact = Contact.objects.create(
        full_name="عميل آخر",
        email="project-owner@example.com",
    )
    other_project = Project.objects.create(contact=other_contact, name="مشروع آخر")
    client.force_login(user)

    response = client.post(
        reverse("support_portal:create_ticket"),
        {
            "project": str(other_project.id),
            "subject": "محاولة ربط خاطئة",
            "description": "تفاصيل",
            "priority": "NORMAL",
        },
    )

    assert response.status_code == 200
    assert not SupportTicket.objects.filter(contact=contact).exists()


@pytest.mark.django_db
def test_customer_reply_reopens_resolved_ticket_from_portal(client, user, ticket):
    ticket.status = TicketStatus.RESOLVED
    ticket.save(update_fields=["status", "updated_at"])
    client.force_login(user)

    response = client.post(
        reverse("support_portal:add_message", args=[ticket.id]),
        {"body": "ما زالت المشكلة مستمرة"},
    )

    assert response.status_code == 302
    ticket.refresh_from_db()
    assert ticket.status == TicketStatus.OPEN
    assert ticket.messages.filter(body="ما زالت المشكلة مستمرة").exists()


@pytest.mark.django_db
def test_support_attachment_download_is_scoped_and_internal_files_are_hidden(
    client,
    user,
    ticket,
    tmp_path,
):
    staff = get_user_model().objects.create_user(
        email="attachment-agent@example.com",
        password="test-password-123",
        is_staff=True,
    )

    with override_settings(MEDIA_ROOT=tmp_path):
        visible = TicketMessage.objects.create(
            ticket=ticket,
            sender_user=staff,
            body="ملف ظاهر",
            attachment=SimpleUploadedFile("guide.pdf", b"visible-file"),
            is_internal=False,
        )
        internal = TicketMessage.objects.create(
            ticket=ticket,
            sender_user=staff,
            body="ملف داخلي",
            attachment=SimpleUploadedFile("private.pdf", b"internal-file"),
            is_internal=True,
        )
        client.force_login(user)

        visible_response = client.get(
            reverse(
                "support_portal:download_attachment",
                args=[ticket.id, visible.id],
            )
        )
        internal_response = client.get(
            reverse(
                "support_portal:download_attachment",
                args=[ticket.id, internal.id],
            )
        )

        assert visible_response.status_code == 200
        assert internal_response.status_code == 404
