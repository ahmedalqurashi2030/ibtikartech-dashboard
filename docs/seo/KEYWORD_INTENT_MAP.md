# Ibtikar Tech — Keyword & Search Intent Map

Status: v0.1 — qualitative Saudi SERP / intent map
Market priority: Saudi Arabia first, Gulf second
Research snapshot: 2026-09-18
Canonical site: `https://ibtikartech.co`

> Quantitative fields such as monthly search volume, keyword difficulty, and CPC are intentionally not populated in this version. Semrush API units were unavailable during this research pass. No numerical SEO metric is inferred or fabricated.

## Purpose

This document assigns one primary search-intent owner to each important keyword cluster before page-level SEO changes are made. Its purpose is to prevent cannibalization, keep service pages aligned with commercial intent, and separate informational content from transactional pages.

The map is a decision layer, not permission to create pages automatically. New-page candidates must be validated against demand, business priority, service readiness, and future Semrush/GSC data before implementation.

## Decision rules

1. One primary search-intent cluster should have one canonical page owner.
2. Broad ambiguous terms belong to the strongest hub unless a dedicated page clearly satisfies the intent better.
3. Service pages own transactional/commercial intent; articles own informational/comparison intent.
4. Do not make an article compete with a service page for the same primary commercial query.
5. A page may support secondary variants, but it should not become the primary owner of several unrelated intents.
6. Platform modifiers such as `سلة`, `زد`, `Shopify`, and `WooCommerce` should be used only where the service actually supports those platforms.
7. Geographic modifiers such as `السعودية`, `الرياض`, or `جدة` must not be multiplied into thin city pages without a genuine local proposition and evidence.
8. No new page is created solely because a keyword phrase exists.

---

## Tier 1 — Core commercial clusters

| Cluster / query theme | Intent | Current owner | Fit | Cannibalization risk | Decision |
| --- | --- | --- | --- | --- | --- |
| شركة حلول رقمية في السعودية / حلول رقمية للشركات | Commercial / brand discovery | `/` | Strong | Medium with `/services/` | Keep homepage as broad company-level owner. Do not make `/services/` compete for the same primary phrase. |
| خدمات رقمية للشركات / خدمات ابتكار تك | Commercial / navigational hub | `/services/` | Strong as hub | Medium with homepage | Keep as service-navigation hub; use category language rather than repeating the homepage company query. |
| حلول المتاجر الإلكترونية / تصميم وتطوير متاجر إلكترونية | Commercial category | `/ecommerce/` | Strong | High with store-launch/customization if wording is uncontrolled | Keep `/ecommerce/` as broad ecommerce owner and route modifiers to specialist pages. |
| إنشاء متجر إلكتروني / إطلاق متجر إلكتروني / إنشاء متجر سلة / إنشاء متجر زد | Transactional | `/services/store-launch/` | Strong | Medium with `/ecommerce/` | Primary owner for build-from-scratch and launch intent. Expand platform-specific proof and scope without creating duplicate platform pages yet. |
| تصميم متجر سلة / تصميم متجر زد | Commercial, broad and ambiguous | `/ecommerce/` | Strongest hub | High | Broad term belongs to ecommerce hub. Specialist pages target narrower modifiers such as launch, interface customization, or redesign. |
| تخصيص متجر سلة / تخصيص واجهة متجر سلة / تصميم واجهة متجر سلة | Transactional | `/services/storefront-customization/` | Strong | High with broad “تصميم متجر سلة” | Keep page focused on an existing store/theme and interface customization. Avoid claiming generic store-build intent. |
| إعادة تصميم متجر سلة / إعادة تصميم متجر إلكتروني / تطوير متجر قائم | Transactional | `/services/store-redesign/` | Strong | Medium with customization | Keep. Explicitly contrast redesign vs customization in copy and internal links. |
| تحسين صفحة المنتج / تصميم صفحة المنتج / تحسين صفحة المنتج في سلة | Commercial problem/solution | `/services/product-page-optimization/` | Strong | Medium with redesign and CRO | Keep as the only commercial owner of product-page improvement. |
| دعم متجر إلكتروني / صيانة متجر سلة / تطوير مستمر للمتجر | Transactional / retention | `/services/ecommerce-support/` | Strong offer fit; demand not quantified | Low | Keep as specialist service. Prioritize after higher-demand acquisition clusters unless GSC/Semrush proves demand. |
| تصميم مواقع في السعودية / شركة تصميم مواقع / تصميم موقع شركة | Transactional | `/websites/` | Strong | Low | High-priority existing page. Reposition title/H1 later around commercial search language while preserving UX proposition. |
| تصميم صفحة هبوط / تصميم Landing Page في السعودية | Transactional | `/websites/` interim | Partial | Medium | Current page contains a real landing-page offer, but SERPs show dedicated landing-page service pages. Treat a dedicated `/services/landing-pages/` as a validation candidate, not an automatic build. |
| تصميم هوية بصرية / تصميم هوية تجارية / شركة تصميم هوية بصرية | Transactional | `/brand-content/` interim | Partial-to-strong | Medium | Page contains a complete identity offer but mixes strategy/content/identity. Candidate for a dedicated visual-identity page after quantitative validation. |
| تطوير أنظمة مخصصة / برمجة أنظمة مخصصة | Transactional B2B | `/custom-systems/` | Strong | Medium with automation | Keep on current hub for now. Strengthen explicit “custom systems” wording before considering a split. |
| أتمتة الأعمال / أتمتة العمليات / ربط الأنظمة / تكامل API | Transactional B2B | `/custom-systems/` | Strong | Medium inside same hub | Keep as core current cluster; page content already aligns with process-first automation and integrations. Split only if demand and sales data justify separate landing pages. |
| شركة تحسين محركات البحث في السعودية / خدمات SEO السعودية / تحسين محركات البحث | Transactional | No dedicated owner | Gap | High between `/growth/` and ecommerce-growth | Create a dedicated SEO service-page candidate after validation. Do not force generic SEO intent onto the broad growth hub. |
| سيو المتاجر الإلكترونية / سيو سلة / سيو زد | Transactional ecommerce SEO | `/services/ecommerce-growth/` interim | Partial | High with future general SEO page and `/growth/` | Current page includes SEO + tracking + integrations, so it is not a pure SEO landing page. Maintain as interim owner only; evaluate a dedicated ecommerce-SEO page when quantitative demand is available. |
| ثيم سلة / قالب سلة / ثيم سلة للعطور والعناية والهدايا | Transactional product | `/tharaa/` | Strong | High if mixed with store-design services | Keep Tharaa focused on theme/product intent, not generic “تصميم متجر سلة”. Brand query `ثيم ثراء` also belongs here. |

---

## Tier 2 — Supporting commercial / specialist clusters

| Cluster / query theme | Intent | Owner | Fit | Decision |
| --- | --- | --- | --- | --- |
| تحسين التحويل CRO / تحسين معدل التحويل | Commercial specialist | `/growth/` interim | Partial | Growth hub contains CRO, but a dedicated CRO page should wait for demand and case-study readiness. |
| إعداد GA4 / تتبع التحويلات / قياس أداء الموقع | Commercial specialist | `/growth/` | Strong as hub | Keep measurement/tracking cluster here unless service volume justifies separate pages. |
| قياس أداء المتجر / تتبع متجر سلة / تحليلات متجر إلكتروني | Commercial ecommerce specialist | `/services/ecommerce-growth/` | Strong | Keep; distinguish clearly from generic site analytics. |
| تصميم نظام واجهات / Design System للعلامة | Commercial specialist | `/brand-content/` | Strong content fit | Secondary cluster only; do not make it the page’s primary SEO target. |
| كتابة محتوى موقع / كتابة صفحات خدمات / محتوى متجر | Commercial specialist | `/brand-content/` | Strong content fit | Secondary cluster. A copywriting page can be evaluated later only if it becomes a real standalone offer. |
| بوابة عملاء مخصصة / لوحة تشغيل مخصصة | Transactional B2B | `/custom-systems/` | Strong | Secondary long-tail cluster supported by existing offer. |
| تطوير تطبيق جوال مخصص | Transactional | `/custom-systems/` interim | Partial | Current page explicitly offers apps only when justified. Do not target broad app-development terms aggressively until service positioning is strengthened. |

---

## Tier 3 — Informational intent and knowledge pages

| Informational cluster | Owner | Relationship to commercial page | Rule |
| --- | --- | --- | --- |
| خطوات إطلاق متجر إلكتروني / كيف أطلق متجرًا / قائمة تجهيز متجر قبل الإطلاق | `/knowledge/store-launch/` | Supports `/services/store-launch/` | Article owns how-to/checklist intent; service page owns hiring/build intent. |
| كيفية تحسين صفحة المنتج / عناصر صفحة المنتج / ترتيب صفحة المنتج | `/knowledge/product-page/` | Supports `/services/product-page-optimization/` | Article educates; service page owns commercial improvement intent. |
| تخصيص الواجهة أم إعادة تصميم المتجر / متى أعيد تصميم متجري | `/knowledge/store-redesign/` | Supports customization + redesign services | Article owns comparison/decision intent and should link to both service paths. |
| سلة أم زد / اختيار منصة متجر إلكتروني | Future knowledge candidate | Supports store launch | Do not create until content roadmap stage; informational comparison must remain neutral and useful. |
| كيف تختار شركة تصميم مواقع / تكلفة موقع شركة | Future knowledge candidate | Supports `/websites/` | Candidate after commercial page is optimized. |
| ما هي الهوية البصرية / مكونات دليل الهوية | Future knowledge candidate | Supports brand/identity offer | Candidate after identity target-page decision. |
| أتمتة الأعمال: ما الذي يجب أتمتته أولًا | Future knowledge candidate | Supports `/custom-systems/` | Strong topical fit because current offer starts from process diagnosis. |
| ما هو SEO التقني / لماذا صفحاتي غير مفهرسة | Future knowledge candidate | Supports future SEO service page | Do not build the cluster before the commercial SEO owner is decided. |

---

## Pages that should not be assigned acquisition keywords

| URL | Role |
| --- | --- |
| `/about/` | Entity/company trust; primarily brand and due-diligence intent. |
| `/contact/` | Conversion destination; do not force a standalone acquisition keyword onto it. |
| `/portfolio/` | Proof and branded research; optimize around project evidence, not a generic service keyword. |
| `/knowledge/` | Editorial hub; supports discovery and topic navigation rather than one commercial keyword. |

---

## Current gaps that require validation before implementation

### 1. Dedicated SEO service page — High-priority candidate

Saudi SERPs for queries such as `شركة تحسين محركات البحث في السعودية`, `خدمات SEO السعودية`, and `شركة سيو` are dominated by dedicated SEO landing pages rather than broad “growth” hubs. The current `/growth/` page mixes SEO, analytics, tracking, CRO, and reporting, while `/services/ecommerce-growth/` mixes SEO with measurement and integrations.

Decision: treat a dedicated SEO page as the strongest current architecture candidate. Final URL and scope should be decided after quantitative validation and service-definition review. Possible architecture direction: one general SEO service page first, with ecommerce SEO as a later child only if demand and delivery maturity justify it.

### 2. Dedicated landing-page service — Medium/high candidate

The current `/websites/` page genuinely includes landing pages, but current Saudi SERPs frequently expose dedicated landing-page services around campaign conversion intent.

Decision: keep `/websites/` as interim owner. Validate volume/KD/CPC and sales relevance before creating `/services/landing-pages/`.

### 3. Dedicated visual-identity service — Medium/high candidate

The current `/brand-content/` page has a complete visual-identity offer, but its page intent is broader: positioning + visual identity + design system + web copy + commerce copy + campaign assets. Saudi SERPs for `تصميم هوية بصرية` commonly use dedicated service pages.

Decision: keep the current page as interim owner; evaluate a dedicated visual-identity page after quantitative validation.

### 4. Ecommerce SEO specialization — Medium candidate

`/services/ecommerce-growth/` is a valid interim owner for ecommerce SEO but not a pure SEO page. Dedicated Salla/Zid SEO competitors exist.

Decision: do not create separate `Salla SEO` and `Zid SEO` pages yet. First validate whether one `SEO للمتاجر الإلكترونية` page is justified; platform-specific children come only after data proves distinct demand and the service can deliver platform-specific depth.

---

## Cannibalization guardrails

### `تصميم متجر سلة`

Primary owner: `/ecommerce/`.

Use narrower modifiers elsewhere:
- New store / build / launch → `/services/store-launch/`
- Interface/theme customization → `/services/storefront-customization/`
- Existing-store redesign → `/services/store-redesign/`
- Product-page problem → `/services/product-page-optimization/`

Do not optimize all four pages around the exact same primary phrase.

### `SEO / تحسين محركات البحث`

Do not make `/growth/` and `/services/ecommerce-growth/` both primary owners of generic SEO terms.

Interim rule:
- General SEO → unresolved gap / future dedicated SEO page.
- Ecommerce-specific SEO → `/services/ecommerce-growth/` as interim owner.
- Growth/measurement/CRO → `/growth/`.

### `صفحة هبوط`

Interim owner: `/websites/`.

Do not target `/services/product-page-optimization/` for generic landing-page design; product-page optimization is a commerce-product intent, not a generic campaign landing-page service.

### `ثيم سلة` vs `تصميم متجر سلة`

- Theme/product intent → `/tharaa/`.
- Store service intent → ecommerce hub and service pages.

Tharaa should not be expanded into generic agency/service phrases that would make it compete with ecommerce services.

---

## Existing-page actions before creating new URLs

### `/`
- Keep broad company-level proposition.
- Later reinforce Saudi relevance, entity signals, and clear links to category hubs.
- Avoid stuffing every service keyword into title/H1.

### `/ecommerce/`
- Preserve it as the broad ecommerce intent owner.
- Later make the relationship between “design/build” and the specialist subservices explicit in title/H1/body/internal links.
- Use platform terms naturally where supported.

### `/websites/`
- Strong current fit for `تصميم مواقع` and `تصميم موقع شركة`.
- Later make commercial service language more explicit in title/H1 without losing the current decision-led UX.
- Keep landing-page content visible while dedicated-page validation is pending.

### `/brand-content/`
- Keep identity + brand/content hub positioning.
- Strengthen explicit visual-identity terms in the relevant section, not across every section.
- Do not split until quantitative validation.

### `/growth/`
- Keep as growth/measurement/visibility hub.
- Do not try to make it the definitive generic SEO landing page.
- Link prominently to a future dedicated SEO page only after that service page is approved.

### `/custom-systems/`
- Current content aligns strongly with integrations, automation, dashboards, portals, and custom systems.
- Later strengthen `تطوير أنظمة مخصصة` in title/H1 or supporting heading if business priority is high.
- Preserve the “process before technology” positioning because it differentiates the offer without conflicting with search intent.

### `/tharaa/`
- Strong product-intent page already aligned with `ثيم سلة` and niche vertical modifiers.
- Preserve product-specific title, price, demo, marketplace CTA, and platform compatibility.

---

## SERP evidence snapshot — examples, not endorsements

The qualitative decisions above were informed by current Saudi / Arabic SERP patterns observed on 2026-09-18. Examples included:

- Dedicated ecommerce launch pages using `إنشاء متجر إلكتروني` and platform modifiers such as Salla/Zid.
- Dedicated `تصميم متجر سلة` and `تخصيص متجر سلة` pages, showing that broad store-design language is commercially competitive and semantically ambiguous.
- Dedicated Saudi `تصميم مواقع` / `تصميم موقع شركة` landing pages.
- Dedicated `تصميم صفحة هبوط` landing pages focused on campaign conversion.
- Dedicated `تصميم الهوية البصرية` service pages.
- Dedicated `تطوير أنظمة مخصصة` and `أتمتة الأعمال` pages.
- Dedicated `شركة سيو / تحسين محركات البحث` pages and separate ecommerce/Salla SEO services.
- Dedicated Salla theme product pages targeting `ثيم سلة` and theme-specific features.

These observations establish intent separation; they do not provide search-volume or difficulty estimates.

---

## Quantitative research fields — pending

For each Tier 1 cluster, add when Semrush API units are available:

- Saudi monthly search volume.
- Keyword Difficulty (KD).
- CPC.
- SERP feature presence.
- Related keywords / phrase variations.
- keyword trend where available.
- competitor domains/pages ranking for the cluster.

Then combine those metrics with Google Search Console data once sufficient live-site impressions exist.

---

## Priority sequence for the next SEO implementation stage

1. Preserve the ownership rules in this map.
2. Optimize existing high-fit commercial pages before creating new URLs.
3. Resolve the dedicated general SEO page decision.
4. Validate landing-page and visual-identity page candidates quantitatively.
5. Build page briefs for approved targets: primary intent, secondary entities, title/H1 direction, section coverage, proof requirements, internal links, schema requirements, and conversion action.
6. Only then modify on-page SEO/content in controlled batches.

Automated/runtime verification remains deferred to the final gate by project instruction.
