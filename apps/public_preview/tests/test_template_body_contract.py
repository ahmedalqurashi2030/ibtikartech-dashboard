import re
from pathlib import Path

from django.conf import settings

from apps.public_preview.manifest import (
    PAGE_URL_NAMES,
    PUBLIC_PAGE_ROUTES,
    REQUIRED_PAGES,
    SERVICE_PAGE_ROUTES,
)

PAGES_DIR = Path(settings.BASE_DIR) / "templates" / "public_preview" / "pages"
BASE_TEMPLATE = Path(settings.BASE_DIR) / "templates" / "public_preview" / "base.html"
COMPONENTS_DIR = Path(settings.BASE_DIR) / "templates" / "public_preview" / "components"


def _known_clean_paths() -> dict[str, str]:
    paths = {"/services/": "services:index"}
    for page_name, (route, _view_name) in PUBLIC_PAGE_ROUTES.items():
        paths[f"/{route}" if route else "/"] = PAGE_URL_NAMES[page_name]
    for page_name, (route, _view_name) in SERVICE_PAGE_ROUTES.items():
        paths[f"/services/{route}"] = PAGE_URL_NAMES[page_name]
    return paths


KNOWN_CLEAN_PATHS = _known_clean_paths()


def test_public_children_use_one_native_body_block_only():
    for page_name in REQUIRED_PAGES:
        source = (PAGES_DIR / page_name).read_text(encoding="utf-8")

        assert source.lstrip().startswith('{% extends "public_preview/base.html" %}')
        assert source.count("{% block body %}") == 1, page_name
        assert "{% block content %}" not in source, page_name
        assert "{% block page_scripts %}" not in source, page_name
        assert "page_scripts" not in source, page_name

        # Page-specific sections stay inline. Only the global shell is shared.
        assert "{% include " not in source, page_name
        assert "public_preview/components/" not in source, page_name
        assert 'id="ibtikarSiteHeader"' not in source, page_name
        assert 'class="ibt-shell-footer"' not in source, page_name


def test_public_base_owns_only_required_shared_shell_includes():
    base = BASE_TEMPLATE.read_text(encoding="utf-8")

    assert '{% block body %}{% endblock %}' in base
    assert "{% block content %}" not in base
    assert "{% block page_scripts %}" not in base
    assert "page_scripts" not in base

    for component in ("document_head.html", "header.html", "footer.html"):
        assert f'include "public_preview/components/{component}"' in base
        assert (COMPONENTS_DIR / component).is_file()

    # DOM contracts that are already supported by page markup/runtime must not
    # add a separate global JavaScript request through the base template.
    assert 'include "public_preview/components/runtime.html"' not in base


def test_known_internal_page_links_use_django_named_urls_in_templates():
    sources = [
        *(PAGES_DIR / page_name for page_name in REQUIRED_PAGES),
        *(COMPONENTS_DIR / name for name in ("header.html", "mobile_menu.html", "footer.html")),
    ]

    for path in sources:
        source = path.read_text(encoding="utf-8")
        for clean_path, route_name in KNOWN_CLEAN_PATHS.items():
            literal = re.compile(
                rf'(?:href|action)=(["\']){re.escape(clean_path)}(?:[?#][^"\']*)?\1'
            )
            assert literal.search(source) is None, (
                f"{path.relative_to(settings.BASE_DIR)} contains literal internal route "
                f"{clean_path}; use {{% url '{route_name}' %}} instead"
            )


def test_named_url_tags_cover_all_public_route_names():
    combined = "\n".join(
        (PAGES_DIR / page_name).read_text(encoding="utf-8")
        for page_name in REQUIRED_PAGES
    )
    combined += "\n" + "\n".join(
        (COMPONENTS_DIR / name).read_text(encoding="utf-8")
        for name in ("header.html", "mobile_menu.html", "footer.html")
    )

    # This is a routing-contract guard, not a requirement that every route must
    # appear in every page. Any rendered cross-page link must use a known name.
    for route_name in set(PAGE_URL_NAMES.values()):
        if route_name in combined:
            assert f"{{% url '{route_name}' %}}" in combined
