import json

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from apps.crm.models import Contact

from ..models import AnalyticsEvent


@pytest.mark.django_db
def test_collect_event_creates_first_party_event(client):
    response = client.post(
        reverse("analytics:collect_event"),
        data=json.dumps(
            {
                "event_name": "page_view",
                "page_path": "/services/",
                "utm_source": "google",
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 201
    event = AnalyticsEvent.objects.get()
    assert event.event_name == "page_view"
    assert event.anonymous_session_id
    assert event.user_id is None


@pytest.mark.django_db
def test_collect_event_links_authenticated_contact(client):
    user = get_user_model().objects.create_user(
        email="analytics@example.com",
        password="test-password-123",
    )
    contact = Contact.objects.create(
        user=user,
        full_name="عميل التحليلات",
        email=user.email,
    )
    client.force_login(user)

    response = client.post(
        reverse("analytics:collect_event"),
        data=json.dumps({"event_name": "service_view"}),
        content_type="application/json",
    )

    assert response.status_code == 201
    event = AnalyticsEvent.objects.get()
    assert event.user_id == user.id
    assert event.contact_id == contact.id


@pytest.mark.django_db
def test_collect_event_rejects_invalid_event_names(client):
    response = client.post(
        reverse("analytics:collect_event"),
        data=json.dumps({"event_name": "Bad Event Name"}),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert AnalyticsEvent.objects.count() == 0


@pytest.mark.django_db
def test_dashboard_requires_staff(client):
    user = get_user_model().objects.create_user(
        email="customer-dashboard@example.com",
        password="test-password-123",
    )
    client.force_login(user)

    response = client.get(reverse("ibtikar_dashboard:index"))

    assert response.status_code == 302
    assert "/control/login/" in response.url


@pytest.mark.django_db
def test_superuser_can_open_dashboard(client):
    user = get_user_model().objects.create_superuser(
        email="admin-dashboard@example.com",
        password="test-password-123",
    )
    client.force_login(user)

    response = client.get(reverse("ibtikar_dashboard:index"))

    assert response.status_code == 200
    assert "لوحة مؤشرات ابتكار تك" in response.content.decode()
