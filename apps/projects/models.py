import uuid
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.crm.models import Contact, Organization, Store
from apps.sales.models import Quote

from .choices import (
    ApprovalStatus,
    ProjectFileCategory,
    ProjectStageStatus,
    ProjectStatus,
    ProjectVisibility,
)


def generate_project_number():
    return f"PRJ-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"


def project_file_upload_to(instance, filename):
    suffix = Path(filename).suffix.lower()
    return f"projects/{instance.project_id}/{uuid.uuid4().hex}{suffix}"


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_number = models.CharField(
        max_length=40,
        unique=True,
        default=generate_project_number,
        editable=False,
    )
    quote = models.ForeignKey(
        Quote,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="projects",
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    name = models.CharField(max_length=220)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=24,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNING,
    )
    progress_percentage = models.PositiveSmallIntegerField(default=0)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_projects",
        limit_choices_to={"is_staff": True},
    )
    started_at = models.DateTimeField(null=True, blank=True)
    target_completion_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["contact", "status", "-updated_at"]),
            models.Index(fields=["manager", "status", "-updated_at"]),
            models.Index(fields=["store", "status"]),
            models.Index(fields=["target_completion_date", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(progress_percentage__gte=0)
                & models.Q(progress_percentage__lte=100),
                name="projects_progress_between_0_100",
            )
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.progress_percentage > 100:
            errors["progress_percentage"] = "Progress cannot exceed 100%."
        if self.quote_id and self.contact_id and self.quote.contact_id != self.contact_id:
            errors["quote"] = "The quote and project must belong to the same contact."
        if (
            self.started_at
            and self.target_completion_date
            and self.target_completion_date < self.started_at.date()
        ):
            errors["target_completion_date"] = "Target completion cannot be before start."
        if self.status == ProjectStatus.COMPLETED:
            if self.progress_percentage != 100:
                errors["progress_percentage"] = "Completed projects must be at 100%."
            if self.completed_at is None:
                errors["completed_at"] = "Completed projects require a completion timestamp."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.project_number} — {self.name}"


class ProjectStage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="stages",
    )
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProjectStageStatus.choices,
        default=ProjectStageStatus.PENDING,
    )
    sort_order = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["project", "sort_order"],
                name="projects_unique_stage_order",
            )
        ]
        indexes = [models.Index(fields=["project", "status", "sort_order"])]

    def clean(self):
        super().clean()
        if self.status == ProjectStageStatus.COMPLETED and self.completed_at is None:
            raise ValidationError(
                {"completed_at": "Completed stages require a completion timestamp."}
            )

    def __str__(self):
        return f"{self.project.project_number} — {self.name}"


class ProjectUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="updates",
    )
    stage = models.ForeignKey(
        ProjectStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updates",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_updates",
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    visibility = models.CharField(
        max_length=16,
        choices=ProjectVisibility.choices,
        default=ProjectVisibility.INTERNAL,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "visibility", "-created_at"]),
            models.Index(fields=["stage", "-created_at"]),
        ]

    def clean(self):
        super().clean()
        if self.stage_id and self.project_id and self.stage.project_id != self.project_id:
            raise ValidationError({"stage": "The stage must belong to this project."})

    def __str__(self):
        return self.title


class ProjectFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="files",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_project_files",
    )
    file = models.FileField(upload_to=project_file_upload_to)
    name = models.CharField(max_length=220)
    file_type = models.CharField(max_length=100, blank=True)
    visibility = models.CharField(
        max_length=16,
        choices=ProjectVisibility.choices,
        default=ProjectVisibility.INTERNAL,
    )
    category = models.CharField(
        max_length=24,
        choices=ProjectFileCategory.choices,
        default=ProjectFileCategory.OTHER,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "visibility", "category", "-created_at"]),
        ]

    def __str__(self):
        return self.name


class Approval(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="approvals",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="requested_project_approvals",
        limit_choices_to={"is_staff": True},
    )
    requested_from_contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="project_approvals",
    )
    status = models.CharField(
        max_length=24,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    response_note = models.TextField(blank=True)

    class Meta:
        ordering = ["-requested_at"]
        indexes = [
            models.Index(fields=["project", "status", "-requested_at"]),
            models.Index(fields=["requested_from_contact", "status", "-requested_at"]),
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.status != ApprovalStatus.PENDING and self.responded_at is None:
            errors["responded_at"] = "A response timestamp is required after a decision."
        if self.status == ApprovalStatus.PENDING and self.responded_at is not None:
            errors["responded_at"] = "Pending approvals cannot have a response timestamp."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.project.project_number} — {self.title}"
