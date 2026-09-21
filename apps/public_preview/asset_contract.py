"""Explicit ownership for public-preview assets that are not site-global.

Two complementary contracts are kept intentionally:

- ``ROUTE_SCOPED_ASSET_CONSUMERS`` describes assets declared directly by page or
  family templates. It supports the static inheritance guard used by foundation
  tests.
- ``RENDERED_ROUTE_SCOPED_ASSET_CONSUMERS`` describes the effective consumers
  after ``page_key`` conditions and central Django route components are applied.

This separation lets the project verify both template ownership and final route
ownership without pretending a conditional Django branch is an unconditional
consumer.
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
    "article-ecommerce-cost-saudi.html",
    "article-website-cost-saudi.html",
    "article-automation-first.html",
)

SECTION_LAYOUT_ASSET = (
    "public_preview/assets/css/pages/section-layout-refinement-v2.css"
)
RELATED_CARDS_STYLES = "public_preview/assets/css/pages/service-related-cards.css"
RELATED_CARDS_RUNTIME = "public_preview/assets/js/service-related-cards.js"
SERVICE_PRIMITIVES_STYLES = "public_preview/assets/css/service-primitives.css"
SERVICE_PRIMITIVES_RUNTIME = "public_preview/assets/js/service-primitives.js"
SERVICE_CINEMA_STYLES = "public_preview/assets/css/service-cinema.css"
SERVICE_CATEGORY_REFINEMENT_STYLES = (
    "public_preview/assets/css/pages/service-category-refinement-v1.css"
)
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
SERVICES_EXPERIENCE_STYLES = (
    "public_preview/assets/css/pages/services-experience.css"
)
SERVICES_EXPERIENCE_RUNTIME = "public_preview/assets/js/services-experience.js"
ECOMMERCE_EXPERIENCE_STYLES = (
    "public_preview/assets/css/pages/ecommerce-experience-lab.css"
)
ECOMMERCE_EXPERIENCE_RUNTIME = "public_preview/assets/js/ecommerce-category.js"
PLATFORM_STYLES = "public_preview/assets/css/pages/platform.css"

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

SERVICE_CATEGORY_REFINEMENT_CONSUMERS = tuple(
    page_name
    for page_name in SERVICE_CATEGORY_PAGE_NAMES
    if page_name != "ecommerce.html"
)

PLATFORM_STYLE_CONSUMERS = (
    *SERVICE_CATEGORY_PAGE_NAMES,
    "portfolio.html",
    "about.html",
    "contact.html",
    "404.html",
)

# Static page/family ownership. The refinement reference lives in the shared
# category family, so every category inherits the textual declaration even
# though Ecommerce disables it with a page_key condition at render time.
ROUTE_SCOPED_ASSET_CONSUMERS = {
    SECTION_LAYOUT_ASSET: SECTION_LAYOUT_CONSUMERS,
    RELATED_CARDS_STYLES: RELATED_CARDS_CONSUMERS,
    RELATED_CARDS_RUNTIME: RELATED_CARDS_CONSUMERS,
    SERVICE_PRIMITIVES_STYLES: SERVICE_PRIMITIVE_CONSUMERS,
    SERVICE_PRIMITIVES_RUNTIME: SERVICE_PRIMITIVE_CONSUMERS,
    SERVICE_CINEMA_STYLES: SERVICE_CATEGORY_PAGE_NAMES,
    SERVICE_CATEGORY_REFINEMENT_STYLES: SERVICE_CATEGORY_PAGE_NAMES,
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

# Effective rendered ownership. This is the source of truth for browser-facing
# route consumption and includes assets declared by central route components.
RENDERED_ROUTE_SCOPED_ASSET_CONSUMERS = {
    **ROUTE_SCOPED_ASSET_CONSUMERS,
    SERVICE_CATEGORY_REFINEMENT_STYLES: SERVICE_CATEGORY_REFINEMENT_CONSUMERS,
    SERVICES_EXPERIENCE_STYLES: ("services.html",),
    SERVICES_EXPERIENCE_RUNTIME: ("services.html",),
    ECOMMERCE_EXPERIENCE_STYLES: ("ecommerce.html",),
    ECOMMERCE_EXPERIENCE_RUNTIME: ("ecommerce.html",),
    PLATFORM_STYLES: PLATFORM_STYLE_CONSUMERS,
}

# Family-level extension ownership normally falls back to a suffix-wide block.
# Specific assets can opt into a narrower nested block when a route intentionally
# disables only that asset while preserving the rest of the family bundle.
FAMILY_ASSET_EXTENSION_BLOCKS = {
    SERVICE_DETAIL_FAMILY_PARENT: {
        ".css": "service_styles",
        ".js": "service_scripts",
        SERVICE_PRIMITIVES_STYLES: "service_family_primitives_styles",
        SERVICE_PRIMITIVES_RUNTIME: "service_family_primitives_scripts",
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
