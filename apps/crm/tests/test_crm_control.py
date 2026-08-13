from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import NoReverseMatch, reverse
from django.utils import timezone

from apps.projects.models import Project
from apps.sales.models import Inquiry, Opportunity, Quote
from apps.support.models import SupportTicket

from ..models import ActivityEvent, ConsentRecord, Contact


@pytest.fixture
def superuser(db):
    return get_user_model().objects.create_superuser(
        email="admin@example.com",
        password="test-password-123",
    )


@pytest.fixture
def contact(db):
    return Contact.objects.create(
        full_name="شركة نور — محمد",
        email="mohammed@example.com",
        phone="0500000000",
        lifecycle_stage=Contact.LifecycleStage.CUSTOMER,
    )


@pytest.mark.django_db
def test_customer360_requires_staff_access(client, contact):
    user = get_user_model().objects.create_user(
        email="not-staff-control@example.com",
        password="test-password-123",
    )
    client.force_login(user)

    response = client.get(reverse("customer_360:index"))

    assert response.status_code == 302
    assert "/control/login/" in response.url


@pytest.mark.django_db
def test_customer360_search_returns_matching_contact(client, superuser, contact):
    Contact.objects.create(full_name="عميل مختلف", email="different@example.com")
    client.force_login(superuser)

    response = client.get(reverse("customer_360:index"), {"q": "محمد"})
    content = response.content.decode()

    assert response.status_code == 200
    assert contact.full_name in content
    assert "عميل مختلف" not in content


@pytest.mark.django_db
def test_customer360_detail_aggregates_commercial_and_delivery_data(
    client,
    superuser,
    contact,
):
    inquiry = Inquiry.objects.create(
        contact=contact,
        inquiry_type="GENERAL",
        message="طلب تحسين المتجر",
    )
    opportunity = Opportunity.objects.create(
        contact=contact,
        inquiry=inquiry,
        title="فرصة تحسين التحويل",
        estimated_value=Decimal("3500.00"),
    )
    quote = Quote.objects.create(
        opportunity=opportunity,
        contact=contact,
        grand_total=Decimal("3500.00"),
    )
    project = Project.objects.create(
        quote=quote,
        contact=contact,
        name="مشروع تحسين المتجر",
        progress_percentage=40,
    )
    SupportTicket.objects.create(
        contact=contact,
        project=project,
        subject="استفسار عن التسليم",
        description="تفاصيل",
    )
    ActivityEvent.objects.create(
        contact=contact,
        actor_user=superuser,
        event_type="NOTE",
        title="مكالمة متابعة",
        description="تمت مناقشة الخطوة القادمة.",
    )
    client.force_login(superuser)

    response = client.get(reverse("customer_360:detail", args=[contact.id]))
    content = response.content.decode()

    assert response.status_code == 200
    assert "فرصة تحسين التحويل" in content
    assert quote.quote_number in content
    assert "مشروع تحسين المتجر" in content
    assert "استفسار عن التسليم" in content
    assert "مكالمة متابعة" in content


@pytest.mark.django_db
def test_consent_ledger_is_append_only_from_custom_control_routes():
    assert reverse("consent_ledger:index").endswith("/consent_ledger/")
    assert reverse("consent_ledger:add").endswith("/consent_ledger/add/")

    with pytest.raises(NoReverseMatch):
        reverse("consent_ledger:edit", args=["00000000-0000-0000-0000-000000000000"])
    with pytest.raises(NoReverseMatch):
        reverse("consent_ledger:delete", args=["00000000-0000-0000-0000-000000000000"])


@pytest.mark.django_db
def test_superuser_can_add_consent_record(client, superuser, contact):
    client.force_login(superuser)
    now = timezone.localtime().strftime("%Y-%m-%dT%H:%M")

    response = client.post(
        reverse("consent_ledger:add"),
        {
            "contact": str(contact.id),
            "channel": ConsentRecord.Channel.EMAIL,
            "purpose": "MARKETING",
            "status": ConsentRecord.Status.GRANTED,
            "source": "CONTROL",
            "policy_version": "v1",
            "granted_at": now,
            "withdrawn_at": "",
            "ip_address": "",
            "user_agent": "control-test",
        },
    )

    assert response.status_code == 302
    assert ConsentRecord.objects.filter(
        contact=contact,
        purpose="MARKETING",
        status=ConsentRecord.Status.GRANTED,
    ).exists()


@pytest.mark.django_db
def test_activity_add_sets_current_staff_actor(client, superuser, contact):
    client.force_login(superuser)

    response = client.post(
        reverse("crm_activity:add"),
        {
            "contact": str(contact.id),
            "event_type": "CALL",
            "reference_type": "",
            "reference_id": "",
            "title": "مكالمة جديدة",
            "description": "تم التواصل مع العميل.",
            "metadata": "{}",
        },
    )

    assert response.status_code == 302
    event = ActivityEvent.objects.get(contact=contact, title="مكالمة جديدة")
    assert event.actor_user_id == superuser.id
