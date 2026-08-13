import pytest
from django.urls import reverse

from apps.crm.models import Contact
from apps.sales.models import Inquiry

from ..choices import ActionType, PriceType
from ..models import Service, ServiceCategory


@pytest.fixture
def service(db):
    category = ServiceCategory.objects.create(
        name="المتاجر الإلكترونية",
        slug="ecommerce-public",
    )
    return Service.objects.create(
        category=category,
        name="تحسين صفحة المنتج",
        slug="public-product-page",
        short_description="رفع جودة صفحة المنتج.",
        description="تفاصيل الخدمة.",
        price_type=PriceType.QUOTE,
        action_type=ActionType.REQUEST_QUOTE,
    )


@pytest.mark.django_db
def test_public_service_index_and_detail(client, service):
    index_response = client.get(reverse("services:index"))
    detail_response = client.get(reverse("services:detail", args=[service.slug]))

    assert index_response.status_code == 200
    assert service.name in index_response.content.decode()
    assert detail_response.status_code == 200
    assert service.name in detail_response.content.decode()


@pytest.mark.django_db
def test_inactive_service_is_not_public(client, service):
    service.is_active = False
    service.save(update_fields=["is_active", "updated_at"])

    response = client.get(reverse("services:detail", args=[service.slug]))
    assert response.status_code == 404


@pytest.mark.django_db
def test_guest_can_request_service_without_account(client, service):
    response = client.post(
        reverse("services:request", args=[service.slug]),
        {
            "full_name": "محمد أحمد",
            "email": "guest@example.com",
            "phone": "0500000000",
            "store_url": "https://example.com",
            "message": "أحتاج تحسين التحويل.",
        },
    )

    assert response.status_code == 302
    contact = Contact.objects.get(email="guest@example.com")
    inquiry = Inquiry.objects.get(contact=contact)
    assert inquiry.service_id == service.id
    assert inquiry.source == "WEB_SERVICE"


@pytest.mark.django_db
def test_guest_request_does_not_create_third_duplicate_contact(client, service):
    Contact.objects.create(full_name="الأول", email="shared@example.com")
    Contact.objects.create(full_name="الثاني", email="shared@example.com")

    response = client.post(
        reverse("services:request", args=[service.slug]),
        {
            "full_name": "ثالث",
            "email": "shared@example.com",
            "phone": "",
            "store_url": "",
            "message": "طلب",
        },
    )

    assert response.status_code == 200
    assert Contact.objects.filter(email="shared@example.com").count() == 2
    assert Inquiry.objects.count() == 0
    assert "تعذر ربط الطلب" in response.content.decode()
