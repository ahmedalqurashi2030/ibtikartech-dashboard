from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.crm.models import Contact
from apps.sales.choices import FollowUpStatus, OpportunityStage
from apps.sales.models import FollowUpTask, Opportunity, Quote, QuoteItem
from apps.services.choices import PriceType
from apps.services.models import Service, ServiceCategory


@pytest.fixture
def contact(db):
    return Contact.objects.create(full_name="عميل تجريبي", email="client@example.com")


@pytest.fixture
def service(db):
    category = ServiceCategory.objects.create(name="متاجر إلكترونية", slug="ecommerce")
    return Service.objects.create(
        category=category,
        name="تحسين صفحة المنتج",
        slug="product-page-optimization",
        short_description="تحسين تجربة وتحويل صفحة المنتج.",
        description="تفاصيل الخدمة",
        price_type=PriceType.FIXED,
        price=Decimal("1000.00"),
    )


@pytest.fixture
def opportunity(contact):
    return Opportunity.objects.create(
        contact=contact,
        title="فرصة تطوير المتجر",
        estimated_value=Decimal("2500.00"),
    )


@pytest.mark.django_db
def test_lost_opportunity_requires_reason(contact):
    opportunity = Opportunity(
        contact=contact,
        title="فرصة مفقودة",
        stage=OpportunityStage.LOST,
    )

    with pytest.raises(ValidationError) as exc_info:
        opportunity.full_clean()

    assert "lost_reason" in exc_info.value.message_dict


@pytest.mark.django_db
def test_completed_follow_up_requires_completed_at(opportunity):
    task = FollowUpTask(
        opportunity=opportunity,
        contact=opportunity.contact,
        title="متابعة العرض",
        status=FollowUpStatus.COMPLETED,
    )

    with pytest.raises(ValidationError) as exc_info:
        task.full_clean()

    assert "completed_at" in exc_info.value.message_dict

    task.completed_at = timezone.now()
    task.full_clean()


@pytest.mark.django_db
def test_quote_item_snapshots_service_and_recalculates_quote(opportunity, service):
    quote = Quote.objects.create(
        opportunity=opportunity,
        contact=opportunity.contact,
    )

    first = QuoteItem.objects.create(
        quote=quote,
        service=service,
        service_name_snapshot="",
        quantity=Decimal("2.00"),
        unit_price=Decimal("1000.00"),
        discount=Decimal("100.00"),
        tax=Decimal("285.00"),
    )
    QuoteItem.objects.create(
        quote=quote,
        service_name_snapshot="خدمة إضافية",
        quantity=Decimal("1.00"),
        unit_price=Decimal("500.00"),
        discount=Decimal("0.00"),
        tax=Decimal("75.00"),
    )

    assert first.service_name_snapshot == service.name
    assert first.description_snapshot == service.short_description
    assert first.total == Decimal("2185.00")

    grand_total = quote.recalculate_totals()
    quote.refresh_from_db()

    assert quote.subtotal == Decimal("2500.00")
    assert quote.discount == Decimal("100.00")
    assert quote.tax == Decimal("360.00")
    assert quote.grand_total == Decimal("2760.00")
    assert grand_total == Decimal("2760.00")


@pytest.mark.django_db
def test_quote_item_rejects_discount_above_line_subtotal(opportunity):
    quote = Quote.objects.create(
        opportunity=opportunity,
        contact=opportunity.contact,
    )
    item = QuoteItem(
        quote=quote,
        service_name_snapshot="خدمة",
        quantity=Decimal("1.00"),
        unit_price=Decimal("100.00"),
        discount=Decimal("101.00"),
    )

    with pytest.raises(ValidationError) as exc_info:
        item.full_clean()

    assert "discount" in exc_info.value.message_dict
