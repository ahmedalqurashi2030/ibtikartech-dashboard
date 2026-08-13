#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip
pip install -e ".[dev]"

python manage.py makemigrations \
  accounts core crm services sales customer_portal projects content --noinput
python manage.py migrate --noinput
python manage.py check

echo "Ibtikar Tech Codespaces bootstrap completed."
