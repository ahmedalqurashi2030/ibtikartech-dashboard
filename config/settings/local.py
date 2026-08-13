import os

from .base import *  # noqa: F403

DEBUG = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
ACCOUNT_EMAIL_VERIFICATION = "optional"

# GitHub Codespaces exposes Django through a forwarded HTTPS domain.
# Trust only the current codespace preview host instead of using a wildcard.
if os.getenv("CODESPACES") == "true":
    codespace_name = os.getenv("CODESPACE_NAME", "").strip()
    forwarding_domain = os.getenv(
        "GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN",
        "app.github.dev",
    ).strip()
    if codespace_name and forwarding_domain:
        preview_host = f"{codespace_name}-8000.{forwarding_domain}"
        if preview_host not in ALLOWED_HOSTS:  # noqa: F405
            ALLOWED_HOSTS.append(preview_host)  # noqa: F405
        preview_origin = f"https://{preview_host}"
        if preview_origin not in CSRF_TRUSTED_ORIGINS:  # noqa: F405
            CSRF_TRUSTED_ORIGINS.append(preview_origin)  # noqa: F405
