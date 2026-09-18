# Ibtikar Tech — Keyword-to-Page Map

> Canonical keyword-strategy source: `docs/seo/SEO_KEYWORD_STRATEGY_MASTER.md`
> Use this document for its specialist detail; keyword ownership and Phase 5/6 decisions are governed by the master file.

Status: v1.0 — Phase 6 ownership and cannibalization map
Market: Saudi Arabia first, Gulf second
Research date: 2026-09-18

## 1. Purpose

This is the canonical mapping layer between search demand and Ibtikar Tech pages.

Every important cluster gets:
- one primary owner;
- supporting pages with a different intent role;
- internal-link direction;
- explicit exclusions to prevent cannibalization.

A supporting page may mention the cluster naturally, but it must not be optimized as a second primary owner for the same commercial intent.

---

## 2. Core Keyword → Intent → Page map

| Keyword cluster | Search intent | Primary page | Supporting pages | Internal-link direction | Status |
| --- | --- | --- | --- | --- | --- |
| شركة حلول رقمية / حلول رقمية للشركات السعودية | Commercial / entity discovery | `/` | `/services/`, `/about/`, `/portfolio/` | Home → Services/categories; proof pages → relevant service | Existing owner |
| خدمات رقمية / حلول وخدمات ابتكار تك | Commercial hub / navigation | `/services/` | five category hubs | Services → each category | Existing owner |
| تصميم وتطوير متاجر إلكترونية / حلول المتاجر الإلكترونية | Broad commercial | `/ecommerce/` | all six ecommerce service pages | Ecommerce hub → specialist service by modifier | Existing owner |
| تصميم متجر سلة / تصميم متجر زد | Broad commercial, ambiguous | `/ecommerce/` | launch, customization, redesign | Hub routes by user state; children use narrower anchors | Existing owner / high guardrail |
| إنشاء متجر إلكتروني / إطلاق متجر إلكتروني / إنشاء متجر سلة | Transactional | `/services/store-launch/` | `/knowledge/store-launch/`, `/ecommerce/` | Article → service; hub → launch; launch → hub | Existing owner |
| خطوات إنشاء متجر / كيف أفتح متجرًا / تجهيز متجر قبل الإطلاق | Informational | `/knowledge/store-launch/` | store-launch service | Article → commercial service | Existing owner |
| تخصيص متجر سلة / تخصيص واجهة المتجر / تخصيص ثيم سلة | Transactional specialist | `/services/storefront-customization/` | redesign comparison article, redesign service | Ecommerce → customization; comparison article → customization/redesign | Existing owner |
| إعادة تصميم متجر إلكتروني / تطوير متجر قائم | Transactional specialist | `/services/store-redesign/` | comparison article, customization, product page | Article → redesign; customization → redesign only when scope is broader | Existing owner |
| تخصيص الواجهة أم إعادة التصميم / متى أعيد تصميم المتجر | Comparison / informational | `/knowledge/store-redesign/` | customization + redesign services | Article → both service choices with distinct anchors | Existing owner |
| تحسين صفحة المنتج / تصميم صفحة المنتج | Commercial problem-solution | `/services/product-page-optimization/` | `/knowledge/product-page/`, redesign, ecommerce-growth | Article → product service; service → growth when measurement is next | Existing owner |
| كيفية تحسين صفحة المنتج / عناصر صفحة المنتج | Informational | `/knowledge/product-page/` | product optimization service | Article → service | Existing owner |
| سيو المتاجر الإلكترونية / SEO متجر سلة | Transactional specialist | `/services/ecommerce-growth/` interim | `/growth/`, future SEO page | Ecommerce-growth owns ecommerce modifier only | Interim |
| قياس أداء متجر / تتبع متجر سلة / تحليلات متجر | Commercial specialist | `/services/ecommerce-growth/` | `/growth/` | Ecommerce service → general growth only when scope expands | Existing owner |
| دعم متجر إلكتروني / صيانة متجر سلة / تطوير مستمر | Transactional / retention | `/services/ecommerce-support/` | ecommerce hub, redesign, ecommerce-growth | Hub → support; support → redesign/growth if request exceeds support scope | Existing owner |
| تصميم موقع شركة / شركة تصميم مواقع السعودية / تصميم وتطوير مواقع | Transactional | `/websites/` | brand-content, growth, custom-systems | Services/Home → websites; websites → adjacent capability only when needed | Existing owner |
| تصميم صفحة هبوط / Landing Page السعودية | Transactional | `/websites/` interim | future dedicated landing-page service | Websites owns until dedicated URL is approved | Interim / candidate |
| تصميم هوية بصرية / تصميم هوية تجارية / شركة تصميم هوية | Transactional | `/brand-content/` interim | websites, ecommerce | Brand-content owns until dedicated URL is approved | Interim / candidate |
| استراتيجية علامة / محتوى موقع / محتوى متجر | Commercial specialist | `/brand-content/` | websites, ecommerce, growth | Brand/content → implementation destination | Existing secondary clusters |
| شركة سيو السعودية / خدمات SEO / تحسين محركات البحث | Transactional / commercial investigation | `/services/seo/` | `/growth/`, ecommerce-growth, future articles | Growth → `/services/seo/`; future SEO articles → `/services/seo/`; ecommerce-growth keeps ecommerce modifier | Implemented owner |
| SEO تقني / تدقيق SEO | Mixed specialist | `/services/seo/` architecture | future informational guides | Parent SEO page first; specialist split only after demand proof | Candidate |
| تحسين معدل التحويل / CRO | Commercial specialist | `/growth/` interim | websites, ecommerce-growth | Growth → implementation page when issue is page/store-specific | Existing interim |
| إعداد GA4 / تتبع التحويلات / قياس الموقع | Commercial specialist for implementation; informational for basic setup | `/growth/` | official platform docs are informational; ecommerce-growth for stores | Growth → ecommerce-growth for store-specific work | Existing owner |
| تطوير أنظمة مخصصة / برمجة نظام مخصص | Transactional B2B | `/custom-systems/` | websites, growth | Services → custom systems; systems → website when need is only front-end marketing | Existing owner |
| ربط الأنظمة / تكامل API / Webhooks | Transactional specialist | `/custom-systems/` | growth where analytics integration is the actual goal | Systems ↔ Growth only by problem context | Existing owner |
| أتمتة الأعمال / أتمتة العمليات | Mixed informational/commercial | `/custom-systems/` commercial | future automation guide | Future guide → custom-systems | Existing commercial + content opportunity |
| بوابة عملاء / لوحة تشغيل مخصصة | Transactional long-tail | `/custom-systems/` | — | Contextual from systems sections only | Existing secondary |
| ثيم سلة / قالب سلة / ثيم سلة للعطور والعناية | Transactional product | `/tharaa/` | ecommerce, storefront customization | Tharaa → service only when user needs work beyond theme product | Existing owner |
| ثيم ثراء | Navigational / product | `/tharaa/` | Salla marketplace/demo external | Tharaa → marketplace/demo primary CTAs | Existing owner |

---

## 3. Cannibalization rules by high-risk family

### A. Ecommerce broad vs specialist pages

`/ecommerce/` owns broad category language:
- تصميم متجر سلة
- تصميم وتطوير متجر إلكتروني
- حلول المتاجر الإلكترونية

Children own modifiers:

`/services/store-launch/`
- إنشاء
- إطلاق
- تجهيز من الصفر
- متجر جديد

`/services/storefront-customization/`
- تخصيص
- واجهة
- ثيم قائم
- CSS/JS/theme customization

`/services/store-redesign/`
- إعادة تصميم
- متجر قائم
- UX إعادة بناء
- إعادة هيكلة

`/services/product-page-optimization/`
- صفحة المنتج
- تحسين قرار الشراء
- Product UX

`/services/ecommerce-growth/`
- قياس
- tracking
- ecommerce SEO
- growth backlog

`/services/ecommerce-support/`
- دعم
- صيانة
- تطوير مستمر

Rule:
Never make all children repeat `تصميم متجر سلة` in title/H1 as their primary phrase.

---

### B. Generic SEO vs ecommerce SEO vs growth

Future dedicated SEO page owns:
- شركة سيو السعودية
- خدمات SEO
- تحسين محركات البحث
- شركة تحسين محركات البحث

`/services/ecommerce-growth/` owns only ecommerce-modified SEO/measurement:
- سيو متجر إلكتروني
- سيو سلة (interim)
- قياس وتحليلات المتجر

`/growth/` owns:
- الظهور والقياس والنمو
- analytics
- tracking
- CRO
- reporting

Rule:
Do not optimize `/growth/` and ecommerce-growth around the same generic `خدمات SEO السعودية` title/H1.

---

### C. Websites vs landing pages

`/websites/` owns:
- تصميم موقع شركة
- تصميم مواقع
- تطوير مواقع
- corporate websites

Landing-page intent remains on `/websites/` only temporarily.

If dedicated landing-page service is approved:
- move transactional landing-page primary ownership to that page;
- retain only a summary/card on `/websites/`;
- update internal links directly to the new canonical URL;
- do not keep two full sections/pages both optimized around `تصميم صفحة هبوط`.

---

### D. Brand/content vs visual identity

`/brand-content/` remains a brand/content hub.

If dedicated visual-identity page is approved:
- new page owns `تصميم هوية بصرية`, `تصميم هوية تجارية`;
- hub owns the broader `الهوية والمحتوى` ecosystem;
- hub links to the specialist page;
- avoid duplicate service copy.

---

### E. Tharaa vs store-design services

`/tharaa/` owns theme/product intent.

It must not become an agency-service landing page for:
- تصميم متجر سلة
- إنشاء متجر سلة
- تخصيص متجر سلة

Those belong to ecommerce architecture.

---

## 4. Supporting-content map

| Commercial owner | Informational support | Purpose |
| --- | --- | --- |
| `/services/store-launch/` | `/knowledge/store-launch/` | How-to/checklist → hire/build decision |
| `/services/product-page-optimization/` | `/knowledge/product-page/` | Education → specialist service |
| customization + redesign | `/knowledge/store-redesign/` | Comparison → correct service choice |
| `/websites/` | Future: cost/brief/company-site guide | Help buyer define scope |
| future SEO service | Future: technical SEO/indexing/keyword research guides | Build topical support without competing for commercial head term |
| `/brand-content/` or future identity service | Future: visual identity components/brief guide | Informational support |
| `/custom-systems/` | Future: what to automate first | Informational → process diagnosis |
| `/growth/` | Future: measurement plan / conversion tracking guide | Educational → implementation |

---

## 5. Internal-link contract

### Home
Links prominently to:
- `/services/`
- `/ecommerce/`
- `/websites/`
- `/brand-content/`
- `/growth/`
- `/custom-systems/`
- `/tharaa/` only where product context exists

### Services hub
Links to all five category hubs.

### Ecommerce hub
Links to all six specialist ecommerce services with distinct anchors.

### Specialist ecommerce services
Link:
- back to `/ecommerce/`;
- to the relevant article;
- to sibling service only when it represents a plausible next decision.

### Knowledge articles
Link to their commercial owner using descriptive anchors.

### Growth
Do not create a dead link to future SEO page. Once the page exists, generic SEO commercial anchors should point directly there.

### Brand / Websites
Do not link to future specialist pages until approved and live.

---

## 6. Page-creation decision matrix

| Candidate | Qualitative SERP separation | Current page-fit problem | Business/offer fit | Decision now |
| --- | --- | --- | --- | --- |
| Dedicated general SEO service | Strong | High | Strong strategic fit | Highest-priority candidate |
| Dedicated landing-page service | Strong | Medium | Existing offer already present | Validate quantitatively, then likely split |
| Dedicated visual-identity service | Strong | Medium | Existing offer already present | Validate quantitatively, then consider split |
| Ecommerce SEO service | Moderate/strong | Medium | Existing partial offer | Wait until general SEO architecture is resolved |
| GA4 setup service | Weak as standalone commercial page | Low | Basic setup overlaps platform documentation | Do not create now |
| Salla SEO + Zid SEO separate pages | Not proven separately | High duplication risk | Needs platform-specific depth | Do not create now |
| Riyadh/Jeddah service doorway pages | Not justified | High thin-content risk | No distinct local proposition documented | Do not create now |

---

## 7. On-page ownership contract

For each indexable commercial page:

1. One primary cluster.
2. 2–5 closely related secondary variants/entities.
3. One primary user task.
4. Title/H1 align to the same page role but need not be exact duplicates.
5. Supporting sections answer the decision questions for that intent.
6. Proof must match the offer; do not fabricate client results.
7. Internal anchors use natural descriptive language.
8. Do not create exact-match copy blocks solely to repeat variants.
9. Articles support the service; they do not become duplicate service landing pages.
10. A new page must update this map and `INDEXATION_MAP.md` before sitemap inclusion.

---

## 8. Priority implementation order from Phase 6

### P1 — Existing strong owners
1. `/ecommerce/`
2. `/services/store-launch/`
3. `/services/storefront-customization/`
4. `/services/store-redesign/`
5. `/services/product-page-optimization/`
6. `/websites/`
7. `/custom-systems/`
8. `/tharaa/`

Goal:
Align titles/H1/supporting copy/internal links with their assigned intent without redesigning the pages.

### P2 — Resolve ambiguous owners
1. Generic SEO architecture
2. Landing-page service decision
3. Visual-identity service decision
4. Ecommerce SEO specialization

### P3 — Content support
Build informational clusters only after their commercial parent/owner is clear.

---

## 9. Measurement fields to append later

When reliable data is available, each cluster row can be extended with:
- Saudi search volume;
- KD;
- CPC;
- GSC impressions;
- GSC clicks;
- average position;
- conversion count;
- assisted conversion / inquiry attribution;
- trend;
- competitor overlap.

These metrics prioritize work; they do not override intent ownership without a deliberate architecture decision.

---

## 10. Change-control rule

Any future SEO change that creates or repurposes a public page must answer:

- Which cluster does this page own?
- Which existing page stops owning it?
- Is the intent materially distinct?
- What supports this page?
- What does this page link back to?
- Is it indexable?
- Is it in the sitemap?
- Does it create a duplicate title/H1/topic target?

If those questions are not answered, the page should not be added to the acquisition architecture.



## 11. Commercial-investigation / cost / comparison map

The full Saudi-market pass identified a distinct comparison layer between informational research and transactional service intent.

| Query cluster | Intent | Primary/support destination | Relationship to service page |
| --- | --- | --- | --- |
| تكلفة إنشاء متجر إلكتروني / سعر تصميم متجر سلة | Commercial investigation | `/knowledge/ecommerce-cost-saudi/` supporting `/services/store-launch/` and `/ecommerce/` | Does not replace launch service owner |
| أفضل شركة تصميم متجر / مصمم متجر سلة | Provider comparison | Future comparison/selection content only if useful and evidence-led | Ecommerce remains service hub |
| تكلفة تصميم موقع في السعودية / سعر موقع شركة | Commercial investigation | `/knowledge/website-cost-saudi/` | Supports `/websites/` |
| أفضل شركة تصميم مواقع / كيف أختار شركة تصميم مواقع | Provider comparison | Future selection guide | Supports /websites/ |
| تكلفة صفحة هبوط | Commercial investigation | Future landing-page cost content after architecture decision | Supports current /websites/ or future specialist |
| تكلفة تصميم هوية بصرية | Commercial investigation | Future identity cost guide | Supports /brand-content/ interim or future identity service |
| أسعار خدمات SEO / تكلفة SEO | Commercial investigation | Future SEO pricing guide | Supports `/services/seo/` |
| أفضل شركة سيو / كيف أختار شركة سيو | Provider comparison | Future neutral selection guide | Supports `/services/seo/` |
| تكلفة تطوير نظام مخصص | Commercial investigation | Future cost/scope guide | Supports /custom-systems/ |
| نظام جاهز أم مخصص | Comparison | Future comparison guide | Supports /custom-systems/ |
| تكلفة أتمتة الأعمال | Commercial investigation | Future cost-driver guide | Supports /custom-systems/ |
| ماذا أؤتمت أولًا | Informational/commercial bridge | `/knowledge/automation-first/` | Supports `/custom-systems/` |

Rule:
A service page may answer a short pricing/scope FAQ, but it should not become the primary owner of every “تكلفة / أفضل / مقارنة” cluster when that query clearly expects a decision guide.

---

## 12. Market-evidence source

Detailed qualitative evidence and current source samples:
- docs/seo/SAUDI_MARKET_RESEARCH_2026.md

This map governs ownership. The evidence report explains why the ownership was chosen.

