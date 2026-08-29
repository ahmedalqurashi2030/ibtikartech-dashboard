"""Approved template inheritance contracts for the public website.

The allowlist keeps every page-family migration explicit. New families must be
reviewed here together with their template guards and rendering tests.
"""

BASE_TEMPLATE_PARENT = "public_preview/base.html"
SERVICE_DETAIL_FAMILY_PARENT = "public_preview/families/service_detail_base.html"
SERVICE_CATEGORY_FAMILY_PARENT = "public_preview/families/service_category_base.html"
ARTICLE_DETAIL_FAMILY_PARENT = "public_preview/families/article_detail_base.html"

PAGE_PARENT_OVERRIDES = {
    "store-launch.html": SERVICE_DETAIL_FAMILY_PARENT,
    "storefront-customization.html": SERVICE_DETAIL_FAMILY_PARENT,
    "store-redesign.html": SERVICE_DETAIL_FAMILY_PARENT,
    "product-page-optimization.html": SERVICE_DETAIL_FAMILY_PARENT,
    "ecommerce-growth.html": SERVICE_DETAIL_FAMILY_PARENT,
    "ecommerce-support.html": SERVICE_DETAIL_FAMILY_PARENT,
    "ecommerce.html": SERVICE_CATEGORY_FAMILY_PARENT,
    "websites.html": SERVICE_CATEGORY_FAMILY_PARENT,
    "brand-content.html": SERVICE_CATEGORY_FAMILY_PARENT,
    "growth.html": SERVICE_CATEGORY_FAMILY_PARENT,
    "custom-systems.html": SERVICE_CATEGORY_FAMILY_PARENT,
    "article-product-page.html": ARTICLE_DETAIL_FAMILY_PARENT,
    "article-store-launch.html": ARTICLE_DETAIL_FAMILY_PARENT,
    "article-store-redesign.html": ARTICLE_DETAIL_FAMILY_PARENT,
}

FAMILY_REQUIRED_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: (
        "service_page_title",
        "service_meta_description",
        "service_breadcrumb_current",
        "service_hero",
        "service_content",
    ),
    SERVICE_CATEGORY_FAMILY_PARENT: (
        "category_page_title",
        "category_meta_description",
        "category_body_attrs",
        "category_content",
    ),
    ARTICLE_DETAIL_FAMILY_PARENT: (
        "article_head_metadata",
        "article_structured_data",
        "article_content",
    ),
}

FAMILY_EXTENSION_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: (
        "service_styles",
        "service_after_main",
        "service_scripts",
    ),
    SERVICE_CATEGORY_FAMILY_PARENT: (
        "category_styles",
        "category_scripts",
    ),
    ARTICLE_DETAIL_FAMILY_PARENT: (
        "article_styles",
        "article_scripts",
    ),
}

FAMILY_REQUIRED_MARKERS = {
    SERVICE_DETAIL_FAMILY_PARENT: (
        'id="main-content"',
        'id="decision-center"',
        "commerce-service-detail.css",
        "commerce-service-detail.js",
        'aria-label="مسار التنقل"',
        'aria-label="دليل قرار الخدمة"',
    ),
    SERVICE_CATEGORY_FAMILY_PARENT: (
        'id="main-content"',
        "service-category.css",
        "service-cinema.js",
    ),
    ARTICLE_DETAIL_FAMILY_PARENT: (
        'id="main-content"',
        'id="progressBar"',
        "articles.css",
        "articles.js",
    ),
}


def page_parent(page_name: str) -> str:
    return PAGE_PARENT_OVERRIDES.get(page_name, BASE_TEMPLATE_PARENT)


def extends_tag(parent: str) -> str:
    return f'{{% extends "{parent}" %}}'


def block_tag(name: str) -> str:
    return f"{{% block {name} %}}"
