import re
from pathlib import Path

from django.conf import settings

from apps.public_preview.manifest import (
    PAGE_URL_NAMES,
    PUBLIC_PAGE_ROUTES,
    REQUIRED_PAGES,
    SERVICE_PAGE_ROUTES,
)
from apps.public_preview.template_contract import (
    BASE_TEMPLATE_PARENT,
    FAMILY_REQUIRED_BLOCKS,
    block_tag,
    extends_tag,
    page_parent,
)

TEMPLATES_DIR = Path(settings.BASE_DIR) / "templates" / "public_preview"
PAGES_DIR = TEMPLATES_DIR / "pages"
BASE_TEMPLATE = TEMPLATES_DIR / "base.html"
COMPONENTS_DIR = TEMPLATES_DIR / "components"


def _family_path(parent: str) -> Path:
    return Path(settings.BASE_DIR) / "templates" / parent


def _shared_template_sources() -> list[Path]:
    components = [
        COMPONENTS_DIR / name
        for name in ("header.html", "mobile_menu.html", "footer.html")
    ]
    families = [_family_path(parent) for parent in FAMILY_REQUIRED_BLOCKS]
    return [*components, *families]


def _known_clean_paths() -> dict[str, str]:
    paths = {"/services/": "services:index"}
    for page_name, (route, _view_name) in PUBLIC_PAGE_ROUTES.items():
        paths[f"/{route}" if route else "/"] = PAGE_URL_NAMES[page_name]
    for page_name, (route, _view_name) in SERVICE_PAGE_ROUTES.items():
        paths[f"/services/{route}"] = PAGE_URL_NAMES[page_name]
    return paths


KNOWN_CLEAN_PATHS = _known_clean_paths()


def test_public_children_use_an_approved_presentation_contract():
    for page_name in REQUIRED_PAGES:
        source = (PAGES_DIR / page_name).read_text(encoding="utf-8")
        parent = page_parent(page_name)

        assert source.lstrip().startswith(extends_tag(parent)), page_name
        assert "{% block content %}" not in source, page_name
        assert "{% block page_scripts %}" not in source, page_name
        assert "page_scripts" not in source, page_name

        if parent == BASE_TEMPLATE_PARENT:
            assert source.count("{% block body %}") == 1, page_name
        else:
            assert source.count("{% block body %}") == 0, page_name
            for block_name in FAMILY_REQUIRED_BLOCKS[parent]:
                assert source.count(block_tag(block_name)) == 1, (
                    page_name,
                    block_name,
                )

        # Page content never owns the global shell or imports arbitrary partials.
        assert "{% include " not in source, page_name
        assert "public_preview/components/" not in source, page_name
        assert 'id="ibtikarSiteHeader"' not in source, page_name
        assert 'class="ibt-shell-footer"' not in source, page_name


def test_public_base_owns_the_global_shell():
    base = BASE_TEMPLATE.read_text(encoding="utf-8")

    assert '{% block body %}{% endblock %}' in base
    assert "{% block content %}" not in base
    assert "{% block page_scripts %}" not in base
    assert "page_scripts" not in base

    for component in ("document_head.html", "header.html", "footer.html", "runtime.html"):
        assert f'include "public_preview/components/{component}"' in base
        assert (COMPONENTS_DIR / component).is_file()


def test_approved_family_templates_own_one_stable_page_structure():
    for parent, required_blocks in FAMILY_REQUIRED_BLOCKS.items():
        path = _family_path(parent)
        source = path.read_text(encoding="utf-8")

        assert source.lstrip().startswith(extends_tag(BASE_TEMPLATE_PARENT)), parent
        assert source.count("{% block body %}") == 1, parent
        assert source.count('id="main-content"') == 1, parent
        assert source.count('id="decision-center"') == 1, parent
        assert source.count("commerce-service-detail.css") == 1, parent
        assert source.count("commerce-service-detail.js") == 1, parent
        assert 'aria-label="مسار التنقل"' in source, parent
        assert 'aria-label="دليل قرار الخدمة"' in source, parent
        assert "{% include " not in source, parent

        for block_name in required_blocks:
            assert source.count(block_tag(block_name)) == 1, (
                parent,
                block_name,
            )


def test_known_internal_page_links_use_django_named_urls_in_templates():
    sources = [
        *(PAGES_DIR / page_name for page_name in REQUIRED_PAGES),
        *_shared_template_sources(),
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
    sources = [
        *(PAGES_DIR / page_name for page_name in REQUIRED_PAGES),
        *_shared_template_sources(),
    ]
    combined = "\n".join(path.read_text(encoding="utf-8") for path in sources)

    # This is a routing-contract guard, not a requirement that every route must
    # appear in every page. Any rendered cross-page link must use a known name.
    for route_name in set(PAGE_URL_NAMES.values()):
        if route_name in combined:
            assert f"{{% url '{route_name}' %}}" in combined
