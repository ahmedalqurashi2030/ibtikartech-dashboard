# Ibtikar Tech — Structured Data Plan

Status: v0.1 — implementation and governance map
Research snapshot: 2026-09-18
Canonical site: `https://ibtikartech.co`
Depends on: `INDEXATION_MAP.md`, `INTERNAL_LINKING_MAP.md`

## Principle

Structured data must describe content that is genuinely present and useful on the page. It is not a substitute for content, crawling, canonicalization, or internal linking, and it must not contain unsupported claims or stale commercial data.

Google-supported search features and Schema.org vocabulary are not the same thing. A Schema.org type may be valid without creating a Google rich result. We therefore prioritize markup with a clear semantic or Google-supported purpose and avoid adding types merely because they exist in Schema.org.

## Implemented

### 1. Organization — homepage only

Location: `templates/public_preview/components/site_structured_data.html`

Policy:
- Render only on `/`.
- Use the real organization/site name from SiteSettings.
- Use canonical site URL.
- Include contact email/telephone only when configured.
- Include `sameAs` only from configured social profile URLs.
- Do not invent address, legal identifiers, awards, ratings, or other unsupported properties.

Reasoning:
Google recommends placing Organization markup on the homepage or one organization/about page rather than repeating it on every page.

### 2. WebSite — homepage only

Location: same component as Organization.

Properties currently used:
- canonical site URL;
- Arabic and English site names;
- publisher reference to Organization;
- `inLanguage: ar-SA`.

No unsupported SearchAction is added because the site does not expose a verified site-search experience that needs to be described.

### 3. BreadcrumbList — approved hierarchical routes

Locations:
- `apps/core/seo_context.py`
- `apps/content/context_processors.py`
- `templates/public_preview/components/breadcrumb_structured_data.html`
- shared document head include.

Current coverage:
- Services hub.
- Five public service-category hubs.
- Six ecommerce specialist services.
- Knowledge hub.
- Three knowledge articles.

Policy:
- Breadcrumb hierarchy follows user-facing information architecture, not URL segmentation alone.
- Canonical absolute URLs use `https://ibtikartech.co`.
- Only approved routes receive markup.
- Pages without an approved hierarchy do not receive a fabricated breadcrumb trail.

### 4. Article structured data — existing implementation

The three current knowledge articles already contain `Article` JSON-LD with headline, publication/modification dates, language, organization author/publisher, and canonical main entity URL.

Current articles:
- `/knowledge/store-launch/`
- `/knowledge/product-page/`
- `/knowledge/store-redesign/`

Policy:
- Preserve Article ownership on informational pages.
- Keep publication/modification dates synchronized with visible/editorial reality when content changes materially.
- Do not add fake person authors, review scores, or citation counts.

## Not implemented yet

### Service schema

Schema.org supports `Service`, but Google does not currently list a dedicated general Service rich-result feature in its supported structured-data gallery.

Decision:
- Do not mass-add Service JSON-LD merely to increase markup volume.
- Revisit only if it helps a broader entity graph or a supported search experience and can be generated consistently from real service data.
- Page copy, titles, internal linking, and hierarchy have higher priority.

### Product / Offer for Tharaa

`/tharaa/` is a real product/theme page and currently displays a price and marketplace purchase route, so Product markup may eventually be semantically appropriate.

Decision: defer.

Reasons:
- Price and commercial availability must remain synchronized with the Salla marketplace.
- Stale Offer data is worse than no Offer data.
- Product/merchant markup should be implemented only after deciding the canonical commercial data source and update process.

Do not hard-code Product/Offer structured data until that synchronization policy exists.

### LocalBusiness

Decision: do not add at this stage.

Reason:
The current site-wide configuration does not provide enough verified structured local-business data to justify a precise LocalBusiness entity. Do not infer or fabricate a Saudi street address, opening location, or storefront details simply because Saudi Arabia is the primary market.

### FAQ structured data

Decision: do not prioritize.

FAQ sections may remain useful for users, but markup should not be added merely in expectation of FAQ rich results. The user-facing FAQ content and intent coverage matter independently of rich-result eligibility.

### Review / AggregateRating

Decision: prohibited until genuine, attributable review data with an appropriate source/model exists.

Never create review counts, ratings, or testimonials as structured numerical ratings from marketing copy.

## Canonical entity identifiers

Use stable in-page IDs when connecting entities:

- `https://ibtikartech.co/#organization`
- `https://ibtikartech.co/#website`

Future structured-data nodes should reference these identifiers rather than creating disconnected duplicate Organization entities.

## Page-type matrix

| Page type | Organization | WebSite | Breadcrumb | Article | Product | Service |
| --- | --- | --- | --- | --- | --- | --- |
| Homepage | Yes | Yes | No | No | No | No |
| Services hub | Via publisher graph only when needed; no duplicate node | No duplicate | Yes | No | No | Deferred |
| Category hubs | No duplicate node | No duplicate | Yes | No | No | Deferred |
| Ecommerce specialist services | No duplicate node | No duplicate | Yes | No | No | Deferred |
| Knowledge hub | No duplicate node | No duplicate | Yes | No | No | No |
| Knowledge article | Existing org author/publisher refs/objects | No | Yes | Yes | No | No |
| Tharaa | No duplicate node | No | Not currently approved | No | Deferred | No |
| About | No duplicate global markup currently required | No | Not currently approved | No | No | No |
| Contact | No | No | No | No | No | No |

## Governance rules

1. Markup must match visible page content and real business data.
2. Never add a schema type solely because a keyword is valuable.
3. Keep canonical URLs absolute and on `https://ibtikartech.co`.
4. Avoid multiple disconnected Organization identities.
5. Keep article dates and commercial price/availability data synchronized with the page.
6. If a page becomes `noindex`, private, redirected, or removed, reconsider whether its structured data should still render.
7. When a new page is approved for indexing, decide its structured-data type from page purpose, not template convenience.
8. Rich-result eligibility is never guaranteed by adding structured data.

## Deferred verification gate

When the project owner explicitly opens the final verification stage, validate rendered structured data with the appropriate Google tools and inspect how Google sees representative URLs. That validation is intentionally not run in this implementation phase.
