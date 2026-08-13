#!/usr/bin/env bash
set -euo pipefail

if pgrep -f "manage.py runserver 0.0.0.0:8000" >/dev/null 2>&1; then
  echo "Ibtikar Tech preview server is already running."
  exit 0
fi

nohup python manage.py runserver 0.0.0.0:8000 > /tmp/ibtikartech-preview.log 2>&1 &

echo "Ibtikar Tech preview server started on port 8000."
echo "Log: /tmp/ibtikartech-preview.log"
