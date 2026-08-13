from django.urls import path

from .manifest import CLEAN_ALIASES, REQUIRED_PAGES
from .views import preview_page

app_name = "public_preview"

urlpatterns = []

for clean_path, page_name in CLEAN_ALIASES.items():
    route_name = "home" if not clean_path else f"clean-{page_name.removesuffix('.html')}"
    urlpatterns.append(
        path(clean_path, preview_page, {"page_name": page_name}, name=route_name)
    )

for page_name in REQUIRED_PAGES:
    route_name = f"source-{page_name.removesuffix('.html')}"
    urlpatterns.append(
        path(page_name, preview_page, {"page_name": page_name}, name=route_name)
    )
