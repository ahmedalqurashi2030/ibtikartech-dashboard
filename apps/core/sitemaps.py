from django.urls import reverse


PUBLIC_SITE_ORIGIN = "https://ibtikartech.co"

# Single source of truth for canonical, public URLs approved for XML sitemap
# inclusion. Operational, private, legacy redirect, error-preview, and
# parameterized URLs are intentionally excluded.
PUBLIC_INDEXABLE_ROUTE_NAMES = (
    "public_preview:home",
    "services:index",
    "public_preview:ecommerce",
    "public_preview:websites",
    "public_preview:brand-content",
    "public_preview:growth",
    "public_preview:custom-systems",
    "services:store-launch",
    "services:storefront-customization",
    "services:store-redesign",
    "services:product-page-optimization",
    "services:ecommerce-growth",
    "services:ecommerce-support",
    "public_preview:tharaa",
    "public_preview:portfolio",
    "public_preview:knowledge",
    "public_preview:article-store-launch",
    "public_preview:article-product-page",
    "public_preview:article-store-redesign",
    "public_preview:about",
    "public_preview:contact",
)


def public_indexable_paths():
    """Resolve approved route names to path-only canonical URLs."""
    return tuple(reverse(route_name) for route_name in PUBLIC_INDEXABLE_ROUTE_NAMES)
