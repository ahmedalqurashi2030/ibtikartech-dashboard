REQUIRED_PAGES = (
    "index.html",
    "services.html",
    "ecommerce.html",
    "websites.html",
    "brand-content.html",
    "growth.html",
    "custom-systems.html",
    "tharaa.html",
    "portfolio.html",
    "knowledge.html",
    "article-product-page.html",
    "article-store-launch.html",
    "article-store-redesign.html",
    "about.html",
    "contact.html",
    "store-launch.html",
    "storefront-customization.html",
    "store-redesign.html",
    "product-page-optimization.html",
    "ecommerce-growth.html",
    "ecommerce-support.html",
    "404.html",
)

# Public marketing pages owned by the website layer. Template filenames remain
# .html (normal Django convention); only public browser URLs are extensionless.
PUBLIC_PAGE_ROUTES = {
    "index.html": ("", "home"),
    "ecommerce.html": ("ecommerce/", "ecommerce"),
    "websites.html": ("websites/", "websites"),
    "brand-content.html": ("brand-content/", "brand-content"),
    "growth.html": ("growth/", "growth"),
    "custom-systems.html": ("custom-systems/", "custom-systems"),
    "tharaa.html": ("tharaa/", "tharaa"),
    "portfolio.html": ("portfolio/", "portfolio"),
    "knowledge.html": ("knowledge/", "knowledge"),
    "article-product-page.html": ("knowledge/product-page/", "article-product-page"),
    "article-store-launch.html": ("knowledge/store-launch/", "article-store-launch"),
    "article-store-redesign.html": ("knowledge/store-redesign/", "article-store-redesign"),
    "about.html": ("about/", "about"),
    "contact.html": ("contact/", "contact"),
    "404.html": ("404/", "not-found-preview"),
}

# These pages belong under the real Django services namespace so /services/
# remains the canonical public service family while the generic database-backed
# service routes continue to exist for any other service slug.
SERVICE_PAGE_ROUTES = {
    "store-launch.html": ("store-launch/", "store-launch"),
    "storefront-customization.html": ("storefront-customization/", "storefront-customization"),
    "store-redesign.html": ("store-redesign/", "store-redesign"),
    "product-page-optimization.html": ("product-page-optimization/", "product-page-optimization"),
    "ecommerce-growth.html": ("ecommerce-growth/", "ecommerce-growth"),
    "ecommerce-support.html": ("ecommerce-support/", "ecommerce-support"),
}

PAGE_URL_NAMES = {
    "index.html": "public_preview:home",
    "services.html": "services:index",
    "ecommerce.html": "public_preview:ecommerce",
    "websites.html": "public_preview:websites",
    "brand-content.html": "public_preview:brand-content",
    "growth.html": "public_preview:growth",
    "custom-systems.html": "public_preview:custom-systems",
    "tharaa.html": "public_preview:tharaa",
    "portfolio.html": "public_preview:portfolio",
    "knowledge.html": "public_preview:knowledge",
    "article-product-page.html": "public_preview:article-product-page",
    "article-store-launch.html": "public_preview:article-store-launch",
    "article-store-redesign.html": "public_preview:article-store-redesign",
    "about.html": "public_preview:about",
    "contact.html": "public_preview:contact",
    "store-launch.html": "services:store-launch",
    "storefront-customization.html": "services:storefront-customization",
    "store-redesign.html": "services:store-redesign",
    "product-page-optimization.html": "services:product-page-optimization",
    "ecommerce-growth.html": "services:ecommerce-growth",
    "ecommerce-support.html": "services:ecommerce-support",
    "404.html": "public_preview:not-found-preview",
}

RETIRED_PLATFORM_PAGES = (
    "salla.html",
    "zid.html",
    "shopify.html",
    "woocommerce.html",
    "wordpress.html",
)
