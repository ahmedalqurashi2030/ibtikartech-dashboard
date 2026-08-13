import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Contact(models.Model):
    class LifecycleStage(models.TextChoices):
        LEAD = "LEAD", "Lead"
        QUALIFIED = "QUALIFIED", "Qualified"
        CUSTOMER = "CUSTOMER", "Customer"
        REPEAT_CUSTOMER = "REPEAT_CUSTOMER", "Repeat customer"
        INACTIVE = "INACTIVE", "Inactive"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="crm_contact",
    )
    full_name = models.CharField(max_length=180)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    lifecycle_stage = models.CharField(
        max_length=32,
        choices=LifecycleStage.choices,
        default=LifecycleStage.LEAD,
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    preferred_language = models.CharField(max_length=8, default="ar")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_contacts",
        limit_choices_to={"is_staff": True},
    )
    first_source = models.CharField(max_length=120, blank=True)
    first_contact_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["lifecycle_stage", "status"]),
            models.Index(fields=["owner", "status"]),
            models.Index(fields=["-last_activity_at"]),
        ]

    def clean(self):
        super().clean()
        if self.owner_id and not self.owner.is_staff:
            raise ValidationError({"owner": "CRM contacts can only be owned by staff users."})

    def __str__(self):
        return self.full_name


class Organization(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=180)
    legal_name = models.CharField(max_length=220, blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["name", "status"])]

    def __str__(self):
        return self.name


class OrganizationContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="contact_links",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="organization_links",
    )
    role_title = models.CharField(max_length=120, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "contact"],
                name="crm_unique_organization_contact",
            ),
            models.UniqueConstraint(
                fields=["organization"],
                condition=models.Q(is_primary=True),
                name="crm_unique_primary_contact_per_organization",
            ),
        ]

    def __str__(self):
        return f"{self.organization} / {self.contact}"


class Store(models.Model):
    class Platform(models.TextChoices):
        SALLA = "SALLA", "Salla"
        ZID = "ZID", "Zid"
        SHOPIFY = "SHOPIFY", "Shopify"
        WOOCOMMERCE = "WOOCOMMERCE", "WooCommerce"
        WORDPRESS = "WORDPRESS", "WordPress"
        CUSTOM = "CUSTOM", "Custom"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    primary_contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="stores",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stores",
    )
    name = models.CharField(max_length=180)
    url = models.URLField(blank=True)
    platform = models.CharField(max_length=32, choices=Platform.choices)
    external_store_id = models.CharField(max_length=160, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["platform", "status"]),
            models.Index(fields=["primary_contact", "status"]),
        ]

    def __str__(self):
        return self.name


class ConsentRecord(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "EMAIL", "Email"
        WHATSAPP = "WHATSAPP", "WhatsApp"
        SMS = "SMS", "SMS"

    class Status(models.TextChoices):
        GRANTED = "GRANTED", "Granted"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="consent_records",
    )
    channel = models.CharField(max_length=16, choices=Channel.choices)
    purpose = models.CharField(max_length=120)
    status = models.CharField(max_length=16, choices=Status.choices)
    source = models.CharField(max_length=120)
    policy_version = models.CharField(max_length=40)
    granted_at = models.DateTimeField(null=True, blank=True)
    withdrawn_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["contact", "channel", "purpose", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.status == self.Status.GRANTED:
            if self.granted_at is None:
                errors["granted_at"] = "Granted consent records require a granted timestamp."
            if self.withdrawn_at is not None:
                errors["withdrawn_at"] = "A granted record cannot contain a withdrawal timestamp."
        if self.status == self.Status.WITHDRAWN and self.withdrawn_at is None:
            errors["withdrawn_at"] = "Withdrawn consent records require a withdrawal timestamp."
        if (
            self.granted_at is not None
            and self.withdrawn_at is not None
            and self.withdrawn_at < self.granted_at
        ):
            errors["withdrawn_at"] = "Withdrawal cannot occur before consent was granted."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.contact} — {self.channel} / {self.purpose} — {self.status}"


class ActivityEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="activity_events",
    )
    actor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="crm_activity_events",
    )
    event_type = models.CharField(max_length=80)
    reference_type = models.CharField(max_length=120, blank=True)
    reference_id = models.CharField(max_length=64, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["contact", "-created_at"]),
            models.Index(fields=["event_type", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.contact} — {self.title}"
