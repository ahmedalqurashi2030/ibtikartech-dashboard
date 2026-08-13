import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["is_active", "is_staff"]),
        ]

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().casefold()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class StaffProfile(models.Model):
    class Department(models.TextChoices):
        MANAGEMENT = "MANAGEMENT", "Management"
        SALES = "SALES", "Sales"
        PROJECTS = "PROJECTS", "Projects"
        SUPPORT = "SUPPORT", "Support"
        MARKETING = "MARKETING", "Marketing"
        CONTENT = "CONTENT", "Content"
        TECHNICAL = "TECHNICAL", "Technical"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )
    job_title = models.CharField(max_length=150, blank=True)
    department = models.CharField(
        max_length=32,
        choices=Department.choices,
        default=Department.OTHER,
    )
    phone = models.CharField(max_length=32, blank=True)
    avatar = models.ImageField(upload_to="staff/avatars/", blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__email"]

    def __str__(self):
        return self.user.email
