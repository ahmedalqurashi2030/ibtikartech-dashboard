from pathlib import Path

from django.conf import settings

from apps.public_preview.content_contract import (
    ACTIVE_SHARED_SETTING_MODELS,
    EDITORIAL_PAGE_CANDIDATES,
    PUBLIC_CONTENT_OWNER,
    PUBLIC_TEMPLATE_OWNED_PAGES,
    SHARED_SETTINGS_OWNER,
    WAGTAIL_ACTIVATION_GATES,
    WAGTAIL_PAGE_BINDING,
)
from apps.public_preview.manifest import REQUIRED_PAGES
from apps.public_preview.template_contract import FAMILY_REQUIRED_BLOCKS


ROOT = Path(settings.BASE_DIR)
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"


def test_public_content_has_one_declared_owner_without_wagtail_page_binding():
    assert PUBLIC_CONTENT_OWNER == "django-templates"
    assert SHARED_SETTINGS_OWNER == "wagtail-site-settings"
    assert WAGTAIL_PAGE_BINDING is False
    assert PUBLIC_TEMPLATE_OWNED_PAGES == tuple(REQUIRED_PAGES)
    assert ACTIVE_SHARED_SETTING_MODELS == ("SiteSettings", "TrackingSettings")
    assert len(WAGTAIL_ACTIVATION_GATES) == 6


def test_explicit_public_views_do_not_query_or_import_wagtail_page_content():
    view_paths = (
        ROOT / "apps" / "public_preview" / "views.py",
        ROOT / "apps" / "services" / "public_views.py",
    )
    forbidden = (
        "from apps.content.models import",
        "import apps.content.models",
        "from wagtail.models import Page",
        "Page.objects",
        ".specific",
    )
    for path in view_paths:
        source = path.read_text(encoding="utf-8")
        for marker in forbidden:
            assert marker not in source, (path.name, marker)
        assert "public_preview/pages/" in source


def test_public_templates_do_not_silently_bind_to_wagtail_page_fields():
    sources = [
        *(PAGES_DIR / page_name for page_name in REQUIRED_PAGES),
        *(ROOT / "templates" / parent for parent in FAMILY_REQUIRED_BLOCKS),
    ]
    forbidden = ("{{ page.", "{% include_block", "{{ self.")
    for path in sources:
        source = path.read_text(encoding="utf-8")
        for marker in forbidden:
            assert marker not in source, (path.relative_to(ROOT), marker)


def test_existing_editorial_models_remain_candidates_not_public_route_owners():
    model_source = (
        ROOT / "apps" / "content" / "models.py"
    ).read_text(encoding="utf-8")
    for model_name in ACTIVE_SHARED_SETTING_MODELS:
        assert f"class {model_name}(" in model_source
    for model_name in EDITORIAL_PAGE_CANDIDATES:
        assert f"class {model_name}(Page):" in model_source
