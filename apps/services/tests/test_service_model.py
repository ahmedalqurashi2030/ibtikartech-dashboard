from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError

from apps.services.choices import PriceType
from apps.services.models import Service, ServiceCategory

pytestmark = pytest.mark.django_db


def test_fixed_service_requires_price():
    category = ServiceCategory.objects.create(name="Salla", slug="salla")
    service = Service(
        category=category,
        name="Product page optimization",
        slug="product-page-optimization",
        short_description="Improve conversion.",
        description="Detailed scope.",
        price_type=PriceType.FIXED,
        price=None,
    )
    with pytest.raises(ValidationError):
        service.full_clean()


def test_free_service_accepts_zero_price():
    category = ServiceCategory.objects.create(name="Consulting", slug="consulting")
    service = Service(
        category=category,
        name="Intro call",
        slug="intro-call",
        short_description="Short discovery call.",
        description="Initial consultation.",
        price_type=PriceType.FREE,
        price=Decimal("0"),
    )
    service.full_clean()
