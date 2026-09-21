# Ibtikar Tech — SEO Release Review

Status: Static release review complete; final verification gate pending
Review date: 2026-09-22
Branch: `seo/indexation-infrastructure`
Target: `main`
Canonical origin: `https://ibtikartech.co`

## Release rule

This document records the pre-merge review of the SEO implementation from the initial indexation infrastructure through Phase 10.

The branch must not be described as release-verified or merged solely from this static review. The repository runbook requires runtime/test verification before release. Those checks remain intentionally deferred until the project owner explicitly opens the final test gate.

## 1. Main synchronization

The SEO branch was originally created before later frontend-architecture cleanup landed on `main`.

During this review:
- the four overlapping public-template paths were reconciled against latest `main`;
- latest runtime ownership and website-category structure were preserved;
- the complete latest `main` tree was merged into the SEO branch with a real two-parent merge commit;
- the SEO branch is now based on latest `main` with no known missing main-only files.

Important architecture preserved from main:
- canonical public runtime partial ownership;
- retired duplicate CSS/JS layers remain retired;
- latest service-category family structure;
- latest websites page structure;
- existing frontend ownership contracts.

## 2. Discovery and indexation infrastructure

### Sitemap
Implemented:
- explicit XML sitemap endpoint;
- only approved canonical public routes are included;
- private, operational, legacy, parameterized, and error URLs are excluded.

The sitemap source of truth is:
`apps/core/sitemaps.py`

### Robots
Implemented:
- public crawling allowed;
- admin/control crawl exclusions retained;
- canonical sitemap advertised;
- robots.txt is not used as a substitute for noindex or authentication.

### 404
Implemented:
- explicit `/404/` returns HTTP 404;
- global Django 404 handler uses the same public template;
- page renders `noindex,follow`.

### Canonical
Reviewed and corrected:
- public canonical URLs no longer depend on the request Host;
- canonical origin is pinned to `https://ibtikartech.co`;
- query-string variants canonicalize to the clean request path;
- sitemap, breadcrumbs, organization/entity IDs, canonical links, and relative public media metadata now use the same approved origin.

## 3. Private and operational indexation policy

Implemented:
- account entrance/manage pages: `noindex,nofollow`;
- customer portal: `noindex,nofollow`;
- account-review page: `noindex,nofollow`;
- health endpoint: `X-Robots-Tag: noindex, nofollow`;
- Django/Wagtail admin retain their framework-provided robots protections;
- authentication/authorization remains the security boundary.

## 4. Wagtail governance

The public acquisition site remains Django-template-owned. Wagtail Page models are editorial candidates and the catch-all remains present.

Release review found that an arbitrary published Wagtail page could otherwise become indexable outside the approved map.

Corrected policy:
- generic Wagtail public templates now render `noindex,follow` by default;
- Wagtail pages are not automatically included in the XML sitemap;
- a future Wagtail page must explicitly pass SEO/indexation review before opting into indexing.

This keeps Wagtail publishing from silently bypassing the canonical public-site governance.

## 5. Keyword and Saudi market research

Completed qualitative research for:
- ecommerce / Salla / Zid;
- store launch;
- storefront customization;
- store redesign;
- product-page optimization;
- ecommerce SEO and measurement;
- corporate websites;
- landing pages;
- generic SEO;
- analytics/tracking;
- visual identity and brand/content;
- custom systems/API integrations;
- business automation;
- Tharaa/Salla theme intent;
- price/cost/comparison query layers.

Quantitative Search Volume, KD, CPC, and exact ranking positions remain intentionally unfilled where trustworthy data was unavailable. No values were fabricated.

Canonical strategy:
`docs/seo/SEO_KEYWORD_STRATEGY_MASTER.md`

Market evidence:
`docs/seo/SAUDI_MARKET_RESEARCH_2026.md`

## 6. Keyword-to-page ownership

Implemented one-primary-owner rules to reduce cannibalization.

Key ownership:
- broad ecommerce/store design → `/ecommerce/`;
- store creation/launch → `/services/store-launch/`;
- storefront customization → `/services/storefront-customization/`;
- store redesign → `/services/store-redesign/`;
- product page optimization → `/services/product-page-optimization/`;
- store-specific growth/measurement/SEO → `/services/ecommerce-growth/`;
- ecommerce support/maintenance → `/services/ecommerce-support/`;
- company websites → `/websites/`;
- generic SEO → `/services/seo/`;
- analytics/CRO/growth → `/growth/`;
- custom systems/integrations/automation → `/custom-systems/`;
- Tharaa/theme product intent → `/tharaa/`.

## 7. Information architecture and internal linking

Implemented:
- Home → Services → Category → Service hierarchy;
- ecommerce hub → six specialist services;
- growth hub → generic SEO service;
- knowledge articles → relevant commercial owner;
- descriptive anchor text for specialist ecommerce links;
- visible breadcrumbs aligned with the approved user path;
- structured breadcrumb trails aligned with the same IA.

No new city doorway architecture was introduced.

## 8. On-page SEO

Static source review confirms:
- every approved public page has one page title source;
- every approved public page has one visible H1;
- title/H1 intent is differentiated by page role;
- route-owned meta descriptions are centralized;
- 25 indexable public routes and the 404 route have unique centralized descriptions;
- reviewed description lengths are approximately 97–139 characters;
- no duplicate centralized descriptions were found.

The service/category child-level description blocks were removed after centralization to avoid dual ownership.

## 9. Content quality and topical support

Three new supporting articles are implemented, routed, linked, included in indexation governance, and connected to their commercial owner:

- `/knowledge/ecommerce-cost-saudi/`
- `/knowledge/website-cost-saudi/`
- `/knowledge/automation-first/`

The content intentionally explains cost/scope drivers rather than inventing price ranges.

Existing ecommerce articles continue to support:
- store launch;
- product page optimization;
- customization vs redesign decision.

## 10. Structured data and entity layer

Implemented:
- Organization on the home/entity layer;
- WebSite identity;
- BreadcrumbList for approved hierarchy paths;
- CollectionPage for the knowledge hub;
- Article for six public knowledge articles;
- shared stable Organization/WebSite IDs;
- article publisher links to the same organization entity.

Intentionally deferred:
- Product/Offer for Tharaa until price/availability can be verified as current;
- Review/AggregateRating until genuine data exists;
- LocalBusiness until sufficient verified local-business data exists;
- generic Service markup added only for markup volume.

## 11. Public frontend contracts

The release review updated the architecture contracts so they describe the new system rather than forcing old duplication:
- manifest contains SEO and the three new articles;
- template family overrides know the new pages;
- meta description ownership is centralized;
- real 404 status is reflected;
- legacy redirects are restricted to URLs that actually existed;
- explicit route contract contains the new routes;
- hero asset ownership contract includes the SEO service page.

These contract files have been updated but not executed.

## 12. Static source-of-truth congruence

Static comparison found:
- 25 approved indexable routes;
- 25 sitemap route names;
- the same 25 indexable public entries in the public manifest;
- metadata coverage for all approved public routes;
- an additional 404 metadata policy;
- no orphan new SEO service route at the registration layer.

## 13. Deferred non-blocking backlog

These items do not block crawl/indexation architecture but remain useful later:

1. Generic Open Graph completeness:
   - page-specific `og:title`;
   - `og:url`;
   - page-specific social description/image strategy where needed.
2. Quantitative keyword opportunity data:
   - Saudi search volume;
   - KD;
   - CPC;
   - GSC impressions/clicks/positions.
3. Product/Offer structured data for Tharaa once current marketplace offer data is verified.
4. Future specialist page decisions:
   - dedicated landing-page service;
   - dedicated visual-identity service;
   - ecommerce SEO specialization.
5. English/hreflang only after a real English URL/content architecture exists.

## 14. Final verification gate — NOT RUN YET

Per project-owner instruction, tests and direct runtime checks remain deferred.

Before merge/release, the required final gate should include at minimum:
- `python manage.py check`;
- `ruff check apps config tests`;
- `pytest`;
- `python manage.py makemigrations --check --dry-run`;
- rendered route checks for status/canonical/meta/robots;
- sitemap URL verification;
- private-route noindex verification;
- structured-data validation;
- browser/source verification of the new SEO and knowledge pages;
- review of GitHub Actions on the final integration commit.

Until that gate is explicitly opened and passes, the correct status is:

**Structurally reviewed and synchronized; not yet release-verified; do not merge to main.**
