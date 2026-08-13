from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render

from .models import AuditLog


def staff_control_required(view_func):
    return login_required(login_url="/control/login/")(
        user_passes_test(
            lambda user: user.is_active and user.is_staff,
            login_url="/control/login/",
        )(view_func)
    )


@staff_control_required
def audit_index(request):
    query = request.GET.get("q", "").strip()
    logs = AuditLog.objects.select_related("actor_user")
    if query:
        logs = logs.filter(
            Q(action__icontains=query)
            | Q(object_type__icontains=query)
            | Q(object_id__icontains=query)
            | Q(actor_user__email__icontains=query)
        )
    page_obj = Paginator(logs, 100).get_page(request.GET.get("page"))
    return render(
        request,
        "control/core/audit_index.html",
        {"page_obj": page_obj, "query": query},
    )
