import os
from urllib.parse import parse_qsl, unquote, urlparse

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

production_secret = os.getenv("DJANGO_SECRET_KEY", "").strip()
if len(production_secret) < 32 or production_secret == "unsafe-local-development-key":
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be explicitly configured with at least 32 characters in production."
    )
SECRET_KEY = production_secret

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if not DATABASE_URL:
    raise ImproperlyConfigured(
        "DATABASE_URL is required in production and must point to PostgreSQL."
    )

parsed = urlparse(DATABASE_URL)
if parsed.scheme not in {"postgres", "postgresql"}:
    raise ImproperlyConfigured(
        "Production DATABASE_URL must use the postgres/postgresql scheme."
    )

postgres_options = dict(parse_qsl(parsed.query))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/"),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": parsed.port or 5432,
        "CONN_MAX_AGE": 60,
        "OPTIONS": postgres_options,
    }
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"

EMAIL_HOST = os.getenv("EMAIL_HOST", "").strip()
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "apps.core.storage.PublicStaticFilesStorage",
    },
}

s3_bucket_name = os.getenv("AWS_STORAGE_BUCKET_NAME", "").strip()
if s3_bucket_name:
    s3_options = {
        "bucket_name": s3_bucket_name,
        "default_acl": None,
        "file_overwrite": False,
        "location": os.getenv("AWS_MEDIA_LOCATION", "media").strip("/"),
        "querystring_auth": True,
    }
    optional_s3_settings = {
        "endpoint_url": os.getenv("AWS_S3_ENDPOINT_URL", "").strip(),
        "region_name": os.getenv("AWS_S3_REGION_NAME", "").strip(),
        "addressing_style": os.getenv("AWS_S3_ADDRESSING_STYLE", "").strip(),
    }
    s3_options.update(
        {key: value for key, value in optional_s3_settings.items() if value}
    )
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": s3_options,
    }
