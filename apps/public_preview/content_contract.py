"""Public content authority and Wagtail activation gates.

The production public routes currently render repository-owned Django templates.
Wagtail SiteSettings and TrackingSettings are active shared configuration; the
Wagtail Page subclasses remain editorial candidates until an explicit content
migration proves parity and assigns one owner per field.
"""

from apps.public_preview.manifest import REQUIRED_PAGES

PUBLIC_CONTENT_OWNER = "django-templates"
SHARED_SETTINGS_OWNER = "wagtail-site-settings"
WAGTAIL_PAGE_BINDING = False

PUBLIC_TEMPLATE_OWNED_PAGES = tuple(REQUIRED_PAGES)
ACTIVE_SHARED_SETTING_MODELS = ("SiteSettings", "TrackingSettings")
EDITORIAL_PAGE_CANDIDATES = (
    "HomePage",
    "SolutionPage",
    "PlatformPage",
    "TharaaPage",
    "ArticlePage",
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
