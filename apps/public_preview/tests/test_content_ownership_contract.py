from pathlib import Path

from django.conf import settings

from apps.public_preview.content_contract import (
    ACTIVE_EDITORIAL_PAGE_MODELS,
    ACTIVE_SHARED_SETTING_MODELS,
    EDITORIAL_PAGE_CANDIDATES,
    PUBLIC_CONTENT_OWNER,
    PUBLIC_TEMPLATE_OWNED_PAGES,
    SHARED_SETTINGS_OWNER,
    WAGTAIL_ACTIVATION_GATES,
    WAGTAIL_PAGE_BINDING,
    WAGTAIL_PAGE_OWNED_PAGES,
)
from apps.public_preview.manifest import REQUIRED_PAGES
from apps.public_preview.template_contract import FAMILY_REQUIRED_BLOCKS

ROOT = Path(settings.BASE_DIR)
PAGES_DIR = ROOT / "templates" / "public_preview" / "pages"


def test_public_content_has_one_declared_owner_per_page():
    assert PUBLIC_CONTENT_OWNER == "declared-per-page"
    assert SHARED_SETTINGS_OWNER == "wagtail-site-settings"
    assert WAGTAIL_PAGE_BINDING is True
    assert ACTIVE_SHARED_SETTING_MODELS == ("SiteSettings", "TrackingSettings")
    assert ACTIVE_EDITORIAL_PAGE_MODELS == ("ArticleIndexPage", "ArticlePage")
    assert len(WAGTAIL_ACTIVATION_GATES) == 6

    template_owned = set(PUBLIC_TEMPLATE_OWNED_PAGES)
    wagtail_owned = set(WAGTAIL_PAGE_OWNED_PAGES)
    required = set(REQUIRED_PAGES)

    assert template_owned.isdisjoint(wagtail_owned)
    assert template_owned | wagtail_owned == required
    assert "knowledge.html" in wagtail_owned
    assert all(
        page_name.startswith("article-") or page_name == "knowledge.html"
        for page_name in wagtail_owned
    )


def test_only_article_public_views_delegate_to_wagtail_content():
    public_source = (
        ROOT / "apps" / "public_preview" / "views.py"
    ).read_text(encoding="utf-8")
    service_source = (
        ROOT / "apps" / "services" / "public_views.py"
    ).read_text(encoding="utf-8")

    assert (
        "from apps.content.public_views import serve_article_detail, serve_article_index"
        in public_source
    )
    assert "return serve_article_index(request)" in public_source
    assert 'return serve_article_detail(request, "store-launch")' in public_source
    assert "public_preview/pages/" in public_source

    forbidden = (
        "from apps.content.models import",
        "import apps.content.models",
        "from wagtail.models import Page",
        "Page.objects",
        ".specific",
    )
    for marker in forbidden:
        assert marker not in public_source
        assert marker not in service_source


def test_static_public_templates_do_not_silently_bind_to_wagtail_page_fields():
    sources = [
        *(PAGES_DIR / page_name for page_name in REQUIRED_PAGES),
        *(ROOT / "templates" / parent for parent in FAMILY_REQUIRED_BLOCKS),
    ]
    forbidden = ("{{ page.", "{% include_block", "{{ self.")
    for path in sources:
        source = path.read_text(encoding="utf-8")
        for marker in forbidden:
            assert marker not in source, (path.relative_to(ROOT), marker)

    managed_index = (
        ROOT / "templates" / "content" / "article_index_page.html"
    ).read_text(encoding="utf-8")
    managed_detail = (
        ROOT / "templates" / "content" / "article_page.html"
    ).read_text(encoding="utf-8")
    assert "{{ page." in managed_index
    assert "{{ page." in managed_detail


def test_editorial_model_status_matches_the_content_contract():
    model_source = (
        ROOT / "apps" / "content" / "models.py"
    ).read_text(encoding="utf-8")

    for model_name in ACTIVE_SHARED_SETTING_MODELS:
        assert f"class {model_name}(" in model_source
    for model_name in ACTIVE_EDITORIAL_PAGE_MODELS:
        assert f"class {model_name}(Page):" in model_source
    for model_name in EDITORIAL_PAGE_CANDIDATES:
        assert f"class {model_name}(Page):" in model_source
