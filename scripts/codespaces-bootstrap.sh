#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip
pip install -e ".[dev]"

python manage.py migrate --noinput
python manage.py check

if [[ -n "${IBTIKAR_ADMIN_EMAIL:-}" ]]; then
  bootstrap_args=(--email "$IBTIKAR_ADMIN_EMAIL")
  if [[ -n "${IBTIKAR_ADMIN_PASSWORD:-}" ]]; then
    bootstrap_args+=(--password "$IBTIKAR_ADMIN_PASSWORD")
  fi
  if [[ -n "${IBTIKAR_SITE_HOSTNAME:-}" ]]; then
    bootstrap_args+=(--hostname "$IBTIKAR_SITE_HOSTNAME")
  fi
  python manage.py bootstrap_ibtikar "${bootstrap_args[@]}"
fi

echo "Ibtikar Tech Codespaces bootstrap completed."
