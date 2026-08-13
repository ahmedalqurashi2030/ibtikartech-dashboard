import uuid
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.crm.models import Contact
from apps.projects.models import Project

from .choices import TicketPriority, TicketStatus


def generate_ticket_number():
    return f"TKT-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"


def ticket_attachment_upload_to(instance, filename):
    suffix = Path(filename).suffix.lower()
    return f"support/{instance.ticket_id}/{uuid.uuid4().hex}{suffix}"


class SupportTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(
        max_length=40,
        unique=True,
        default=generate_ticket_number,
        editable=False,
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="support_tickets",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )
    subject = models.CharField(max_length=220)
    description = models.TextField()
    priority = models.CharField(
        max_length=16,
        choices=TicketPriority.choices,
        default=TicketPriority.NORMAL,
    )
    status = models.CharField(
        max_length=24,
        choices=TicketStatus.choices,
        default=TicketStatus.OPEN,
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_support_tickets",
        limit_choices_to={"is_staff": True},
    )
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["contact", "status", "-updated_at"]),
            models.Index(fields=["assigned_to", "status", "-updated_at"]),
            models.Index(fields=["project", "status"]),
            models.Index(fields=["priority", "status", "-updated_at"]),
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.project_id and self.contact_id and self.project.contact_id != self.contact_id:
            errors["project"] = "The project and ticket must belong to the same contact."
        if self.status == TicketStatus.CLOSED and self.closed_at is None:
            errors["closed_at"] = "Closed tickets require a closed timestamp."
        if self.status != TicketStatus.CLOSED and self.closed_at is not None:
            errors["closed_at"] = "Only closed tickets can have a closed timestamp."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.ticket_number} — {self.subject}"


class TicketMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="support_messages",
        limit_choices_to={"is_staff": True},
    )
    sender_contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="support_messages",
    )
    body = models.TextField()
    attachment = models.FileField(
        upload_to=ticket_attachment_upload_to,
        null=True,
        blank=True,
    )
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["ticket", "is_internal", "created_at"]),
            models.Index(fields=["sender_contact", "created_at"]),
            models.Index(fields=["sender_user", "created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(sender_user__isnull=False, sender_contact__isnull=True)
                    | models.Q(sender_user__isnull=True, sender_contact__isnull=False)
                ),
                name="support_message_exactly_one_sender",
            )
        ]

    def clean(self):
        super().clean()
        errors = {}
        if bool(self.sender_user_id) == bool(self.sender_contact_id):
            errors["sender_user"] = "A message must have exactly one sender."
            errors["sender_contact"] = "A message must have exactly one sender."
        if self.sender_contact_id and self.ticket_id:
            if self.sender_contact_id != self.ticket.contact_id:
                errors["sender_contact"] = "Customer messages must come from the ticket contact."
            if self.is_internal:
                errors["is_internal"] = "Customer messages cannot be internal."
        if self.is_internal and not self.sender_user_id:
            errors["is_internal"] = "Internal messages must be authored by a staff user."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        sender = self.sender_user or self.sender_contact
        return f"{self.ticket.ticket_number} — {sender}"
