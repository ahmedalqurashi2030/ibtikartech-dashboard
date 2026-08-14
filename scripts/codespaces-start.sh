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
REVISION_FILE="/tmp/ibtikartech-preview.revision"

current_revision() {
  git rev-parse HEAD 2>/dev/null || printf 'unknown'
}

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

server_revision_matches() {
  [[ -f "$REVISION_FILE" ]] || return 1
  [[ "$(cat "$REVISION_FILE" 2>/dev/null || true)" == "$(current_revision)" ]]
}

server_is_healthy() {
  curl --fail --silent --show-error --max-time 3 \
    "http://127.0.0.1:${PORT}/healthz/" >/dev/null \
    && curl --fail --silent --show-error --max-time 3 \
      "http://127.0.0.1:${PORT}/" >/dev/null \
    && curl --fail --silent --show-error --max-time 3 \
      "http://127.0.0.1:${PORT}/control/login/" >/dev/null \
    && curl --fail --silent --show-error --max-time 3 \
      "http://127.0.0.1:${PORT}/django-admin/login/" >/dev/null
}

stop_preview_server() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      for _ in {1..20}; do
        if ! kill -0 "$pid" 2>/dev/null; then
          break
        fi
        sleep 0.2
      done
    fi
  fi

  while read -r pid; do
    [[ -z "$pid" ]] && continue
    kill "$pid" 2>/dev/null || true
  done < <(pgrep -f "manage.py runserver ${HOST}:${PORT}" || true)

  rm -f "$PID_FILE" "$REVISION_FILE"
}

start_preview_server() {
  rm -f "$PID_FILE" "$REVISION_FILE"
  : > "$LOG_FILE"
  nohup python manage.py runserver "${HOST}:${PORT}" --noreload >"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  current_revision > "$REVISION_FILE"
  echo "Starting Ibtikar Tech preview server (PID $(cat "$PID_FILE"))..."
}

wait_for_server() {
  local attempts=60
  local delay=0.5

  for ((i=1; i<=attempts; i++)); do
    if server_is_healthy; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

codespaces_preview_url() {
  if [[ "${CODESPACES:-}" != "true" ]]; then
    return 0
  fi

  local codespace_name="${CODESPACE_NAME:-}"
  local forwarding_domain="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  if [[ -n "$codespace_name" && -n "$forwarding_domain" ]]; then
    printf 'https://%s-%s.%s' "$codespace_name" "$PORT" "$forwarding_domain"
  fi
}

make_codespaces_port_public() {
  if [[ "${CODESPACES:-}" != "true" ]]; then
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1 || [[ -z "${CODESPACE_NAME:-}" ]]; then
    echo "Codespaces public visibility was not changed automatically (gh/CODESPACE_NAME unavailable)."
    return 0
  fi

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

if server_is_running && server_is_healthy && server_revision_matches; then
  echo "Ibtikar Tech preview server is already healthy on port ${PORT}."
else
  if server_is_running; then
    if ! server_revision_matches; then
      echo "Preview code revision changed. Restarting Django..."
    else
      echo "A stale/unhealthy preview process was detected. Restarting it..."
    fi
    stop_preview_server
  fi
  start_preview_server
fi

if ! wait_for_server; then
  echo "Preview server failed readiness checks. Last log lines:"
  tail -n 100 "$LOG_FILE" || true
  exit 1
fi

echo "Ibtikar Tech preview is READY: http://localhost:${PORT}/"
echo "Wagtail control: http://localhost:${PORT}/control/"
echo "Django admin: http://localhost:${PORT}/django-admin/"
echo "Health check: http://localhost:${PORT}/healthz/"

REMOTE_URL="$(codespaces_preview_url || true)"
if [[ -n "$REMOTE_URL" ]]; then
  echo "Codespaces preview: ${REMOTE_URL}/"
  echo "Codespaces control: ${REMOTE_URL}/control/"
fi

echo "Preview log: ${LOG_FILE}"

make_codespaces_port_public
