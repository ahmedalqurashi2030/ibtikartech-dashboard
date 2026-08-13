import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from apps.services.choices import PriceType
from apps.services.models import Service, ServiceCategory

from ..audit import AuditContextMiddleware
from ..models import AuditLog


@pytest.mark.django_db
def test_business_model_changes_are_audited():
    category = ServiceCategory.objects.create(name="Salla", slug="audit-salla")
    service = Service.objects.create(
        category=category,
        name="Service before",
        slug="audit-service",
        short_description="Short",
        description="Description",
        price_type=PriceType.FREE,
        price=0,
    )

    create_log = AuditLog.objects.filter(
        object_type="services.Service",
        object_id=str(service.id),
        action="CREATE",
    ).get()
    assert create_log.after_data["name"] == "Service before"

    service.name = "Service after"
    service.save(update_fields=["name", "updated_at"])

    update_log = AuditLog.objects.filter(
        object_type="services.Service",
        object_id=str(service.id),
        action="UPDATE",
    ).latest("created_at")
    assert update_log.before_data["name"] == "Service before"
    assert update_log.after_data["name"] == "Service after"


@pytest.mark.django_db
def test_request_context_records_staff_actor_and_ip():
    user = get_user_model().objects.create_superuser(
        email="audit-owner@example.com",
        password="test-password-123",
    )
    category = ServiceCategory.objects.create(name="Audit", slug="audit-context")
    AuditLog.objects.all().delete()

    request = RequestFactory().get("/control/")
    request.user = user
    request.META["REMOTE_ADDR"] = "127.0.0.1"

    def save_inside_request(_request):
        Service.objects.create(
            category=category,
            name="Context service",
            slug="context-service",
            short_description="Short",
            description="Description",
            price_type=PriceType.FREE,
            price=0,
        )
        return None

    AuditContextMiddleware(save_inside_request)(request)

    log = AuditLog.objects.get(object_type="services.Service", action="CREATE")
    assert log.actor_user_id == user.id
    assert log.ip_address == "127.0.0.1"


@pytest.mark.django_db
def test_user_password_is_never_written_to_audit_snapshot():
    user = get_user_model().objects.create_user(
        email="audit-password@example.com",
        password="top-secret-password",
    )
    log = AuditLog.objects.filter(
        object_type="accounts.User",
        object_id=str(user.id),
        action="CREATE",
    ).get()
    assert "password" not in log.after_data
