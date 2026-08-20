from django.http import Http404
from django.shortcuts import render

from .manifest import REQUIRED_PAGES


def preview_page(request, page_name):
    if page_name not in REQUIRED_PAGES:
        raise Http404
    return render(
        request,
        f"public_preview/pages/{page_name}",
        {
            "page_key": page_name.removesuffix(".html"),
            "source_page_name": page_name,
        },
    )
