import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.crm.models import Contact, Organization, Store
from apps.services.models import Service
from .choices import (
    FollowUpStatus,
    FollowUpType,
    InquiryStatus,
    InquiryType,
    OpportunityStage,
    QuoteStatus,
)


ZERO = Decimal("0.00")


def generate_quote_number():
    """Generate a collision-resistant human-readable quote number."""
    return f"Q-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"


class Inquiry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="inquiries",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inquiries",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inquiries",
    )
    inquiry_type = models.CharField(
        max_length=24,
        choices=InquiryType.choices,
        default=InquiryType.SERVICE,
    )
    message = models.TextField(blank=True)
    requirements_data = models.JSONField(default=dict, blank=True)
    source = models.CharField(max_length=120, blank=True)
    status = models.CharField(
        max_length=20,
        choices=InquiryStatus.choices,
        default=InquiryStatus.NEW,
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_inquiries",
        limit_choices_to={"is_staff": True},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["contact", "status", "-created_at"]),
            models.Index(fields=["service", "status", "-created_at"]),
            models.Index(fields=["assigned_to", "status", "-created_at"]),
            models.Index(fields=["source", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.get_inquiry_type_display()} — {self.contact}"


class Opportunity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="opportunities",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    inquiry = models.ForeignKey(
        Inquiry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunities",
    )
    title = models.CharField(max_length=220)
    stage = models.CharField(
        max_length=24,
        choices=OpportunityStage.choices,
        default=OpportunityStage.NEW,
    )
    estimated_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    currency = models.CharField(max_length=3, default="SAR")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_opportunities",
        limit_choices_to={"is_staff": True},
    )
    expected_close_date = models.DateField(null=True, blank=True)
    lost_reason = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["stage", "assigned_to", "-updated_at"]),
            models.Index(fields=["contact", "stage", "-updated_at"]),
            models.Index(fields=["service", "stage"]),
            models.Index(fields=["expected_close_date", "stage"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(estimated_value__gte=0)
                | models.Q(estimated_value__isnull=True),
                name="sales_opportunity_value_nonnegative",
            )
        ]

    def clean(self):
        super().clean()
        if self.estimated_value is not None and self.estimated_value < 0:
            raise ValidationError(
                {"estimated_value": "Estimated value cannot be negative."}
            )
        if self.stage == OpportunityStage.LOST and not self.lost_reason.strip():
            raise ValidationError(
                {"lost_reason": "A lost reason is required for lost opportunities."}
            )

    def __str__(self):
        return self.title


class FollowUpTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.CASCADE,
        related_name="follow_up_tasks",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="follow_up_tasks",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_follow_up_tasks",
        limit_choices_to={"is_staff": True},
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    task_type = models.CharField(
        max_length=20,
        choices=FollowUpType.choices,
        default=FollowUpType.GENERAL,
    )
    status = models.CharField(
        max_length=20,
        choices=FollowUpStatus.choices,
        default=FollowUpStatus.OPEN,
    )
    due_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["status", "due_at", "-created_at"]
        indexes = [
            models.Index(fields=["assigned_to", "status", "due_at"]),
            models.Index(fields=["opportunity", "status", "due_at"]),
            models.Index(fields=["contact", "status"]),
        ]

    def clean(self):
        super().clean()
        if self.status == FollowUpStatus.COMPLETED and self.completed_at is None:
            raise ValidationError(
                {"completed_at": "Completed tasks require a completion timestamp."}
            )

    def __str__(self):
        return self.title


class Quote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_number = models.CharField(
        max_length=32,
        unique=True,
        default=generate_quote_number,
        editable=False,
    )
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.PROTECT,
        related_name="quotes",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="quotes",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotes",
    )
    status = models.CharField(
        max_length=20,
        choices=QuoteStatus.choices,
        default=QuoteStatus.DRAFT,
    )
    currency = models.CharField(max_length=3, default="SAR")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_quotes",
        limit_choices_to={"is_staff": True},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["opportunity", "status"]),
            models.Index(fields=["contact", "status", "-created_at"]),
            models.Index(fields=["valid_until", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(subtotal__gte=0),
                name="sales_quote_subtotal_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(discount__gte=0),
                name="sales_quote_discount_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(tax__gte=0),
                name="sales_quote_tax_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(grand_total__gte=0),
                name="sales_quote_total_nonnegative",
            ),
        ]

    def clean(self):
        super().clean()
        monetary_fields = ("subtotal", "discount", "tax", "grand_total")
        errors = {}
        for field_name in monetary_fields:
            value = getattr(self, field_name)
            if value is not None and value < 0:
                errors[field_name] = "Amount cannot be negative."
        if (
            self.discount is not None
            and self.subtotal is not None
            and self.discount > self.subtotal
        ):
            errors["discount"] = "Discount cannot exceed subtotal."
        if errors:
            raise ValidationError(errors)

    def recalculate_totals(self, *, save=True):
        subtotal = ZERO
        discount = ZERO
        tax = ZERO
        for item in self.items.all():
            subtotal += item.quantity * item.unit_price
            discount += item.discount
            tax += item.tax

        grand_total = subtotal - discount + tax
        self.subtotal = subtotal
        self.discount = discount
        self.tax = tax
        self.grand_total = grand_total

        if save:
            self.save(
                update_fields=[
                    "subtotal",
                    "discount",
                    "tax",
                    "grand_total",
                    "updated_at",
                ]
            )
        return grand_total

    def __str__(self):
        return self.quote_number


class QuoteItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name="items",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_items",
    )
    service_name_snapshot = models.CharField(max_length=220)
    description_snapshot = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("1.00"))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=ZERO)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["quote", "sort_order"]),
            models.Index(fields=["service"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name="sales_quote_item_quantity_positive",
            ),
            models.CheckConstraint(
                condition=models.Q(unit_price__gte=0),
                name="sales_quote_item_price_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(discount__gte=0),
                name="sales_quote_item_discount_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(tax__gte=0),
                name="sales_quote_item_tax_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(total__gte=0),
                name="sales_quote_item_total_nonnegative",
            ),
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.quantity is not None and self.quantity <= 0:
            errors["quantity"] = "Quantity must be greater than zero."
        if self.unit_price is not None and self.unit_price < 0:
            errors["unit_price"] = "Unit price cannot be negative."
        if self.discount is not None and self.discount < 0:
            errors["discount"] = "Discount cannot be negative."
        if self.tax is not None and self.tax < 0:
            errors["tax"] = "Tax cannot be negative."

        if self.quantity is not None and self.unit_price is not None:
            gross = self.quantity * self.unit_price
            if self.discount is not None and self.discount > gross:
                errors["discount"] = "Discount cannot exceed the line subtotal."

        if errors:
            raise ValidationError(errors)

    def calculate_total(self):
        return (self.quantity * self.unit_price) - self.discount + self.tax

    def save(self, *args, **kwargs):
        if self.service_id:
            if not self.service_name_snapshot:
                self.service_name_snapshot = self.service.name
            if not self.description_snapshot:
                self.description_snapshot = self.service.short_description
        self.total = self.calculate_total()
        super().save(*args, **kwargs)
        self.quote.recalculate_totals()

    def delete(self, *args, **kwargs):
        quote = self.quote
        result = super().delete(*args, **kwargs)
        quote.recalculate_totals()
        return result

    def __str__(self):
        return f"{self.quote.quote_number} — {self.service_name_snapshot}"
