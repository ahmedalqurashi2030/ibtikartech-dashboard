# Ibtikar Tech V1 — Runbook

This runbook is the canonical operating guide for the Ibtikar Tech platform.

## 1. First run in GitHub Codespaces

Open the repository Codespace and run:

```bash
git switch main
git pull
python -m pip install -e ".[dev]"
python manage.py migrate
```

Create or promote the owner account. Prefer environment variables so the password is not
written to shell history:

```bash
export IBTIKAR_ADMIN_EMAIL="owner@example.com"
export IBTIKAR_ADMIN_PASSWORD="use-a-strong-password-here"
python manage.py bootstrap_ibtikar
```

If `IBTIKAR_ADMIN_PASSWORD` is omitted for a brand-new account, the command generates a
one-time random password and prints it once in the terminal. Store it securely.

Start the preview:

```bash
bash scripts/codespaces-start.sh
```

The server exposes:

- `/control/` — Ibtikar OS staff control panel
- `/portal/` — customer portal
- `/services/` — public service catalog
- `/tharaa/` — Tharaa marketing page after bootstrap
- `/healthz/` — application/database health check

In Codespaces, port 8000 is forwarded by the project configuration. If automatic public
visibility is unavailable, use the Codespaces **PORTS** panel to open the forwarded URL.

## 2. Automatic Codespaces bootstrap

Set these as Codespaces secrets/environment variables before rebuilding the container:

```text
IBTIKAR_ADMIN_EMAIL
IBTIKAR_ADMIN_PASSWORD
IBTIKAR_SITE_HOSTNAME   # optional
```

`scripts/codespaces-bootstrap.sh` and `scripts/codespaces-start.sh` apply committed
migrations and bootstrap the owner account automatically when `IBTIKAR_ADMIN_EMAIL` is
present.

## 3. Staff roles

`bootstrap_ibtikar` provisions these baseline groups:

- `Ibtikar Management`
- `Ibtikar Sales`
- `Ibtikar Delivery`
- `Ibtikar Support`
- `Ibtikar Marketing`
- `Ibtikar Content`

Assign a role to an existing account with:

```bash
python manage.py assign_ibtikar_role \
  --email staff@example.com \
  --role "Ibtikar Sales"
```

The command marks the account as staff and attaches the selected group. The owner remains
a superuser. Do not give superuser access to ordinary staff accounts.

## 4. Control panel scope

The V1 control panel includes:

- CRM and Customer 360
- organizations and stores
- append-only consent ledger and CRM activity timeline
- service categories and services
- inquiries, opportunities, follow-up tasks, quotes and quote items
- projects, stages, updates, files and approvals
- support tickets and messages
- marketing campaigns and attribution touches
- operational analytics and KPI dashboard
- automatic audit log
- Wagtail content/pages for the public site

The system intentionally does **not** include direct orders/payments yet. Accepted quote
value is a commercial pipeline metric, not recognized revenue.

## 5. Public customer flow

A visitor can browse and request a service without creating an account:

```text
/services/
  -> service detail
  -> service request
  -> CRM Contact
  -> Inquiry
  -> Opportunity
  -> Quote
  -> Project
  -> Support
```

An authenticated customer is linked to the existing CRM Contact when it can be done
unambiguously. Ambiguous duplicate contacts are stopped for manual review instead of
creating another duplicate.

## 6. Production configuration

Use:

```text
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<long random secret>
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
DJANGO_ALLOWED_HOSTS=example.com,www.example.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://example.com,https://www.example.com
WAGTAILADMIN_BASE_URL=https://example.com/control/
```

For real account verification and password recovery, configure SMTP:

```text
EMAIL_HOST
EMAIL_PORT
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL
```

For S3-compatible persistent media storage, configure a bucket and credentials. Standard
AWS S3 can omit the custom endpoint; S3-compatible providers can set it:

```text
AWS_STORAGE_BUCKET_NAME
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_ENDPOINT_URL
AWS_S3_REGION_NAME
AWS_S3_ADDRESSING_STYLE
AWS_MEDIA_LOCATION=media
```

If no bucket is configured, production falls back to local file storage, which must be on
a persistent volume.

Deployment sequence:

```bash
python -m pip install .
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py bootstrap_ibtikar
bash scripts/start-production.sh
```

`start-production.sh` starts the WSGI application with Gunicorn. Configure worker count and
timeout with `GUNICORN_WORKERS` and `GUNICORN_TIMEOUT`. Django `runserver` remains for local
and Codespaces development only.

## 7. Verification checklist

Before every release:

```bash
python manage.py migrate --noinput
python manage.py check
ruff check apps config tests
pytest
python manage.py makemigrations --check --dry-run
```

Then verify manually:

1. `/healthz/` returns `{"status": "ok"}`.
2. Owner can sign in to `/control/`.
3. Customer cannot access `/control/`.
4. Customer sees only their own portal data.
5. Internal project/support messages do not leak to the customer portal.
6. Guest service request creates an Inquiry without requiring signup.
7. Consent and CRM activity ledgers remain append-only from the custom control views.
8. Audit entries are created for sensitive business-domain changes.
