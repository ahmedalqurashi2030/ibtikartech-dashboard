from django.http import Http404
from django.shortcuts import redirect, render

from .manifest import REQUIRED_PAGES


def preview_page(request, page_name):
    if page_name not in REQUIRED_PAGES:
        raise Http404
    return render(request, f"public_preview/pages/{page_name}")


def redirect_to_source_page(request, page_name):
    if page_name not in REQUIRED_PAGES:
        raise Http404
    return redirect(f"/{page_name}")
