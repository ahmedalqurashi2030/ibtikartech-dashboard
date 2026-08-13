from .base import *  # noqa: F403

DEBUG = False
DATABASES["default"]["NAME"] = ":memory:"  # noqa: F405
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
