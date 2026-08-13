from functools import wraps

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .services import ContactResolutionError, get_or_link_contact_for_user


def portal_contact_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapped(request, *args, **kwargs):
        try:
            request.portal_contact = get_or_link_contact_for_user(request.user)
        except ContactResolutionError:
            return render(
                request,
                "portal/account_review_required.html",
                status=409,
            )
        return view_func(request, *args, **kwargs)

    return wrapped
