import pathlib
import re


CATEGORY_TEMPLATES = (
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
)

DETAIL_TEMPLATES = (
    "store-launch.html",
    "storefront-customization.html",
    "store-redesign.html",
    "product-page-optimization.html",
    "ecommerce-growth.html",
    "ecommerce-support.html",
)

SERVICE_TEMPLATES = (*CATEGORY_TEMPLATES, *DETAIL_TEMPLATES)
STATIC_URL_RE = re.compile(r'["\'](/static/[^"\'?#]+)')
HTML_ID_RE = re.compile(r'\bid=["\']([^"\']+)["\']')
ECOMMERCE_FRAGMENT_RE = re.compile(
    r"\{% url 'public_preview:ecommerce' %\}#([A-Za-z0-9_-]+)"
)


def _template_source(name):
    return pathlib.Path("templates/public_preview/pages", name).read_text(encoding="utf-8")


def test_service_templates_do_not_use_document_relative_asset_urls():
    """Service assets must not resolve relative to routes such as /ecommerce/."""
    for template_name in SERVICE_TEMPLATES:
        source = _template_source(template_name)
        assert '"assets/' not in source, template_name
        assert "'assets/" not in source, template_name


def test_service_static_references_exist_in_repository():
    """Catch stale visual/runtime references before they become broken assets."""
    for template_name in SERVICE_TEMPLATES:
        source = _template_source(template_name)
        for static_url in STATIC_URL_RE.findall(source):
            relative_path = static_url.removeprefix("/static/")
            assert pathlib.Path("static", relative_path).is_file(), (
                template_name,
                static_url,
            )


def test_service_links_to_ecommerce_fragments_target_existing_sections():
    """Cross-page ecommerce links must land on a real section, not a stale fragment."""
    ecommerce_source = _template_source("ecommerce.html")
    ecommerce_ids = set(HTML_ID_RE.findall(ecommerce_source))

    for template_name in DETAIL_TEMPLATES:
        source = _template_source(template_name)
        for fragment in ECOMMERCE_FRAGMENT_RE.findall(source):
            assert fragment in ecommerce_ids, (template_name, fragment)
