# Ibtikar Tech — Indexation Map

Status: Active policy for the public website
Canonical origin: `https://ibtikartech.co`
Code source of truth: `apps/core/sitemaps.py`

## Policy

A URL belongs in the XML sitemap only when it is an approved public landing page that is intended to return a canonical `200` response and be eligible for search indexing.

The sitemap must not contain operational routes, authenticated areas, error pages, legacy redirect URLs, parameterized variants, or unreviewed Wagtail pages.

## Indexable public URLs

| URL | Type | Sitemap | Index policy |
| --- | --- | --- | --- |
| `/` | Home | Yes | Index |
| `/services/` | Services hub | Yes | Index |
| `/ecommerce/` | Service category | Yes | Index |
| `/websites/` | Service category | Yes | Index |
| `/brand-content/` | Service category | Yes | Index |
| `/growth/` | Service category | Yes | Index |
| `/custom-systems/` | Service category | Yes | Index |
| `/services/store-launch/` | Commercial service | Yes | Index |
| `/services/storefront-customization/` | Commercial service | Yes | Index |
| `/services/store-redesign/` | Commercial service | Yes | Index |
| `/services/product-page-optimization/` | Commercial service | Yes | Index |
| `/services/ecommerce-growth/` | Commercial service | Yes | Index |
| `/services/ecommerce-support/` | Commercial service | Yes | Index |
| `/tharaa/` | Product/theme landing page | Yes | Index |
| `/portfolio/` | Proof/portfolio | Yes | Index |
| `/knowledge/` | Knowledge hub | Yes | Index |
| `/knowledge/store-launch/` | Article | Yes | Index |
| `/knowledge/product-page/` | Article | Yes | Index |
| `/knowledge/store-redesign/` | Article | Yes | Index |
| `/knowledge/ecommerce-cost-saudi/` | Article | Yes | Index |
| `/knowledge/website-cost-saudi/` | Article | Yes | Index |
| `/knowledge/automation-first/` | Article | Yes | Index |
| `/about/` | Company information | Yes | Index |
| `/contact/` | Contact/conversion page | Yes | Index |

## Explicitly excluded URL classes

| URL / class | Sitemap | Index policy | Handling |
| --- | --- | --- | --- |
| `/404/` | No | Noindex | Real HTTP `404` |
| `*.html` legacy public URLs | No | No standalone indexing | Permanent redirect to clean canonical URL |
| `/accounts/*` | No | Noindex, nofollow | django-allauth layout metadata |
| `/portal/*` | No | Noindex, nofollow | Portal base-template metadata; authentication remains the security boundary |
| `/portal/support/*` | No | Noindex, nofollow | Inherits portal policy |
| `/django-admin/*` | No | Noindex | Django admin provides robots metadata; robots.txt also discourages crawling |
| `/control/*` | No | Noindex | Wagtail admin provides robots metadata; robots.txt also discourages crawling |
| `/healthz/` | No | Noindex, nofollow | `X-Robots-Tag` response header |
| `/analytics/events/collect/` | No | Not a search landing page | POST-only analytics endpoint |
| Query-string variants such as `/contact/?...` | No | Canonicalize to clean page | Never add parameter variants to sitemap |

## Conditional / separate-review surfaces

### Wagtail public pages

Wagtail is mounted as a catch-all and must not be treated as automatically indexable. A Wagtail page may be added to the indexation map only when all of the following are true:

1. Published and intentionally public.
2. Unique and useful enough to stand as a search landing page.
3. Approved canonical URL.
4. Intended to return a stable `200` response.
5. SEO metadata/content has been reviewed.
6. It does not duplicate an existing static/service URL or another Wagtail page.

Until that review exists, Wagtail pages are not automatically added to the XML sitemap.

### `/documents/*`

Do not apply a blanket noindex rule. Documents are classified individually because some public assets may legitimately need to remain discoverable or crawlable.

### Static and media assets

`/static/*` and `/media/*` are not page URLs and never belong in the page sitemap. Required CSS, JavaScript, and important public images must remain crawlable where needed for rendering and image discovery.

## Canonical and robots rules

- Canonical production origin is `https://ibtikartech.co`.
- XML sitemap endpoint is `/sitemap.xml`.
- `robots.txt` advertises the canonical sitemap URL.
- `robots.txt` is crawl guidance, not the security boundary and not the primary noindex mechanism.
- Authentication/authorization remains the security boundary for private areas.
- Legacy URLs must redirect to the clean URL rather than render duplicate content.

## Change control

When adding, removing, renaming, or consolidating a public page:

1. Decide its intended indexation state first.
2. Update `apps/core/sitemaps.py` only if the page is approved for sitemap inclusion.
3. Update this document in the same change.
4. Preserve a permanent redirect when replacing an established public URL where appropriate.
5. Do not add draft, test, thin, duplicate, private, parameterized, or error URLs to the sitemap.

Verification and automated checks are intentionally handled as a separate final gate and are not part of this implementation step.
