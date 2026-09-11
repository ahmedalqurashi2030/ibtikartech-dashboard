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
SERVICE_CATEGORY_PAGE_NAMES = (
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
)
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
SERVICE_PRIMITIVES_STYLES = "public_preview/assets/css/service-primitives.css"
SERVICE_PRIMITIVES_RUNTIME = "public_preview/assets/js/service-primitives.js"
HOMEPAGE_SURFACE_ASSET = (
    "public_preview/assets/css/pages/homepage-surface-refinement-v1.css"
)
ARTICLE_STYLES = "public_preview/assets/css/pages/articles.css"
ARTICLE_RUNTIME = "public_preview/assets/js/articles.js"
CONVERSION_FUNNEL_STYLES = "public_preview/assets/css/pages/conversion-funnel.css"
HOME_SOURCE_STYLES = "public_preview/assets/css/pages/source-home.css"
HOME_SOURCE_RUNTIME = "public_preview/assets/js/source-home.js"
SERVICES_SOURCE_STYLES = "public_preview/assets/css/pages/source-services.css"
SERVICES_SOURCE_RUNTIME = "public_preview/assets/js/source-services.js"
THARAA_SOURCE_STYLES = "public_preview/assets/css/pages/source-tharaa.css"
THARAA_SOURCE_RUNTIME = "public_preview/assets/js/source-tharaa.js"

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
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    *SERVICE_DETAIL_PAGE_NAMES,
)

SERVICE_PRIMITIVE_CONSUMERS = tuple(
    page_name
    for page_name in SERVICE_DETAIL_PAGE_NAMES
    if page_name != "product-page-optimization.html"
)
SERVICE_PRIMITIVE_STYLE_CONSUMERS = (
    *SERVICE_CATEGORY_PAGE_NAMES,
    *SERVICE_PRIMITIVE_CONSUMERS,
)

ROUTE_SCOPED_ASSET_CONSUMERS = {
    SECTION_LAYOUT_ASSET: SECTION_LAYOUT_CONSUMERS,
    RELATED_CARDS_STYLES: RELATED_CARDS_CONSUMERS,
    RELATED_CARDS_RUNTIME: RELATED_CARDS_CONSUMERS,
    SERVICE_PRIMITIVES_STYLES: SERVICE_PRIMITIVE_STYLE_CONSUMERS,
    SERVICE_PRIMITIVES_RUNTIME: SERVICE_PRIMITIVE_CONSUMERS,
    HOMEPAGE_SURFACE_ASSET: ("index.html",),
    ARTICLE_STYLES: ("knowledge.html", *ARTICLE_DETAIL_PAGE_NAMES),
    ARTICLE_RUNTIME: ("knowledge.html", *ARTICLE_DETAIL_PAGE_NAMES),
    CONVERSION_FUNNEL_STYLES: ("index.html", "services.html", "tharaa.html"),
    HOME_SOURCE_STYLES: ("index.html",),
    HOME_SOURCE_RUNTIME: ("index.html",),
    SERVICES_SOURCE_STYLES: ("services.html",),
    SERVICES_SOURCE_RUNTIME: ("services.html",),
    THARAA_SOURCE_STYLES: ("tharaa.html",),
    THARAA_SOURCE_RUNTIME: ("tharaa.html",),
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
