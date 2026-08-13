import uuid

from django.core.exceptions import ValidationError
from django.db import models

from apps.crm.models import Contact


class Campaign(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "EMAIL", "Email"
        WHATSAPP = "WHATSAPP", "WhatsApp"
        PAID_SOCIAL = "PAID_SOCIAL", "Paid social"
        SEARCH = "SEARCH", "Search"
        SEO = "SEO", "SEO"
        PARTNERSHIP = "PARTNERSHIP", "Partnership"
        REFERRAL = "REFERRAL", "Referral"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        PAUSED = "PAUSED", "Paused"
        COMPLETED = "COMPLETED", "Completed"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=180)
    channel = models.CharField(max_length=24, choices=Channel.choices)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    utm_source = models.CharField(max_length=120, blank=True)
    utm_medium = models.CharField(max_length=120, blank=True)
    utm_campaign = models.CharField(max_length=160, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "channel", "-created_at"]),
            models.Index(fields=["utm_campaign"]),
        ]

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at < self.starts_at:
            raise ValidationError({"ends_at": "Campaign end cannot precede its start."})

    def __str__(self):
        return self.name


class AttributionTouch(models.Model):
    class TouchType(models.TextChoices):
        FIRST_TOUCH = "FIRST_TOUCH", "First touch"
        TOUCH = "TOUCH", "Touch"
        CONVERSION_TOUCH = "CONVERSION_TOUCH", "Conversion touch"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="touches",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attribution_touches",
    )
    anonymous_session_id = models.CharField(max_length=64, blank=True)
    touch_type = models.CharField(
        max_length=24,
        choices=TouchType.choices,
        default=TouchType.TOUCH,
    )
    source = models.CharField(max_length=120, blank=True)
    medium = models.CharField(max_length=120, blank=True)
    campaign_name = models.CharField(max_length=160, blank=True)
    landing_page = models.CharField(max_length=500, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField()

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["contact", "-occurred_at"]),
            models.Index(fields=["campaign", "touch_type", "-occurred_at"]),
            models.Index(fields=["anonymous_session_id", "-occurred_at"]),
        ]

    def __str__(self):
        label = self.campaign_name or self.source or "Direct"
        return f"{self.get_touch_type_display()} — {label}"
