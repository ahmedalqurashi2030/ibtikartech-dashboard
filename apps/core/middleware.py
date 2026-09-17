class OperationalNoIndexMiddleware:
    """Keep non-public operational routes out of search indexes.

    Authentication and authorization remain the security boundary. This
    middleware only adds an indexing directive to responses for operational
    surfaces that should never become search landing pages.
    """

    NOINDEX_PREFIXES = (
        "/accounts/",
        "/analytics/",
        "/control/",
        "/django-admin/",
        "/healthz/",
        "/portal/",
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith(self.NOINDEX_PREFIXES):
            response.headers.setdefault("X-Robots-Tag", "noindex, nofollow")
        return response
