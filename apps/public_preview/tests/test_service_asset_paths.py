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
ECOMMERCE_FRAGMENT_MARKER = "{% url 'public_preview:ecommerce' %}#"


def _template_source(name):
    path = f"templates/public_preview/pages/{name}"
    with open(path, encoding="utf-8") as template_file:
        return template_file.read()


def _file_exists(path):
    try:
        with open(path, "rb"):
            return True
    except FileNotFoundError:
        return False


def _quoted_values(source, prefix):
    values = set()
    for quote in ('"', "'"):
        marker = f"{prefix}{quote}"
        start = 0
        while True:
            marker_index = source.find(marker, start)
            if marker_index == -1:
                break
            value_start = marker_index + len(marker)
            value_end = source.find(quote, value_start)
            if value_end == -1:
                break
            values.add(source[value_start:value_end])
            start = value_end + 1
    return values


def _static_urls(source):
    urls = set()
    for quote in ('"', "'"):
        marker = f"{quote}/static/"
        start = 0
        while True:
            marker_index = source.find(marker, start)
            if marker_index == -1:
                break
            value_start = marker_index + 1
            value_end = source.find(quote, value_start)
            if value_end == -1:
                break
            url = source[value_start:value_end].split("?", 1)[0].split("#", 1)[0]
            urls.add(url)
            start = value_end + 1
    return urls


def _ecommerce_fragments(source):
    fragments = []
    for remainder in source.split(ECOMMERCE_FRAGMENT_MARKER)[1:]:
        fragment = ""
        for character in remainder:
            if character.isalnum() or character in "-_":
                fragment += character
            else:
                break
        if fragment:
            fragments.append(fragment)
    return fragments


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
        for static_url in _static_urls(source):
            relative_path = static_url.removeprefix("/static/")
            assert _file_exists(f"static/{relative_path}"), (
                template_name,
                static_url,
            )


def test_service_links_to_ecommerce_fragments_target_existing_sections():
    """Cross-page ecommerce links must land on a real section, not a stale fragment."""
    ecommerce_source = _template_source("ecommerce.html")
    ecommerce_ids = _quoted_values(ecommerce_source, "id=")

    for template_name in DETAIL_TEMPLATES:
        source = _template_source(template_name)
        for fragment in _ecommerce_fragments(source):
            assert fragment in ecommerce_ids, (template_name, fragment)
