# Ibtikar Tech — Internal Linking Architecture

> Canonical keyword-strategy source: `docs/seo/SEO_KEYWORD_STRATEGY_MASTER.md`
> Use this document for its specialist detail; keyword ownership and Phase 5/6 decisions are governed by the master file.

Status: v0.1 — target architecture
Market priority: Saudi Arabia first, Gulf second
Research snapshot: 2026-09-18
Depends on: `INDEXATION_MAP.md`, `KEYWORD_INTENT_MAP.md`, `ONPAGE_PAGE_BRIEFS.md`

## Purpose

This document defines how public pages should link to each other so users and crawlers can understand the hierarchy, move from broad topics to specific services, and reach the correct commercial owner without creating keyword cannibalization.

Internal links are a navigation and information-architecture tool first. They must be useful in context, crawlable as normal HTML links, and use descriptive natural anchor text. Do not create footer link farms, hidden links, or repetitive exact-match anchor patterns solely for ranking.

## Core topology

`Homepage → Services hub → Category hub → Specialist service → Relevant knowledge / sibling service → Contact`

Knowledge content follows the reverse commercial-support path:

`Knowledge hub → Informational article → Primary commercial owner`

This creates a clear distinction between broad discovery, commercial service intent, and informational intent.

---

## 1. Homepage linking policy

### Required destinations

The homepage should expose clear crawlable links to:

- `/services/` — services overview.
- `/ecommerce/` — ecommerce solutions.
- `/websites/` — websites and landing pages.
- `/brand-content/` — brand and content.
- `/growth/` — visibility, measurement, and growth.
- `/custom-systems/` — custom systems, integrations, and automation.
- `/tharaa/` — Tharaa theme where the product is presented as a distinct offer.
- `/portfolio/` and `/knowledge/` where proof and learning are contextually presented.

### Anchor guidance

Prefer natural labels such as:

- `حلول المتاجر الإلكترونية`
- `تصميم وتطوير المواقع`
- `الهوية والمحتوى`
- `الظهور والقياس والنمو`
- `الأنظمة والربط والأتمتة`

Do not turn the homepage into a list of repetitive keyword anchors such as `أفضل شركة تصميم مواقع في السعودية` across multiple sections.

---

## 2. Services hub `/services/`

### Role

Navigation hub, not a substitute for category landing pages.

### Required category links

- `/ecommerce/`
- `/websites/`
- `/brand-content/`
- `/growth/`
- `/custom-systems/`

### Rule

Each category should have one prominent descriptive HTML link. Additional links are acceptable only when they serve a user decision point; do not repeat the same category anchor throughout the page solely for SEO.

---

## 3. Ecommerce cluster

### Hub: `/ecommerce/`

This is the parent owner of broad ecommerce design/development intent.

It should link directly and descriptively to all six specialist services:

| Target | Recommended contextual anchor family |
| --- | --- |
| `/services/store-launch/` | `إنشاء وإطلاق متجر إلكتروني`, `إطلاق متجر جديد` |
| `/services/storefront-customization/` | `تخصيص واجهة المتجر`, `تخصيص متجر قائم` |
| `/services/store-redesign/` | `إعادة تصميم متجر قائم`, `إعادة تصميم المتجر` |
| `/services/product-page-optimization/` | `تحسين صفحة المنتج`, `تطوير تجربة صفحة المنتج` |
| `/services/ecommerce-growth/` | `قياس ونمو المتجر`, `القياس وSEO والتكاملات للمتجر` |
| `/services/ecommerce-support/` | `الدعم والتطوير المستمر`, `دعم المتجر بعد الإطلاق` |

The hub should not use the same broad anchor `تصميم متجر سلة` for all child pages.

### Specialist-page return links

Every ecommerce specialist page should include at least one contextual path back to `/ecommerce/`, preferably through breadcrumb/category navigation or a related-solutions section.

Recommended category anchor: `حلول المتاجر الإلكترونية`.

### Contextual sibling links

Do not link every specialist page to every other specialist service. Link only when the next decision is plausible.

#### `/services/store-launch/`

Contextual next steps:
- `/services/ecommerce-growth/` — after a store is launched and measurement/growth becomes relevant.
- `/services/ecommerce-support/` — ongoing support after launch.
- `/knowledge/store-launch/` — educational launch checklist where helpful.

Avoid presenting redesign as the normal next step for a new store.

#### `/services/storefront-customization/`

Contextual next steps:
- `/services/store-redesign/` — when the problem is broader than visual customization.
- `/services/product-page-optimization/` — when the issue is concentrated on product pages.
- `/knowledge/store-redesign/` — comparison/decision article.

#### `/services/store-redesign/`

Contextual next steps:
- `/services/storefront-customization/` — when a smaller intervention is enough.
- `/services/product-page-optimization/` — when the product page is the main friction point.
- `/knowledge/store-redesign/` — comparison article.
- `/services/ecommerce-growth/` — once the redesigned experience is ready for measurement/optimization.

#### `/services/product-page-optimization/`

Contextual next steps:
- `/knowledge/product-page/` — informational support.
- `/services/store-redesign/` — when problems extend across the whole store.
- `/services/ecommerce-growth/` — when behavior needs measurement and prioritization.

#### `/services/ecommerce-growth/`

Contextual next steps:
- `/services/product-page-optimization/` — when measurement identifies product-page friction.
- `/services/store-redesign/` — when structural UX problems are broader.
- `/growth/` — when the need expands beyond ecommerce-specific measurement.

Do not use this page as the internal-link destination for generic SEO intent once a dedicated SEO page is approved.

#### `/services/ecommerce-support/`

Contextual next steps:
- `/services/store-redesign/` — changes that exceed support scope.
- `/services/ecommerce-growth/` — measurement-led improvement backlog.
- `/ecommerce/` — return to full commerce-service map.

---

## 4. Website cluster `/websites/`

### Primary relationships

Use contextual links to:

- `/brand-content/` when the website problem is positioning, identity, or messaging.
- `/growth/` when the need is technical visibility, measurement, tracking, or CRO.
- `/custom-systems/` when the requested experience requires operational workflows, customer portals, dashboards, or deeper custom functionality.
- `/contact/` for the commercial next step.

### Landing-page intent

Until a dedicated landing-page service is approved, keep landing-page intent inside `/websites/` and avoid creating internal anchors that imply a nonexistent dedicated URL.

If a dedicated landing-page page is later approved, update internal links directly to that canonical page rather than routing users through redirects.

---

## 5. Brand and content cluster `/brand-content/`

### Primary relationships

Link contextually to:

- `/websites/` when brand identity/messaging is being applied to a corporate website or landing experience.
- `/ecommerce/` when identity/content is being applied to an ecommerce storefront.
- `/growth/` when content must be mapped to search intent or measured after publication.
- `/contact/` for project qualification.

### Visual-identity candidate

Do not create links to a dedicated visual-identity URL until that page is approved. The existing hub remains the current owner.

---

## 6. Growth cluster `/growth/`

### Primary relationships

Link contextually to:

- `/websites/` for site/landing-page implementation needs.
- `/ecommerce/` and `/services/ecommerce-growth/` for ecommerce-specific measurement and SEO work.
- `/custom-systems/` when analytics or operational data requires integrations/automation.
- `/knowledge/` and future SEO educational content where it supports the user decision.

### Generic SEO rule

The dedicated generic SEO page is implemented at `/services/seo/`.

Current linking rule:
- `/growth/` links to `/services/seo/` for generic SEO commercial intent;
- `/services/ecommerce-growth/` keeps ecommerce-specific SEO and measurement intent;
- future SEO educational articles should link to `/services/seo/`;
- generic SEO anchors should not be split between Growth and ecommerce-growth.

---

## 7. Custom systems cluster `/custom-systems/`

### Primary relationships

Link contextually to:

- `/websites/` when the requirement is primarily a marketing/content interface rather than an operational system.
- `/growth/` when integrations are needed for measurement, reporting, or event flows.
- `/contact/` for process diagnosis and scope qualification.

### Internal anchor families

Natural variants may include:
- `تطوير نظام مخصص`
- `ربط الأنظمة`
- `أتمتة العمليات`
- `تكاملات API`

Avoid repeating all variants in every section.

---

## 8. Tharaa `/tharaa/`

### Role

Standalone Salla-theme product page.

### Appropriate internal relationships

- Link to `/ecommerce/` only when explaining broader store services beyond the theme.
- Link to `/services/storefront-customization/` if the user needs customization beyond the theme’s standard settings.
- Link to `/services/ecommerce-support/` only when a real ongoing-support proposition is relevant.

The marketplace purchase CTA and demo remain the primary transaction paths.

### Guardrail

Do not use generic anchors such as `تصميم متجر سلة` repeatedly from Tharaa to service pages. Theme-product intent and agency-service intent must remain distinct.

---

## 9. Knowledge cluster

### `/knowledge/`

Acts as the editorial hub and should link to every published article with descriptive article titles or concise descriptive anchors.

### `/knowledge/store-launch/`

Primary commercial support link:
- `/services/store-launch/` — `خدمة إنشاء وإطلاق متجر إلكتروني` or an equivalent natural phrase.

Secondary contextual links may point to ecommerce hub or product-page article where genuinely useful.

### `/knowledge/product-page/`

Primary commercial support link:
- `/services/product-page-optimization/` — `خدمة تحسين صفحة المنتج`.

Contextual related links:
- `/services/store-redesign/` when issues extend beyond the product page.
- `/services/ecommerce-growth/` when measurement is the next step.

### `/knowledge/store-redesign/`

The article is intentionally a comparison page and should link to both:
- `/services/storefront-customization/`
- `/services/store-redesign/`

Use distinct anchors that preserve the decision:
- `خدمة تخصيص واجهة المتجر`
- `خدمة إعادة تصميم المتجر`

Do not make one of the two look artificially dominant unless the surrounding content clearly recommends it for a specific situation.

---

## 10. About, portfolio, and contact

### `/about/`

Use links to major service hubs only when describing actual capabilities or the company’s operating model. Do not make the page a secondary keyword landing page.

### `/portfolio/`

Project/case-study items should link to the service/category that genuinely produced that work when the relationship is clear. Avoid linking every portfolio item to every service.

### `/contact/`

This is a conversion endpoint, not an SEO hub. Links back to relevant service/category pages may help recovery/navigation, but the page should not be used to distribute large amounts of keyword-rich anchor text.

---

## 11. Breadcrumb architecture

Visible breadcrumb hierarchy should reflect the real information architecture:

- Home → Services → Ecommerce → Specialist service
- Home → Services → Websites
- Home → Services → Brand & Content
- Home → Services → Growth
- Home → Services → Custom Systems
- Home → Knowledge → Article

Where a visible breadcrumb already exists, structured `BreadcrumbList` can mirror that hierarchy in the structured-data implementation stage.

Do not invent a breadcrumb path that is not represented in the user-facing information architecture solely for search engines.

---

## 12. Anchor-text rules

Use anchors that tell users what the destination is without needing surrounding context.

Good patterns:
- `تحسين صفحة المنتج`
- `إعادة تصميم المتجر`
- `حلول المتاجر الإلكترونية`
- `تصميم وتطوير المواقع`
- `الأنظمة والربط والأتمتة`

Avoid:
- repeated exact-match keyword anchors across many unrelated sections;
- `اضغط هنا` when a descriptive destination label is practical;
- hidden links or links styled as invisible content;
- raw URL anchors when a meaningful label is available;
- linking every page to every other page;
- footer/sitewide keyword lists created only for ranking.

Anchor variety should emerge naturally from context rather than from artificial synonym rotation.

---

## 13. Crawlability rules for internal links

- Prefer normal HTML `<a href="...">` links for important navigation and contextual relationships.
- Link directly to canonical clean URLs, not legacy `.html` redirects.
- Do not intentionally route internal links through tracking redirects.
- Query parameters may be used on conversion links such as contact attribution, but indexable content links should point to the clean canonical destination whenever possible.
- When a URL changes in the future, update internal links to the new URL instead of relying indefinitely on redirect hops.

---

## 14. Minimum linking contract for new public pages

Before a future public page becomes indexable and is added to the sitemap, it should normally have:

1. At least one crawlable internal link from a relevant indexed parent/hub or strongly related page.
2. A logical return path to its parent/category where appropriate.
3. Contextual links to closely related pages only where useful.
4. A clear relationship to its keyword/intent owner in `KEYWORD_INTENT_MAP.md`.
5. No dependence on footer-only discovery.
6. No internal links pointing at its legacy/redirect URL.

This is an architecture contract, not a numeric ranking formula.

---

## 15. Implementation priority

### P1 — preserve and formalize
- Services hub → five category hubs.
- Ecommerce hub → six specialist services.
- Knowledge articles → correct commercial owners.
- Specialist services → ecommerce parent and contextually relevant sibling/knowledge pages.

### P2 — strengthen
- Website ↔ brand/growth/custom-systems relationships.
- Growth ↔ ecommerce/custom-systems relationships.
- Tharaa → broader services only at real decision points.
- Portfolio → relevant services when project evidence supports the relationship.

### P3 — future architecture
- Dedicated general SEO page linking.
- Dedicated landing-page page linking.
- Dedicated visual-identity page linking.
- Any future ecommerce-SEO specialization.

These future paths must not be linked until the pages are approved and exist.

---

## Implementation note

This document defines the target linking graph. Exact per-template insertions should be made through a safe patch/local-repository workflow because several public templates are long and the current GitHub file replacement interface cannot safely patch truncated file bodies.

No runtime/browser/test verification is part of this step; that remains deferred to the final verification gate by project instruction.


## SEO specialist `/services/seo/`

### Parent
- `/growth/` — anchor family: `تحسين محركات البحث SEO`, `خدمات SEO`.

### Related implementation paths
- `/websites/` when technical/content findings require site changes.
- `/ecommerce/` and `/services/ecommerce-growth/` for store-specific SEO.
- `/custom-systems/` only when measurement or data integrations require system work.

### Future supporting content
- technical SEO / indexing guides;
- keyword research and search-intent guides;
- SEO pricing and provider-selection guides.

Do not route generic SEO commercial anchors back to `/growth/` now that a dedicated owner exists.
