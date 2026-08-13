from django.db import models


class ProjectStatus(models.TextChoices):
    PLANNING = "PLANNING", "Planning"
    WAITING_CLIENT = "WAITING_CLIENT", "Waiting for client"
    IN_PROGRESS = "IN_PROGRESS", "In progress"
    REVIEW = "REVIEW", "Review"
    REVISION = "REVISION", "Revision"
    COMPLETED = "COMPLETED", "Completed"
    ON_HOLD = "ON_HOLD", "On hold"
    CANCELLED = "CANCELLED", "Cancelled"


class ProjectStageStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACTIVE = "ACTIVE", "Active"
    COMPLETED = "COMPLETED", "Completed"
    SKIPPED = "SKIPPED", "Skipped"


class ProjectVisibility(models.TextChoices):
    INTERNAL = "INTERNAL", "Internal"
    CUSTOMER = "CUSTOMER", "Customer"


class ProjectFileCategory(models.TextChoices):
    REQUIREMENT = "REQUIREMENT", "Requirement"
    DESIGN = "DESIGN", "Design"
    DELIVERABLE = "DELIVERABLE", "Deliverable"
    CONTRACT = "CONTRACT", "Contract"
    REFERENCE = "REFERENCE", "Reference"
    OTHER = "OTHER", "Other"


class ApprovalStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    CHANGES_REQUESTED = "CHANGES_REQUESTED", "Changes requested"
    REJECTED = "REJECTED", "Rejected"
