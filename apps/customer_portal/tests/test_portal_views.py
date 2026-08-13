from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from apps.crm.models import Contact
from apps.services.choices import PriceType
from apps.services.models import Service, ServiceCategory

from ..models import SavedService


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        email="viewer@example.com",
        password="test-password-123",
        first_name="سارة",
        last_name="العميلة",
    )


@pytest.fixture
def service(db):
    category = ServiceCategory.objects.create(name="النمو", slug="growth-portal")
    return Service.objects.create(
        category=category,
        name="تحسين التحويل",
        slug="cro-portal",
        short_description="تحسين رحلة الشراء.",
        description="تفاصيل",
        price_type=PriceType.FIXED,
        price=Decimal("800.00"),
    )


@pytest.mark.django_db
def test_portal_requires_login(client):
    response = client.get(reverse("customer_portal:overview"))

    assert response.status_code == 302
    assert "/accounts/login/" in response.url


@pytest.mark.django_db
def test_portal_overview_creates_and_links_contact(client, user):
    client.force_login(user)

    response = client.get(reverse("customer_portal:overview"))

    assert response.status_code == 200
    contact = Contact.objects.get(user=user)
    assert contact.email == user.email
    assert "بوابة العميل" in response.content.decode()


@pytest.mark.django_db
def test_portal_returns_review_state_for_duplicate_contacts(client, user):
    Contact.objects.create(full_name="أول", email=user.email)
    Contact.objects.create(full_name="ثان", email=user.email.upper())
    client.force_login(user)

    response = client.get(reverse("customer_portal:overview"))

    assert response.status_code == 409
    assert not Contact.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_toggle_saved_service_adds_and_removes_service(client, user, service):
    client.force_login(user)
    contact = Contact.objects.create(
        user=user,
        full_name="سارة العميلة",
        email=user.email,
    )
    url = reverse("customer_portal:toggle_saved_service", args=[service.id])

    first_response = client.post(url)
    assert first_response.status_code == 302
    assert SavedService.objects.filter(contact=contact, service=service).exists()

    second_response = client.post(url)
    assert second_response.status_code == 302
    assert not SavedService.objects.filter(contact=contact, service=service).exists()
