import json
import re
import uuid

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from apps.services.models import Service

from .models import AnalyticsEvent

EVENT_NAME_RE = re.compile(r"^[a-z0-9_]{2,80}$")
MAX_EVENT_BODY_BYTES = 32 * 1024


def _text(value, limit):
    if value is None:
        return ""
    return str(value).strip()[:limit]


@require_POST
@csrf_exempt
def collect_event(request):
    if request.headers.get("Sec-Fetch-Site", "") == "cross-site":
        return JsonResponse({"ok": False, "error": "cross_site"}, status=403)
    if request.content_type != "application/json":
        return JsonResponse({"ok": False, "error": "json_required"}, status=415)
    if len(request.body) > MAX_EVENT_BODY_BYTES:
        return JsonResponse({"ok": False, "error": "payload_too_large"}, status=413)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({"ok": False, "error": "invalid_json"}, status=400)

    if not isinstance(payload, dict):
        return JsonResponse({"ok": False, "error": "invalid_payload"}, status=400)

    event_name = _text(payload.get("event_name"), 80).lower()
    if not EVENT_NAME_RE.fullmatch(event_name):
        return JsonResponse({"ok": False, "error": "invalid_event_name"}, status=400)

    session_id = request.session.get("ibtikar_analytics_session_id")
    if not session_id:
        session_id = uuid.uuid4().hex
        request.session["ibtikar_analytics_session_id"] = session_id

    user = request.user if request.user.is_authenticated else None
    contact = getattr(user, "crm_contact", None) if user else None

    service = None
    service_id = payload.get("service_id")
    if service_id:
        service = Service.objects.filter(pk=service_id).first()
        if service is None:
            return JsonResponse({"ok": False, "error": "unknown_service"}, status=400)

    metadata = payload.get("metadata", {})
    if not isinstance(metadata, dict):
        metadata = {}

    AnalyticsEvent.objects.create(
        anonymous_session_id=session_id,
        user=user,
        contact=contact,
        event_name=event_name,
        service=service,
        page_path=_text(payload.get("page_path"), 500),
        utm_source=_text(payload.get("utm_source"), 120),
        utm_medium=_text(payload.get("utm_medium"), 120),
        utm_campaign=_text(payload.get("utm_campaign"), 160),
        referrer=_text(payload.get("referrer"), 500),
        metadata=metadata,
    )
    return JsonResponse({"ok": True}, status=201)
