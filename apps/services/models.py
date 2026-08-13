import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from .choices import ActionType, PriceType


class ServiceCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    short_description = models.CharField(max_length=320, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="services/categories/", blank=True)
    icon = models.CharField(max_length=100, blank=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=170, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        indexes = [
            models.Index(fields=["is_active", "sort_order"]),
        ]

    def __str__(self):
        return self.name


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="services",
    )
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    short_description = models.CharField(max_length=360)
    description = models.TextField()
    price_type = models.CharField(max_length=32, choices=PriceType.choices)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    currency = models.CharField(max_length=3, default="SAR")
    delivery_time = models.CharField(max_length=120, blank=True)
    scope = models.TextField(blank=True)
    exclusions = models.TextField(blank=True)
    deliverables = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    process = models.JSONField(default=list, blank=True)
    revision_policy = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to="services/featured/", blank=True)
    gallery_data = models.JSONField(default=list, blank=True)
    action_type = models.CharField(
        max_length=32,
        choices=ActionType.choices,
        default=ActionType.WHATSAPP,
    )
    action_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=170, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category__sort_order", "sort_order", "name"]
        indexes = [
            models.Index(fields=["category", "is_active", "sort_order"]),
            models.Index(fields=["is_featured", "is_active"]),
            models.Index(fields=["price_type"]),
        ]

    def clean(self):
        super().clean()
        priced = {PriceType.FIXED, PriceType.STARTING_FROM}
        if self.price_type in priced and self.price is None:
            raise ValidationError({"price": "A price is required for this price type."})
        if self.price_type in {PriceType.QUOTE, PriceType.FREE} and self.price not in {
            None,
            Decimal("0"),
        }:
            raise ValidationError(
                {"price": "Quote/free services should not carry a positive catalog price."}
            )
        if self.price is not None and self.price < 0:
            raise ValidationError({"price": "Price cannot be negative."})

    def __str__(self):
        return self.name
