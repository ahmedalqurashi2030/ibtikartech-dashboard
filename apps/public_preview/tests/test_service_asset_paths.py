from pathlib import Path
import re


CATEGORY_TEMPLATES = (
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
)

STATIC_URL_RE = re.compile(r'(?:src|href)="(/static/[^"?#]+)')


def _template_source(name):
    return Path("templates/public_preview/pages", name).read_text(encoding="utf-8")


def test_service_categories_do_not_use_document_relative_asset_urls():
    """Category assets must not resolve relative to routes such as /ecommerce/."""
    for template_name in CATEGORY_TEMPLATES:
        source = _template_source(template_name)
        assert 'src="assets/' not in source, template_name
        assert "src='assets/" not in source, template_name
        assert 'href="assets/' not in source, template_name
        assert "href='assets/" not in source, template_name


def test_service_category_static_references_exist_in_repository():
    """Catch stale visual references before they become broken images or links."""
    for template_name in CATEGORY_TEMPLATES:
        source = _template_source(template_name)
        for static_url in STATIC_URL_RE.findall(source):
            relative_path = static_url.removeprefix("/static/")
            assert Path("static", relative_path).is_file(), (
                template_name,
                static_url,
            )
