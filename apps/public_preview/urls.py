from django.urls import path

from .manifest import REQUIRED_PAGES
from .views import preview_page

app_name = "public_preview"

urlpatterns = [
    path("", preview_page, {"page_name": "index.html"}, name="home"),
]

for page_name in REQUIRED_PAGES:
    route_name = f"source-{page_name.removesuffix('.html')}"
    urlpatterns.append(
        path(page_name, preview_page, {"page_name": page_name}, name=route_name)
    )
