from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from ..models import Contact, ConsentRecord, Organization, OrganizationContact


@pytest.fixture
def contact(db):
    return Contact.objects.create(full_name="عميل CRM", email="crm@example.com")


@pytest.fixture
def other_contact(db):
    return Contact.objects.create(full_name="عميل آخر", email="crm-other@example.com")


@pytest.mark.django_db
def test_contact_owner_must_be_staff(contact):
    regular_user = get_user_model().objects.create_user(
        email="owner@example.com",
        password="test-password-123",
    )
    contact.owner = regular_user

    with pytest.raises(ValidationError) as exc_info:
        contact.full_clean()

    assert "owner" in exc_info.value.message_dict


@pytest.mark.django_db
def test_organization_has_only_one_primary_contact(contact, other_contact):
    organization = Organization.objects.create(name="شركة الاختبار")
    OrganizationContact.objects.create(
        organization=organization,
        contact=contact,
        is_primary=True,
    )

    with pytest.raises(IntegrityError), transaction.atomic():
        OrganizationContact.objects.create(
            organization=organization,
            contact=other_contact,
            is_primary=True,
        )


@pytest.mark.django_db
def test_granted_consent_requires_granted_timestamp(contact):
    record = ConsentRecord(
        contact=contact,
        channel=ConsentRecord.Channel.EMAIL,
        purpose="MARKETING",
        status=ConsentRecord.Status.GRANTED,
        source="PORTAL",
        policy_version="v1",
    )

    with pytest.raises(ValidationError) as exc_info:
        record.full_clean()

    assert "granted_at" in exc_info.value.message_dict

    record.granted_at = timezone.now()
    record.full_clean()


@pytest.mark.django_db
def test_withdrawn_consent_requires_timestamp_and_valid_order(contact):
    granted_at = timezone.now()
    record = ConsentRecord(
        contact=contact,
        channel=ConsentRecord.Channel.WHATSAPP,
        purpose="MARKETING",
        status=ConsentRecord.Status.WITHDRAWN,
        source="MANUAL",
        policy_version="v1",
        granted_at=granted_at,
        withdrawn_at=granted_at - timedelta(minutes=1),
    )

    with pytest.raises(ValidationError) as exc_info:
        record.full_clean()

    assert "withdrawn_at" in exc_info.value.message_dict
