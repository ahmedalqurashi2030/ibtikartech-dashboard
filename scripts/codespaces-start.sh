#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.local}"
export DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-codespaces-development-only}"

PORT="${IBTIKAR_PREVIEW_PORT:-8000}"
HOST="0.0.0.0"
LOG_FILE="/tmp/ibtikartech-preview.log"
PID_FILE="/tmp/ibtikartech-preview.pid"

server_is_running() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi

  pgrep -f "manage.py runserver ${HOST}:${PORT}" >/dev/null 2>&1
}

wait_for_server() {
  local attempts=40
  local delay=0.5

  for ((i=1; i<=attempts; i++)); do
    if curl --silent --show-error --output /dev/null \
      "http://127.0.0.1:${PORT}/control/login/"; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

make_codespaces_port_public() {
  if [[ "${CODESPACES:-}" != "true" ]]; then
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1 || [[ -z "${CODESPACE_NAME:-}" ]]; then
    echo "Codespaces public visibility was not changed automatically (gh/CODESPACE_NAME unavailable)."
    return 0
  fi

  # The forwarded port can take a few seconds to appear in the Codespaces API.
  for _ in {1..12}; do
    if gh codespace ports --codespace "$CODESPACE_NAME" --json sourcePort \
      --jq ".[] | select(.sourcePort == ${PORT}) | .sourcePort" 2>/dev/null \
      | grep -qx "$PORT"; then
      if gh codespace ports visibility "${PORT}:public" --codespace "$CODESPACE_NAME" >/dev/null 2>&1; then
        echo "Codespaces port ${PORT} visibility: PUBLIC"
      else
        echo "Could not make port ${PORT} public automatically; use the PORTS panel if required."
      fi
      return 0
    fi
    sleep 1
  done

  echo "Port ${PORT} was not visible to the Codespaces API yet; forwarding still works privately."
}

# Keep the local SQLite schema current when a Codespace resumes after new commits.
python manage.py migrate --noinput
python manage.py check

if server_is_running; then
  echo "Ibtikar Tech preview server is already running on port ${PORT}."
else
  rm -f "$PID_FILE"
  : > "$LOG_FILE"
  nohup python manage.py runserver "${HOST}:${PORT}" --noreload >"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  echo "Starting Ibtikar Tech preview server (PID $(cat "$PID_FILE"))..."
fi

if ! wait_for_server; then
  echo "Preview server failed to become ready. Last log lines:"
  tail -n 80 "$LOG_FILE" || true
  exit 1
fi

# Printing a localhost URL lets Codespaces auto-detect/forward the port as a fallback.
echo "Ibtikar Tech preview is READY: http://localhost:${PORT}"
echo "Wagtail control: http://localhost:${PORT}/control/"
echo "Preview log: ${LOG_FILE}"

make_codespaces_port_public
