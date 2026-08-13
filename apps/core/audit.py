from contextvars import ContextVar

_current_actor_id = ContextVar("ibtikar_audit_actor_id", default=None)
_current_ip_address = ContextVar("ibtikar_audit_ip_address", default=None)


def get_audit_context():
    return _current_actor_id.get(), _current_ip_address.get()


class AuditContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        actor_id = None
        if user is not None and user.is_authenticated:
            actor_id = user.pk
        ip_address = request.META.get("REMOTE_ADDR") or None

        actor_token = _current_actor_id.set(actor_id)
        ip_token = _current_ip_address.set(ip_address)
        try:
            return self.get_response(request)
        finally:
            _current_actor_id.reset(actor_token)
            _current_ip_address.reset(ip_token)
