import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from ..models import AuditLog


@pytest.mark.django_db
def test_healthz_reports_database_ready(client):
    response = client.get(reverse("healthz"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_audit_view_requires_staff(client):
    user = get_user_model().objects.create_user(
        email="customer-audit@example.com",
        password="test-password-123",
    )
    client.force_login(user)
    response = client.get(reverse("audit_log:index"))
    assert response.status_code == 302


@pytest.mark.django_db
def test_superuser_can_read_audit_view(client):
    user = get_user_model().objects.create_superuser(
        email="audit-admin@example.com",
        password="test-password-123",
    )
    AuditLog.objects.create(
        actor_user=user,
        action="TEST",
        object_type="crm.Contact",
        object_id="abc",
    )
    client.force_login(user)
    response = client.get(reverse("audit_log:index"))
    assert response.status_code == 200
    assert "crm.Contact" in response.content.decode()
