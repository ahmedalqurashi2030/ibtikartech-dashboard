"""Approved template inheritance contracts for the public website.

The allowlist keeps the page-family migration explicit. New families must be
reviewed here together with their template guards and rendering tests.
"""

BASE_TEMPLATE_PARENT = "public_preview/base.html"
SERVICE_DETAIL_FAMILY_PARENT = "public_preview/families/service_detail_base.html"

PAGE_PARENT_OVERRIDES = {
    "store-launch.html": SERVICE_DETAIL_FAMILY_PARENT,
    "storefront-customization.html": SERVICE_DETAIL_FAMILY_PARENT,
    "store-redesign.html": SERVICE_DETAIL_FAMILY_PARENT,
    "product-page-optimization.html": SERVICE_DETAIL_FAMILY_PARENT,
    "ecommerce-growth.html": SERVICE_DETAIL_FAMILY_PARENT,
    "ecommerce-support.html": SERVICE_DETAIL_FAMILY_PARENT,
}

FAMILY_REQUIRED_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: (
        "service_page_title",
        "service_meta_description",
        "service_breadcrumb_current",
        "service_hero",
        "service_content",
    ),
}

FAMILY_EXTENSION_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: (
        "service_styles",
        "service_after_main",
        "service_scripts",
    ),
}


def page_parent(page_name: str) -> str:
    return PAGE_PARENT_OVERRIDES.get(page_name, BASE_TEMPLATE_PARENT)


def extends_tag(parent: str) -> str:
    return f'{{% extends "{parent}" %}}'


def block_tag(name: str) -> str:
    return f"{{% block {name} %}}"
