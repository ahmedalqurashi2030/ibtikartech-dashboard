from django.apps import AppConfig


class PublicPreviewConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.public_preview"
    verbose_name = "Public frontend preview"
