# Ibtikar Tech — SEO Phases 7–10 Implementation

Status: Implemented on branch `seo/indexation-infrastructure`
Date: 2026-09-18
Scope: Phase 7 Information Architecture, Phase 8 On-Page SEO, Phase 9 Content Quality / Topical Clusters, Phase 10 Structured Data / Entity SEO

No runtime/browser/automated tests were executed in this phase by project instruction. This report records implementation and static code review only.

---

# Phase 7 — Information Architecture

## Objective

Turn the Phase 5–6 keyword ownership model into a crawlable, user-facing architecture.

## Implemented

### 1. Category hierarchy preserved

Primary structure:

- Home
  - Services
    - Ecommerce
      - Store Launch
      - Storefront Customization
      - Store Redesign
      - Product Page Optimization
      - Ecommerce Growth
      - Ecommerce Support
    - Websites
    - Brand & Content
    - Growth
      - SEO
    - Custom Systems
  - Tharaa
  - Knowledge

### 2. SEO architecture gap closed

New canonical commercial owner:

`/services/seo/`

Parent:
`/growth/`

Reason:
Generic SEO intent had no clean owner. Growth mixed SEO, analytics, tracking, CRO, and reporting; ecommerce-growth was store-specific.

The new page now owns generic commercial SEO intent while:
- Growth remains the broader measurement/growth hub.
- Ecommerce Growth remains ecommerce-specific SEO/measurement.
- Future SEO articles will support the SEO page.

### 3. Service breadcrumb family generalized

`service_detail_base.html` previously hardcoded the Ecommerce parent.

A reusable `service_breadcrumb_parent` block now allows:
- ecommerce services → Ecommerce parent by default;
- SEO → Growth parent.

This prevents duplicate service-detail templates.

### 4. Crawlable descriptive internal links improved

Ecommerce service cards now use descriptive anchors instead of repeated generic `ناقش احتياجك`.

Examples:
- استكشف إنشاء وإطلاق المتجر
- استكشف تخصيص واجهة المتجر
- استكشف إعادة تصميم المتجر
- استكشف تحسين صفحة المنتج
- استكشف قياس ونمو المتجر
- استكشف دعم وصيانة المتجر

Category breadcrumbs on Ecommerce, Brand, Growth, and Custom Systems now link back to the Services hub.

Growth now links generic SEO paths/cards to `/services/seo/`.

### 5. Internal-link governance updated

Updated:
- `docs/seo/INTERNAL_LINKING_MAP.md`
- `docs/seo/KEYWORD_TO_PAGE_MAP.md`
- `docs/seo/SEO_KEYWORD_STRATEGY_MASTER.md`

---

# Phase 8 — On-Page SEO

## Objective

Align each strong page owner with its assigned search intent without redesigning page composition or stuffing keywords.

## Implemented page-level changes

### Ecommerce hub

Title:
`تصميم وتطوير المتاجر الإلكترونية على سلة وزد | ابتكار تك`

H1:
`تصميم وتطوير متجر إلكتروني. من الإطلاق إلى التحسين.`

Role:
Broad owner for ecommerce design/development, including the ambiguous broad phrase `تصميم متجر سلة`.

Removed the previous unsupported outcome-style phrase `مبيعاتك تتضاعف`.

### Store Launch

Title:
`إنشاء وإطلاق متجر إلكتروني على سلة وزد | ابتكار تك`

H1 explicitly includes:
`إنشاء وإطلاق متجر إلكتروني`

Role:
Transactional new-store intent.

### Storefront Customization

Title:
`تخصيص واجهة متجر سلة وزد | ابتكار تك`

H1 explicitly distinguishes customization from unnecessary rebuilding.

Role:
Interface/theme customization for an existing store.

### Store Redesign

Title:
`إعادة تصميم متجر إلكتروني قائم | ابتكار تك`

H1 aligns with existing-store redesign and diagnosis.

### Product Page Optimization

Title:
`تحسين صفحة المنتج للمتاجر الإلكترونية | ابتكار تك`

Role:
Only commercial owner of product-page improvement.

### Ecommerce Support

Title:
`دعم وصيانة المتاجر الإلكترونية | ابتكار تك`

H1 now aligns with support/maintenance intent.

### Websites

H1:
`تصميم وتطوير مواقع الشركات. وصفحات هبوط حول قرار واضح.`

The page remains the current owner of corporate-site intent and interim owner of landing-page intent.

### Custom Systems

Title:
`تطوير الأنظمة المخصصة والربط والأتمتة | ابتكار تك`

H1:
`تطوير أنظمة مخصصة وربط وأتمتة. تبدأ من العملية قبل التقنية.`

Role:
Custom systems, integration, and business automation.

### SEO

New dedicated Title:
`خدمات تحسين محركات البحث SEO في السعودية | ابتكار تك`

H1:
`تحسين محركات البحث SEO. من الفهرسة إلى نية البحث والقياس.`

Scope includes:
- Technical SEO
- Keyword & Intent Research
- Keyword-to-Page Map
- Information Architecture
- On-page SEO
- Content System
- Structured Data
- Measurement / experiments

The page explicitly avoids ranking guarantees and manipulative link tactics.

## Metadata architecture cleanup

Problem found:
Public templates and the shared document head could render duplicate meta descriptions.

Resolution:
`apps/public_preview/metadata.py` is now the single route-owned source for public meta descriptions.

Removed:
- duplicate page-level `meta name="description"` tags;
- obsolete `category_meta_description` blocks;
- obsolete `service_meta_description` blocks.

Benefits:
- one description per canonical route;
- less drift between template copy and metadata;
- easier future auditing/change control.

---

# Phase 9 — Content Quality and Topical Clusters

## Objective

Build people-first supporting content around real decision intent instead of publishing many generic keyword articles.

## Existing cluster preserved

Ecommerce:
- store launch guide
- product-page guide
- customization vs redesign comparison

## Three new implemented decision articles

### 1. Ecommerce cost

URL:
`/knowledge/ecommerce-cost-saudi/`

Topic:
`تكلفة إنشاء متجر إلكتروني في السعودية: ما الذي يحدد السعر؟`

Purpose:
Commercial investigation.

It does not fabricate price ranges. It explains:
- platform;
- product complexity;
- content;
- customization;
- integrations;
- measurement;
- QA;
- commonly forgotten external costs;
- what to include in a comparable quote request.

Commercial parent:
`/services/store-launch/`

### 2. Corporate website cost

URL:
`/knowledge/website-cost-saudi/`

Topic:
`تكلفة تصميم موقع شركة في السعودية: ما الذي يحدد النطاق؟`

Covers:
- information architecture;
- copy/content;
- design;
- CMS;
- integrations;
- performance/accessibility;
- SEO/measurement;
- bilingual scope;
- quote requirements.

Commercial parent:
`/websites/`

### 3. Automation-first guide

URL:
`/knowledge/automation-first/`

Topic:
`ما الذي يجب أتمتته أولًا؟`

Covers:
- repetition;
- rule clarity;
- data availability;
- exceptions;
- human review;
- measurable impact;
- integration vs automation vs dashboard vs custom system.

Commercial parent:
`/custom-systems/`

## Knowledge hub updated

`/knowledge/` now links to all six articles and includes new filters for:
- Websites
- Systems

New pages were added to:
- public URL routes;
- Django views;
- canonical metadata;
- breadcrumb map;
- XML sitemap source;
- indexation map;
- keyword-to-page map.

This prevents orphan content.

## Content quality rules retained

No article should exist only because a keyword exists.

New content should:
- solve a real decision;
- add Ibtikar process/experience;
- distinguish information from sales intent;
- avoid invented prices/results/statistics;
- link to the correct commercial owner.

---

# Phase 10 — Structured Data and Entity SEO

## Objective

Use structured data where it matches visible content and creates a consistent entity graph.

## Organization

Home page contains `Organization` with:
- stable `@id` ending in `#organization`;
- organization name;
- English alternate name;
- canonical URL;
- dynamic logo URL from SiteSettings when available;
- email when available;
- telephone when available;
- social profiles through `sameAs`.

Organization data remains on the home page rather than being duplicated across every page.

## WebSite

Home page includes `WebSite` with:
- stable `@id` ending in `#website`;
- Arabic/English names;
- publisher relationship to Organization;
- `ar-SA` language.

## BreadcrumbList

Breadcrumb structured data is centrally generated from the approved information architecture.

It exists for:
- Services
- Category hubs
- Ecommerce specialists
- SEO
- Knowledge
- all published knowledge articles

Breadcrumb trails represent the user-facing hierarchy rather than mechanically copying URL segments.

## Article

All six knowledge articles include Article structured data.

Entity consistency was improved:
- visible author represented as `فريق ابتكار تك`;
- author URL points to `/about/`;
- publisher references the same Organization entity ID;
- `isPartOf` references the same WebSite entity ID;
- mainEntityOfPage uses each canonical article URL.

## CollectionPage

Knowledge hub contains CollectionPage structured data linked to the same WebSite and Organization IDs.

## Tharaa Product/Offer decision

Product/Offer structured data was deliberately not added in this phase.

Reason:
The Salla marketplace page confirms the Tharaa listing exists, but the current research interface did not expose a verifiable current price/availability state from the listing itself.

A hardcoded Offer may become inconsistent if marketplace price or availability changes.

Future rule:
Add Product/Offer only when price/availability can be sourced dynamically or reliably kept synchronized with the visible page and marketplace state.

## Service schema decision

A generic schema.org `Service` block was not added solely for ranking.

Reason:
The implementation prioritizes Google-supported or clearly useful structured data and avoids markup that adds maintenance cost without a defined Search feature or entity need.

---

# Files materially changed in Phases 7–10

Architecture / routing:
- `apps/services/urls.py`
- `apps/services/public_views.py`
- `apps/public_preview/urls.py`
- `apps/public_preview/views.py`
- `apps/core/sitemaps.py`
- `apps/core/seo_context.py`

Metadata / entity:
- `apps/public_preview/metadata.py`
- `apps/content/site_config.py`
- `templates/public_preview/components/site_structured_data.html`
- `templates/public_preview/components/breadcrumb_structured_data.html`

Service pages:
- ecommerce
- store launch
- storefront customization
- store redesign
- product page optimization
- ecommerce support
- websites
- growth
- custom systems
- SEO

Knowledge:
- knowledge hub
- three existing articles
- three new articles

SEO governance:
- Indexation Map
- Internal Linking Map
- Keyword-to-Page Map
- On-Page Page Briefs
- SEO Keyword Strategy Master

---

# Deferred verification gate

By explicit project instruction, these have not been run yet:
- Django tests;
- browser rendering checks;
- Rich Results Test;
- Lighthouse/PageSpeed;
- Search Console URL Inspection;
- sitemap submission;
- live canonical/header checks.

They remain for the final verification phase when explicitly requested.
