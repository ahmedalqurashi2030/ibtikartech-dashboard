# Ibtikar Tech — Saudi Search Intent Research

Status: v1.0 qualitative research
Market: Saudi Arabia first, Gulf second
Research date: 2026-09-18
Branch: `seo/indexation-infrastructure`

> This document is a qualitative intent and SERP-pattern study. Monthly search volume, KD, CPC, and exact Google ranking positions are intentionally not fabricated. Direct `google.com/search` pages were not accessible from the research interface, so the study uses current web-search result samples, current competitor landing pages, and official Salla/Zid documentation to infer search intent and expected page type. Quantitative validation remains a separate later layer.

## 1. Goal

The purpose of this phase is not to collect a large keyword list. It is to understand:

- what Saudi prospects call each service;
- whether the searcher wants information, comparison, or a provider now;
- what page type currently satisfies that intent;
- where Ibtikar Tech already has a suitable page;
- where the current architecture mixes materially different intents;
- which queries must never be assigned to multiple primary pages.

The output of this research feeds `KEYWORD_TO_PAGE_MAP.md`.

## 2. Intent model

We use four practical intent classes:

| Intent | User state | Typical query language | Best page type |
| --- | --- | --- | --- |
| Informational | Learning / problem discovery | كيف، ما هو، خطوات، دليل، الفرق | Guide/article |
| Commercial investigation | Comparing solutions/providers | شركة، أفضل، أسعار، مقارنة، خدمة | Service/category page with proof |
| Transactional | Ready to start/buy/request | تصميم، إنشاء، تخصيص، تطوير، اطلب | Dedicated service/product landing page |
| Navigational / product | Looking for a known product/brand | ثيم ثراء، ثيم سلة، اسم شركة | Product/brand page |

A query can be mixed. In that case we choose the page owner by the dominant task the user wants to complete, not by exact keyword repetition.

---

## 3. Ecommerce / Salla cluster

### A. `تصميم متجر سلة`

Observed pattern:
- broad commercial service pages use the phrase for a full store build;
- other pages use it for storefront/theme customization;
- Salla's own help content separates store design, theme management, customization, landing pages, and theme development.

Intent: Commercial / transactional, but semantically broad.

Architecture decision:
- broad owner: `/ecommerce/`;
- do not make launch, customization, redesign, and Tharaa all target this as their primary phrase;
- route narrow modifiers to specialist pages.

Why:
The market uses “تصميم متجر سلة” as an umbrella phrase. Assigning it to multiple Ibtikar pages would create self-competition.

### B. `إنشاء متجر إلكتروني`, `إنشاء متجر سلة`, `إطلاق متجر إلكتروني`

Observed pattern:
- service pages promise end-to-end setup, platform configuration, products, payments/shipping, UX, and launch;
- informational guides also rank for “how to create/open a store” language.

Intent split:
- provider/action intent → transactional;
- “how/steps/cost/requirements” → informational/comparison.

Primary commercial owner:
`/services/store-launch/`

Supporting information owner:
`/knowledge/store-launch/`

Guardrail:
The article must not be rewritten as a “hire us to create your store” page; the service page must not become a long generic tutorial.

### C. `تخصيص متجر سلة`, `تخصيص واجهة متجر سلة`, `تخصيص ثيم سلة`

Observed pattern:
- official Salla help content covers theme and storefront customization;
- specialist service pages offer CSS/JS, theme, layout, visual, and interaction customization.

Intent:
Mixed informational + transactional, with strong specialist-service fit.

Primary commercial owner:
`/services/storefront-customization/`

Supporting informational opportunities:
- theme customization limitations;
- when CSS/JS customization is enough;
- customization vs redesign.

### D. `إعادة تصميم متجر إلكتروني`, `إعادة تصميم متجر سلة`, `تطوير متجر قائم`

Intent:
Commercial / transactional.

Primary owner:
`/services/store-redesign/`

Boundary:
- customization = existing structure mostly works;
- redesign = architecture/UX/components across the journey need broader intervention.

Required comparison link:
`/knowledge/store-redesign/`

### E. `تحسين صفحة المنتج`, `تصميم صفحة المنتج`, `تحسين صفحة المنتج في سلة`

Observed pattern:
Current result samples include informational guides around product clarity, SEO, AI-readiness, and conversion as well as specialist-service language.

Intent split:
- learning / checklist → informational;
- hire someone to improve a live product page → commercial.

Primary commercial owner:
`/services/product-page-optimization/`

Supporting owner:
`/knowledge/product-page/`

Guardrail:
Do not assign generic store redesign or generic landing-page intent to this page.

### F. `سيو متجر سلة`, `SEO متجر سلة`, `سيو المتاجر الإلكترونية`

Observed pattern:
Dedicated ecommerce/Salla SEO pages exist and discuss categories, product pages, indexing, internal linking, structured data, and Search Console.

Intent:
Commercial specialist.

Interim owner:
`/services/ecommerce-growth/`

Fit:
Partial. Current page mixes SEO, analytics, tracking, integrations, and CRO.

Decision:
A future `SEO للمتاجر الإلكترونية` page is a legitimate candidate, but do not create separate Salla/Zid SEO pages before demand and delivery depth are validated.

---

## 4. Website and landing-page cluster

### A. `تصميم موقع شركة`, `شركة تصميم مواقع السعودية`, `تصميم مواقع شركات`

Observed pattern:
Dedicated commercial landing pages emphasize company websites, mobile/RTL, lead generation, trust, SEO readiness, and conversion.

Intent:
Commercial / transactional.

Primary owner:
`/websites/`

Fit:
Strong.

On-page direction:
Make the commercial service meaning explicit while preserving the current decision-led UX. The page can own:
- تصميم موقع شركة;
- تصميم وتطوير مواقع;
- مواقع شركات في السعودية.

### B. `تصميم صفحة هبوط`, `Landing Page السعودية`

Observed pattern:
Dedicated landing-page service pages are common. Their proposition is materially narrower than a corporate website: one offer, one campaign, one conversion action, proof, tracking.

Intent:
Transactional / commercial investigation.

Interim owner:
`/websites/`

Architecture finding:
Strong candidate for a dedicated service page because the SERP/task is distinct from a general website build.

Do not create yet solely from qualitative evidence. Quantitative validation and service-readiness review remain required.

---

## 5. SEO / organic growth cluster

### A. `شركة سيو السعودية`, `شركة تحسين محركات البحث`, `خدمات SEO السعودية`

Observed pattern:
Current results are heavily represented by dedicated SEO service pages, not broad analytics/growth hubs. Common scope includes:
- technical SEO;
- keyword research;
- on-page;
- content;
- internal linking;
- local SEO;
- ecommerce SEO;
- reporting/measurement.

Intent:
Commercial investigation / transactional.

Current architecture:
- `/growth/` = broad visibility + analytics + tracking + CRO + reporting;
- `/services/ecommerce-growth/` = ecommerce SEO + measurement + integrations.

Finding:
There is no clean primary owner for generic SEO commercial intent.

Decision:
Dedicated general SEO service page = High-priority architecture candidate.

Cannibalization rule until created:
- generic SEO → no aggressive primary targeting on either existing page;
- ecommerce-specific SEO → `/services/ecommerce-growth/` interim;
- analytics/measurement/CRO → `/growth/`.

### B. `SEO تقني`, `تدقيق SEO`, `مشاكل الفهرسة`

Intent varies:
- “ما هو / لماذا” → informational;
- “خدمة / شركة / تدقيق” → commercial specialist.

Future content architecture:
- general SEO page as commercial parent;
- technical SEO / audit may later become subservice pages only if demand and offer maturity justify them;
- informational guides should support, not compete with, service pages.

---

## 6. Visual identity / branding cluster

Queries:
- `تصميم هوية بصرية`
- `تصميم هوية تجارية`
- `شركة تصميم هوية بصرية`
- `Branding السعودية`

Observed pattern:
Dedicated identity pages frequently focus on strategy, logo, colors, typography, visual system, applications, and brand guidelines.

Intent:
Commercial / transactional.

Interim owner:
`/brand-content/`

Fit:
Good content fit, but the page is broader than the query because it also includes positioning, design systems, web copy, commerce copy, and campaign assets.

Decision:
Dedicated visual-identity service page = medium/high-priority candidate after quantitative validation.

Guardrail:
Do not turn every `/brand-content/` section into exact-match visual-identity copy while the page remains a multi-offer hub.

---

## 7. Custom systems / integration / automation cluster

### A. `تطوير أنظمة مخصصة`, `برمجة أنظمة مخصصة`

Observed pattern:
Commercial service pages describe discovery, process analysis, UX, custom software, integrations, SaaS, support, and continuous improvement.

Intent:
Transactional B2B.

Primary owner:
`/custom-systems/`

Fit:
Strong.

### B. `ربط الأنظمة`, `تكامل API`, `ربط التطبيقات`

Intent:
Commercial specialist / problem-solution.

Primary owner:
`/custom-systems/`

Supporting content candidates:
- when an API integration is enough;
- integration vs custom system;
- webhook/retry/error-handling concepts for business owners.

### C. `أتمتة الأعمال`, `أتمتة العمليات`

Observed pattern:
Current result samples skew strongly toward educational guides explaining what to automate first, process mapping, rules, and ROI; service intent also exists but is less cleanly separated.

Intent:
Mixed informational + commercial.

Commercial owner:
`/custom-systems/`

Future informational owner candidate:
an article around “what to automate first”.

Important positioning advantage:
The current Ibtikar proposition “process before technology” matches the informational/commercial expectation well and should be preserved.

---

## 8. Analytics / tracking cluster

Queries:
- `إعداد GA4`
- `ربط Google Analytics`
- `تتبع التحويلات`
- `قياس أداء المتجر`
- `تحليل سلوك العملاء`

Observed pattern:
For Salla/Zid, official platform documentation strongly satisfies basic setup/how-to intent. Commercial opportunity is therefore not “how to paste the tracking ID”, but:
- event plan;
- conversion integrity;
- debugging duplicate/missing events;
- attribution questions;
- dashboard/decision layer;
- cross-tool integration;
- privacy/consent implementation.

Intent split:
- basic setup → informational / platform help;
- measurement architecture / implementation / audit → commercial specialist.

Primary general owner:
`/growth/`

Primary ecommerce owner:
`/services/ecommerce-growth/`

Guardrail:
Do not create a thin “ربط Google Analytics” service page that merely repeats Salla/Zid documentation.

---

## 9. Tharaa / Salla theme cluster

Queries:
- `ثيم سلة`
- `قالب سلة`
- `ثيم سلة للعطور`
- `ثيم سلة للعناية`
- `ثيم ثراء`

Intent:
Transactional product / navigational.

Primary owner:
`/tharaa/`

Boundary:
Do not target generic agency-service terms such as `تصميم متجر سلة` as Tharaa's primary intent.

---

## 10. Intent modifiers to use in future research

### Informational modifiers
- كيف
- ما هو
- خطوات
- دليل
- شرح
- متطلبات
- مشاكل
- الفرق بين

### Commercial-investigation modifiers
- شركة
- أفضل
- أسعار
- تكلفة
- مقارنة
- خدمة
- باقات
- أعمال
- تجارب

### Transactional modifiers
- تصميم
- إنشاء
- تطوير
- تخصيص
- إعادة تصميم
- تحسين
- ربط
- أتمتة
- اطلب
- تنفيذ

### Platform modifiers
- سلة
- زد
- Shopify
- WooCommerce
- WordPress
- GA4
- Google Tag Manager

### Saudi modifiers
Use naturally where commercial intent is national:
- السعودية
- الرياض
- جدة
- الشرقية

Do not generate thin city doorway pages without local evidence, projects, team/service-area data, or distinct user value.

---

## 11. Architecture findings from Phase 5

### Strong existing owners
- Ecommerce broad → `/ecommerce/`
- Store launch → `/services/store-launch/`
- Storefront customization → `/services/storefront-customization/`
- Store redesign → `/services/store-redesign/`
- Product-page optimization → `/services/product-page-optimization/`
- Website/company website → `/websites/`
- Custom systems/integrations/automation commercial → `/custom-systems/`
- Analytics/measurement general → `/growth/`
- Ecommerce analytics/measurement → `/services/ecommerce-growth/`
- Tharaa/Salla-theme product → `/tharaa/`

### Architecture gaps / candidates
1. Generic SEO service — High
2. Dedicated landing-page service — Medium/High
3. Dedicated visual-identity service — Medium/High
4. Ecommerce SEO specialization — Medium, after general SEO architecture is resolved

### Not justified as standalone pages yet
- basic GA4 setup;
- generic “API integration” variants per vendor;
- city pages;
- Salla SEO and Zid SEO as separate children;
- every platform + service combination.

---

## 12. Evidence sample used in this research

Current result samples included:
- Salla Help Center: theme/store customization, landing pages, Google Analytics;
- Zid Help Center: Google Analytics;
- Leads.sa: dedicated SEO and landing-page solutions;
- Rowaaj / SEO-focused Saudi agencies: dedicated SEO landing pages;
- Saudi website-design service pages targeting company websites;
- dedicated Saudi visual-identity service pages;
- Origami and similar custom-software providers for custom systems;
- Saudi/Arabic automation guides;
- Salla-specific store setup/customization service pages.

These sources are evidence of intent/page-type patterns, not endorsements or ranking scores.

---

## 13. Quantitative fields still pending

When a trustworthy quantitative source is available, append for each Tier-1 cluster:
- Saudi monthly search volume;
- keyword difficulty;
- CPC;
- trend;
- SERP features;
- top ranking domains/pages;
- keyword variants/questions;
- overlap with GSC impressions/clicks.

No page creation decision should depend on fabricated numbers.

