"""Explicit ownership for public-preview assets that are not site-global.

Asset files may be shared by several page types, but each rendered page must opt
in deliberately. This prevents route-specific CSS and JavaScript from drifting
back into the global base template.
"""

from apps.public_preview.manifest import SERVICE_PAGE_ROUTES
from apps.public_preview.template_contract import (
    ARTICLE_DETAIL_FAMILY_PARENT,
    SERVICE_CATEGORY_FAMILY_PARENT,
    SERVICE_DETAIL_FAMILY_PARENT,
)

SERVICE_DETAIL_PAGE_NAMES = tuple(SERVICE_PAGE_ROUTES)
ARTICLE_DETAIL_PAGE_NAMES = (
    "article-product-page.html",
    "article-store-launch.html",
    "article-store-redesign.html",
)

SECTION_LAYOUT_ASSET = (
    "public_preview/assets/css/pages/section-layout-refinement-v2.css"
)
RELATED_CARDS_STYLES = (
    "public_preview/assets/css/pages/service-related-cards.css"
)
RELATED_CARDS_RUNTIME = "public_preview/assets/js/service-related-cards.js"
HOMEPAGE_SURFACE_ASSET = (
    "public_preview/assets/css/pages/homepage-surface-refinement-v1.css"
)
ARTICLE_STYLES = "public_preview/assets/css/pages/articles.css"
ARTICLE_RUNTIME = "public_preview/assets/js/articles.js"

SECTION_LAYOUT_CONSUMERS = (
    "index.html",
    "services.html",
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    *SERVICE_DETAIL_PAGE_NAMES,
)

RELATED_CARDS_CONSUMERS = (
    "portfolio.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    *SERVICE_DETAIL_PAGE_NAMES,
)

ROUTE_SCOPED_ASSET_CONSUMERS = {
    SECTION_LAYOUT_ASSET: SECTION_LAYOUT_CONSUMERS,
    RELATED_CARDS_STYLES: RELATED_CARDS_CONSUMERS,
    RELATED_CARDS_RUNTIME: RELATED_CARDS_CONSUMERS,
    HOMEPAGE_SURFACE_ASSET: ("index.html",),
    ARTICLE_STYLES: ("knowledge.html", *ARTICLE_DETAIL_PAGE_NAMES),
    ARTICLE_RUNTIME: ("knowledge.html", *ARTICLE_DETAIL_PAGE_NAMES),
}

FAMILY_ASSET_EXTENSION_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: {
        ".css": "service_styles",
        ".js": "service_scripts",
    },
    SERVICE_CATEGORY_FAMILY_PARENT: {
        ".css": "category_styles",
        ".js": "category_scripts",
    },
    ARTICLE_DETAIL_FAMILY_PARENT: {
        ".css": "article_styles",
        ".js": "article_scripts",
    },
}
