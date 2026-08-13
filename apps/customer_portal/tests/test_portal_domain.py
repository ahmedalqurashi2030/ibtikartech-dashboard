from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from apps.crm.models import Contact, Store
from apps.services.choices import PriceType
from apps.services.models import Service, ServiceCategory

from ..models import CustomerPreference, SavedService
from ..services import ContactResolutionError, get_or_link_contact_for_user


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        email="portal@example.com",
        password="test-password-123",
        first_name="أحمد",
        last_name="العميل",
    )


@pytest.fixture
def contact(db):
    return Contact.objects.create(
        full_name="عميل البوابة",
        email="contact@example.com",
    )


@pytest.fixture
def service(db):
    category = ServiceCategory.objects.create(name="خدمات سلة", slug="salla-services")
    return Service.objects.create(
        category=category,
        name="تحسين صفحة المنتج",
        slug="product-page-optimization-portal",
        short_description="تحسين صفحة المنتج لرفع التحويل.",
        description="تفاصيل الخدمة",
        price_type=PriceType.FIXED,
        price=Decimal("1200.00"),
    )


@pytest.mark.django_db
def test_contact_resolution_links_single_existing_contact(user):
    existing = Contact.objects.create(
        full_name="عميل موجود",
        email="PORTAL@example.com",
    )

    resolved = get_or_link_contact_for_user(user)

    assert resolved.pk == existing.pk
    resolved.refresh_from_db()
    assert resolved.user_id == user.id
    assert Contact.objects.filter(email__iexact=user.email).count() == 1


@pytest.mark.django_db
def test_contact_resolution_creates_contact_when_none_exists(user):
    resolved = get_or_link_contact_for_user(user)

    assert resolved.user_id == user.id
    assert resolved.email == user.email
    assert resolved.full_name == "أحمد العميل"
    assert resolved.first_source == "ACCOUNT"


@pytest.mark.django_db
def test_contact_resolution_stops_on_duplicate_crm_matches(user):
    Contact.objects.create(full_name="عميل أول", email=user.email)
    Contact.objects.create(full_name="عميل ثان", email=user.email.upper())
    before_count = Contact.objects.count()

    with pytest.raises(ContactResolutionError):
        get_or_link_contact_for_user(user)

    assert Contact.objects.count() == before_count
    assert not Contact.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_saved_service_is_unique_per_contact(contact, service):
    SavedService.objects.create(contact=contact, service=service)

    with pytest.raises(IntegrityError), transaction.atomic():
        SavedService.objects.create(contact=contact, service=service)


@pytest.mark.django_db
def test_preference_default_store_must_belong_to_contact(contact):
    another_contact = Contact.objects.create(
        full_name="عميل آخر",
        email="other@example.com",
    )
    store = Store.objects.create(
        primary_contact=another_contact,
        name="متجر آخر",
        platform=Store.Platform.SALLA,
    )
    preference = CustomerPreference(contact=contact, default_store=store)

    with pytest.raises(ValidationError) as exc_info:
        preference.full_clean()

    assert "default_store" in exc_info.value.message_dict
