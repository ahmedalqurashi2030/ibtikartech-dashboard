"""Public content ownership and Wagtail activation boundaries.

The public frontend remains repository-owned. Most public routes keep their
content in reviewed Django templates. The knowledge hub and article detail
routes are the first approved Wagtail Page content slice so editors can create,
review, publish, and update articles from /control/ without duplicating content
in templates.
"""

from apps.public_preview.manifest import REQUIRED_PAGES

PUBLIC_CONTENT_OWNER = "declared-per-page"
SHARED_SETTINGS_OWNER = "wagtail-site-settings"
WAGTAIL_PAGE_BINDING = True

WAGTAIL_PAGE_OWNED_PAGES = (
    "knowledge.html",
    "article-product-page.html",
    "article-store-launch.html",
    "article-store-redesign.html",
    "article-ecommerce-cost-saudi.html",
    "article-website-cost-saudi.html",
    "article-automation-first.html",
)
PUBLIC_TEMPLATE_OWNED_PAGES = tuple(
    page_name for page_name in REQUIRED_PAGES if page_name not in WAGTAIL_PAGE_OWNED_PAGES
)

ACTIVE_SHARED_SETTING_MODELS = ("SiteSettings", "TrackingSettings")
ACTIVE_EDITORIAL_PAGE_MODELS = ("ArticleIndexPage", "ArticlePage")
EDITORIAL_PAGE_CANDIDATES = (
    "HomePage",
    "SolutionPage",
    "PlatformPage",
    "TharaaPage",
    "CaseStudyPage",
    "PortfolioPage",
    "AboutPage",
    "LegalPage",
    "LandingPage",
)

WAGTAIL_ACTIVATION_GATES = (
    "field-level source mapping",
    "content migration and rollback plan",
    "SEO and structured-data parity",
    "preview and publishing workflow",
    "route cutover without dual ownership",
    "rendering and visual regression approval",
)
