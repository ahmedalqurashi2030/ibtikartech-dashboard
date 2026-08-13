from django.urls import path

from .manifest import CLEAN_ALIASES, REQUIRED_PAGES
from .views import preview_page, redirect_to_source_page

app_name = "public_preview"

urlpatterns = [
    path("", preview_page, {"page_name": "index.html"}, name="home"),
]

for clean_path, page_name in CLEAN_ALIASES.items():
    if not clean_path:
        continue
    route_name = f"clean-{page_name.removesuffix('.html')}"
    urlpatterns.append(
        path(
            clean_path,
            redirect_to_source_page,
            {"page_name": page_name},
            name=route_name,
        )
    )

for page_name in REQUIRED_PAGES:
    route_name = f"source-{page_name.removesuffix('.html')}"
    urlpatterns.append(
        path(page_name, preview_page, {"page_name": page_name}, name=route_name)
    )
