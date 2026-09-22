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
    "services:seo",
    "public_preview:tharaa",
    "public_preview:portfolio",
    "public_preview:knowledge",
    "public_preview:about",
    "public_preview:contact",
)


def public_indexable_paths():
    """Resolve approved static routes plus every live public article."""
    from apps.content.models import ArticleIndexPage, ArticlePage

    static_paths = [reverse(route_name) for route_name in PUBLIC_INDEXABLE_ROUTE_NAMES]
    index_page = ArticleIndexPage.objects.live().public().first()
    article_paths = []
    if index_page is not None:
        article_paths = [
            reverse("public_preview:article-detail", kwargs={"slug": slug})
            for slug in (
                ArticlePage.objects.live()
                .public()
                .child_of(index_page)
                .order_by("slug")
                .values_list("slug", flat=True)
            )
        ]
    return tuple(dict.fromkeys([*static_paths, *article_paths]))
