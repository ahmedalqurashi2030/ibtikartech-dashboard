import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.crm.models import Contact
from apps.services.models import Service


class AnalyticsEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    anonymous_session_id = models.CharField(max_length=64, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    event_name = models.CharField(max_length=80)
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    page_path = models.CharField(max_length=500, blank=True)
    utm_source = models.CharField(max_length=120, blank=True)
    utm_medium = models.CharField(max_length=120, blank=True)
    utm_campaign = models.CharField(max_length=160, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["event_name", "-occurred_at"]),
            models.Index(fields=["contact", "-occurred_at"]),
            models.Index(fields=["service", "-occurred_at"]),
            models.Index(fields=["anonymous_session_id", "-occurred_at"]),
        ]

    def __str__(self):
        return f"{self.event_name} — {self.occurred_at:%Y-%m-%d %H:%M}"
