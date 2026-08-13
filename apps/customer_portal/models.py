import uuid

from django.core.exceptions import ValidationError
from django.db import models

from apps.crm.models import Contact, Store
from apps.services.models import Service


class SavedService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="saved_services",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="saved_by_contacts",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["contact", "service"],
                name="portal_unique_saved_service",
            )
        ]
        indexes = [
            models.Index(fields=["contact", "-created_at"]),
            models.Index(fields=["service", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.contact} — {self.service}"


class CustomerPreference(models.Model):
    class Language(models.TextChoices):
        ARABIC = "ar", "العربية"
        ENGLISH = "en", "English"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.OneToOneField(
        Contact,
        on_delete=models.CASCADE,
        related_name="customer_preference",
    )
    default_store = models.ForeignKey(
        Store,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="default_for_customer_preferences",
    )
    language = models.CharField(
        max_length=8,
        choices=Language.choices,
        default=Language.ARABIC,
    )
    timezone = models.CharField(max_length=64, default="Asia/Riyadh")
    portal_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["contact__full_name"]
        indexes = [models.Index(fields=["language", "timezone"])]

    def clean(self):
        super().clean()
        if self.default_store_id and self.default_store.primary_contact_id != self.contact_id:
            raise ValidationError(
                {"default_store": "The default store must belong to this contact."}
            )

    def __str__(self):
        return f"Preferences — {self.contact}"
