from django.contrib.sitemaps import Sitemap
from django.urls import reverse


# Only canonical, public, indexable routes belong here. Operational, private,
# legacy redirect, preview-error, and parameterized URLs are intentionally
# excluded from the XML sitemap.
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


class PublicStaticSitemap(Sitemap):
    """Sitemap for the explicitly approved public canonical URL set."""

    protocol = "https"

    def items(self):
        return PUBLIC_INDEXABLE_ROUTE_NAMES

    def location(self, item):
        return reverse(item)
