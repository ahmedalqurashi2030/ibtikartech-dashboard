"""Explicit ownership for public-preview assets that are not site-global.

Asset files may be shared by several page types, but each rendered page must opt
in deliberately. This prevents route-specific CSS and JavaScript from drifting
back into the global base template.
"""

from apps.public_preview.manifest import SERVICE_PAGE_ROUTES

SERVICE_DETAIL_PAGE_NAMES = tuple(SERVICE_PAGE_ROUTES)

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
}
