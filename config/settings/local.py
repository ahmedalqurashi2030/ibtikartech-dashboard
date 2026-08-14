import os

from .base import *  # noqa: F403

DEBUG = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
ACCOUNT_EMAIL_VERIFICATION = "optional"

# Local development and GitHub Codespaces can proxy HTTPS requests to Django as
# https://localhost:8000. Trust only these explicit development origins here;
# production settings remain unchanged.
for origin in (
    "http://localhost:8000",
    "https://localhost:8000",
    "http://127.0.0.1:8000",
    "https://127.0.0.1:8000",
):
    if origin not in CSRF_TRUSTED_ORIGINS:  # noqa: F405
        CSRF_TRUSTED_ORIGINS.append(origin)  # noqa: F405

# GitHub Codespaces may expose Django through a forwarded HTTPS domain. When
# Codespaces metadata is available, trust only that exact preview host.
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
