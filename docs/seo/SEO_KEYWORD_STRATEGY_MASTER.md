# Ibtikar Tech — Saudi Keyword Strategy Master

Status: v1.0 — Canonical master for Phase 5 + Phase 6
Market priority: Saudi Arabia first, Gulf second
Research date: 2026-09-18
Canonical site: `https://ibtikartech.co`
Branch: `seo/indexation-infrastructure`

> This file is the primary decision document for keyword research, search intent, keyword-to-page ownership, cannibalization prevention, supporting content, and internal-link direction. When this file conflicts with earlier working notes, this file wins until a later approved revision.

> Quantitative metrics such as Saudi monthly search volume, KD, CPC, exact Google ranking positions, and trend are intentionally not invented. Those fields remain pending until a trustworthy quantitative source or sufficient Google Search Console data is available.

---

## 1. Mission

The goal is not to collect the largest possible keyword list.

The goal is to build a search architecture in which:

1. each commercially important intent has one clear primary owner;
2. informational content supports commercial pages instead of competing with them;
3. broad and specialist service pages have different jobs;
4. platform modifiers are used only where Ibtikar can genuinely deliver platform-specific value;
5. Saudi market language is reflected naturally without doorway pages or location stuffing;
6. new URLs are created only when search intent, offer readiness, architecture, and evidence justify them;
7. internal links reinforce the hierarchy users need to make a decision.

---

# PHASE 5 — KEYWORD RESEARCH + SEARCH INTENT

## 2. Research method

The research combines:

- current Ibtikar Tech page architecture and actual page content;
- current Arabic/Saudi web-result patterns;
- current competitor service-page structures;
- official Salla/Zid documentation where platform behavior affects intent;
- qualitative SERP/page-type separation;
- commercial offer fit inside Ibtikar Tech.

Direct `google.com/search` pages were not available through the research interface. Therefore this document does not claim exact Google positions or reproduce a literal Google SERP. Current web-result samples and destination pages are used to identify intent and page type.

### Intent classes

| Intent | What the user is trying to do | Typical modifiers | Preferred page type |
| --- | --- | --- | --- |
| Informational | Understand a problem, process, requirement, or concept | كيف، ما هو، خطوات، دليل، شرح، متطلبات، مشاكل | Article / guide |
| Commercial investigation | Compare providers, approaches, cost, scope, proof | شركة، أفضل، أسعار، تكلفة، مقارنة، خدمة، باقات | Service/category page |
| Transactional | Start, order, build, improve, implement | تصميم، إنشاء، تطوير، تخصيص، تحسين، إعادة تصميم، ربط | Dedicated service/product page |
| Navigational/product | Reach a known product or brand | اسم المنتج/الثيم/الشركة | Product / brand page |

Mixed queries are mapped by the dominant task, not by exact keyword repetition.

---

## 3. Saudi keyword inventory by business cluster

### 3.1 Ecommerce / Salla / Zid

#### Broad category terms
Primary broad owner: `/ecommerce/`

Keyword family:
- تصميم متجر سلة
- تصميم متجر زد
- تصميم متجر إلكتروني
- تصميم وتطوير متجر إلكتروني
- شركة تصميم متاجر إلكترونية
- حلول المتاجر الإلكترونية
- تطوير متجر إلكتروني
- متجر إلكتروني احترافي
- تصميم متاجر سلة وزد

Intent:
Commercial / transactional, but broad and often ambiguous.

Observed market behavior:
The phrase `تصميم متجر سلة` may describe a complete store build, a visual storefront redesign, or theme customization. Salla itself separates store design/customization tasks from broader store creation.

Decision:
Keep the broad phrase family on the ecommerce hub. Do not assign the same head term as primary to all specialist pages.

#### Store launch / build
Primary owner: `/services/store-launch/`

Commercial variants:
- إنشاء متجر إلكتروني
- إنشاء متجر سلة
- إنشاء متجر زد
- إطلاق متجر إلكتروني
- فتح متجر إلكتروني
- تجهيز متجر إلكتروني
- بناء متجر على سلة
- تجهيز متجر سلة
- إعداد متجر سلة
- متجر جديد على سلة

Informational variants:
- كيف أفتح متجر إلكتروني
- خطوات إنشاء متجر إلكتروني
- متطلبات متجر إلكتروني في السعودية
- كيف أفتح متجر سلة
- تجهيز متجر قبل الإطلاق
- قائمة إطلاق متجر إلكتروني
- تكلفة إنشاء متجر إلكتروني

Intent split:
- provider/build intent → service page;
- how-to/checklist/requirements intent → knowledge content.

Supporting owner:
`/knowledge/store-launch/`

#### Storefront / theme customization
Primary owner: `/services/storefront-customization/`

Variants:
- تخصيص متجر سلة
- تخصيص واجهة متجر سلة
- تخصيص ثيم سلة
- تعديل ثيم سلة
- تصميم واجهة متجر سلة
- تعديل واجهة سلة
- تخصيص متجر زد
- تخصيص Shopify
- تخصيص WooCommerce
- CSS سلة
- JavaScript سلة
- تطبيق الهوية على متجر سلة

Intent:
Transactional specialist.

Boundary:
The existing store/theme remains usable; the request is focused on interface, brand application, components, or bounded customization.

#### Store redesign
Primary owner: `/services/store-redesign/`

Variants:
- إعادة تصميم متجر إلكتروني
- إعادة تصميم متجر سلة
- تطوير متجر قائم
- تحديث تصميم متجر
- تحسين تجربة متجر
- إعادة بناء واجهة المتجر
- redesign متجر سلة
- تطوير UX متجر إلكتروني

Intent:
Transactional specialist.

Boundary:
Problems extend across structure, navigation, product discovery, mobile UX, components, or the purchase journey.

#### Product-page optimization
Primary commercial owner: `/services/product-page-optimization/`
Supporting informational owner: `/knowledge/product-page/`

Commercial variants:
- تحسين صفحة المنتج
- تصميم صفحة المنتج
- تطوير صفحة المنتج
- تحسين صفحة المنتج في سلة
- تحسين تجربة صفحة المنتج
- Product UX
- تحسين زر إضافة للسلة
- تحسين معلومات المنتج
- تحسين تحويل صفحة المنتج

Informational variants:
- كيفية تحسين صفحة المنتج
- عناصر صفحة المنتج
- أفضل ترتيب لصفحة المنتج
- ماذا يجب أن تحتوي صفحة المنتج
- صفحة منتج ناجحة

#### Ecommerce growth / ecommerce SEO / measurement
Interim owner: `/services/ecommerce-growth/`

Variants:
- سيو المتاجر الإلكترونية
- SEO متجر سلة
- سيو سلة
- تحسين ظهور متجر سلة
- SEO متجر زد
- قياس أداء المتجر
- تتبع متجر سلة
- تحليلات متجر إلكتروني
- ربط GA4 بالمتجر
- تتبع التحويلات للمتجر
- Search Console متجر إلكتروني
- CRO متجر إلكتروني

Intent:
Commercial specialist.

Current fit:
Partial, because the page combines SEO, analytics, tracking, integrations, and CRO.

Architecture decision:
One future ecommerce-SEO page may be justified after the general SEO architecture is resolved. Do not create separate Salla/Zid SEO children yet.

#### Ongoing ecommerce support
Primary owner: `/services/ecommerce-support/`

Variants:
- دعم متجر إلكتروني
- صيانة متجر سلة
- دعم فني متجر سلة
- تطوير مستمر للمتجر
- صيانة متجر إلكتروني
- تحسينات دورية للمتجر
- إدارة تعديلات متجر

Intent:
Transactional / retention.

Priority:
Commercially valid, but acquisition priority should follow measured demand.

---

### 3.2 Websites / corporate websites

Primary owner: `/websites/`

Variants:
- تصميم موقع شركة
- تصميم مواقع شركات
- شركة تصميم مواقع السعودية
- تصميم مواقع في السعودية
- تصميم وتطوير مواقع
- تطوير موقع شركة
- برمجة موقع شركة
- موقع شركة احترافي
- تصميم موقع خدمات
- موقع تعريفي للشركة
- تصميم موقع عربي
- تصميم موقع RTL
- تصميم موقع ثنائي اللغة
- إعادة تصميم موقع شركة

Intent:
Transactional / commercial investigation.

Observed page expectation:
Clear company proposition, service architecture, mobile/RTL, trust, conversion path, speed/performance, and SEO readiness.

Decision:
Current page is a strong owner. Commercial search language should be made explicit in future on-page work without destroying the current UX proposition.

---

### 3.3 Landing pages

Interim owner: `/websites/`
Dedicated-page candidate: High/medium-high

Variants:
- تصميم صفحة هبوط
- تصميم Landing Page
- صفحة هبوط السعودية
- شركة تصميم صفحات هبوط
- تصميم صفحة هبوط لحملة
- صفحة هبوط إعلانية
- Landing Page للحملات
- صفحة مبيعات
- صفحة هبوط لجمع العملاء
- صفحة هبوط واتساب
- صفحة هبوط طلب عرض سعر

Intent:
Transactional / commercial investigation.

Observed page expectation:
One offer, one audience, one primary action, strong message match, trust at the point of hesitation, short conversion path, tracking.

Finding:
This intent is materially narrower than “تصميم موقع شركة”. Current market results commonly use dedicated landing-page service pages.

Decision:
Keep on `/websites/` temporarily. Quantitative validation + offer-readiness review should determine whether to create a dedicated canonical service page.

---

### 3.4 SEO / organic search

Current architecture:
- `/growth/` = broad visibility + analytics + tracking + CRO + reporting;
- `/services/ecommerce-growth/` = ecommerce SEO + measurement + integrations;
- no pure general SEO commercial page.

#### Generic commercial SEO cluster
Future dedicated owner: High-priority candidate

Variants:
- شركة سيو السعودية
- شركة SEO السعودية
- شركة تحسين محركات البحث
- خدمات SEO السعودية
- خدمات تحسين محركات البحث
- تحسين محركات البحث
- خبير سيو
- وكالة SEO
- SEO للمواقع
- SEO للشركات
- سيو مواقع
- تهيئة المواقع لمحركات البحث

Intent:
Commercial investigation / transactional.

Observed page expectation:
Dedicated SEO pages commonly cover:
- technical SEO;
- keyword research;
- on-page;
- content;
- architecture/internal linking;
- local SEO;
- ecommerce SEO;
- reporting/measurement;
- proof/case studies.

Decision:
Create a dedicated general SEO service only after scope/offer approval. It is the strongest current architecture gap.

#### Technical SEO / audit
Future child/specialist candidate, not automatically a new page

Variants:
- SEO تقني
- تدقيق SEO
- Technical SEO
- فحص مشاكل الفهرسة
- فحص أرشفة الموقع
- تحسين crawl/indexing
- تدقيق محركات البحث

Intent:
Mixed informational/commercial.

Rule:
Build the general commercial SEO parent first. Split technical SEO only if measured demand and delivery maturity justify it.

#### Informational SEO opportunities
Future supporting content:
- ما هو SEO التقني
- لماذا موقعي لا يظهر في Google
- لماذا صفحاتي غير مفهرسة
- كيف تعمل خريطة الموقع
- canonical ما هو
- كيف أختار الكلمات المفتاحية
- Search Intent
- كيف أمنع Cannibalization

Rule:
These articles support the commercial SEO owner; they do not replace it.

---

### 3.5 Analytics / tracking / measurement

Primary general owner: `/growth/`
Ecommerce-specific owner: `/services/ecommerce-growth/`

Variants:
- إعداد GA4
- ربط Google Analytics
- Google Tag Manager
- إعداد GTM
- تتبع التحويلات
- قياس أداء الموقع
- تحليل سلوك المستخدم
- تتبع النماذج
- event tracking
- conversion tracking
- خطة قياس
- measurement plan
- dashboard تحليلات
- attribution
- تحليل رحلة العميل

Intent split:
- basic platform setup → informational/help intent;
- event architecture, debugging, attribution, measurement implementation, and decision systems → commercial.

Decision:
Do not create a thin commercial page that only repeats basic Salla/Zid GA4 setup documentation.

---

### 3.6 Growth / CRO

Interim owner: `/growth/`

Variants:
- تحسين معدل التحويل
- CRO
- تحسين التحويل
- تحسين صفحات الهبوط
- تحسين تجربة التحويل
- تحليل funnel
- تحليل رحلة العميل
- تحسين أداء الموقع
- Growth audit
- تحسين النمو الرقمي

Intent:
Commercial specialist / problem-solution.

Rule:
Keep CRO on Growth until measured demand, proof, and service readiness justify a dedicated page.

---

### 3.7 Brand / visual identity / content

Current broad owner: `/brand-content/`

#### Visual identity
Dedicated-page candidate: Medium/high

Variants:
- تصميم هوية بصرية
- تصميم هوية تجارية
- شركة تصميم هوية بصرية
- تصميم هوية شركة
- تصميم شعار وهوية
- Brand Identity السعودية
- دليل هوية بصرية
- تطوير هوية بصرية
- إعادة تصميم هوية
- Rebranding
- نظام بصري للعلامة

Intent:
Transactional / commercial investigation.

Observed page expectation:
Strategy context, logo, color, typography, visual system, applications, guidelines, source assets.

Current fit:
Good content fit but mixed with positioning, design system, web copy, commerce copy, and campaign assets.

Decision:
Keep current hub as interim owner. Evaluate dedicated visual-identity service after quantitative validation.

#### Brand/content secondary clusters
Current owner: `/brand-content/`

Variants:
- استراتيجية علامة تجارية
- تموضع العلامة
- رسائل العلامة
- كتابة محتوى موقع
- كتابة صفحات خدمات
- محتوى متجر إلكتروني
- محتوى حملات
- Design System
- نظام واجهات للعلامة
- نبرة العلامة
- Brand Voice

These remain secondary clusters unless each becomes a real standalone offer with demand and proof.

---

### 3.8 Custom systems / software / integrations

Primary owner: `/custom-systems/`

#### Custom systems
Variants:
- تطوير أنظمة مخصصة
- برمجة أنظمة مخصصة
- شركة برمجة أنظمة
- نظام مخصص للشركة
- تطوير منصة مخصصة
- برمجة منصة SaaS
- تطوير بوابة إلكترونية
- لوحة تشغيل مخصصة
- بوابة عملاء
- نظام إدارة عمليات
- تطوير تطبيق أعمال

Intent:
Transactional B2B.

#### Integrations / API
Variants:
- ربط الأنظمة
- تكامل الأنظمة
- تكامل API
- ربط التطبيقات
- ربط CRM
- ربط ERP
- Webhooks
- مزامنة البيانات
- ربط المتجر بالأنظمة
- تكاملات دفع وشحن
- تكامل منصات

Intent:
Commercial specialist / problem-solution.

#### Automation
Variants:
- أتمتة الأعمال
- أتمتة العمليات
- أتمتة سير العمل
- Workflow Automation
- أتمتة المهام
- تقليل العمل اليدوي
- أتمتة المبيعات
- أتمتة خدمة العملاء
- أتمتة التقارير
- أتمتة بالذكاء الاصطناعي

Intent:
Mixed informational/commercial.

Commercial owner:
`/custom-systems/`

Future informational content:
- ما الذي يجب أتمتته أولًا؟
- كيف تحسب عائد الأتمتة؟
- ربط نظامين أم بناء نظام جديد؟
- API أم Webhook؟
- متى تحتاج بوابة عملاء؟

Positioning rule:
Preserve Ibtikar's “process before technology” approach. It matches both user need and market differentiation.

---

### 3.9 Tharaa / Salla theme

Primary owner: `/tharaa/`

Variants:
- ثيم سلة
- قالب سلة
- ثيم متجر سلة
- ثيم سلة احترافي
- ثيم سلة للعطور
- ثيم سلة للعناية
- ثيم سلة للهدايا
- ثيم ثراء
- قالب ثراء
- ثراء سلة

Intent:
Transactional product / navigational.

Boundary:
Tharaa owns theme/product intent, not agency-service intent such as “تصميم متجر سلة” or “إنشاء متجر سلة”.

---

### 3.10 Company / entity / proof

Homepage `/`
Primary role:
- ابتكار تك
- حلول رقمية للشركات
- شركة حلول رقمية السعودية
- شركة تقنية/رقمية تخدم السوق السعودي

`/services/`
Primary role:
- services/navigation hub;
- not a duplicate company homepage.

`/portfolio/`
Primary role:
- proof, projects, due diligence;
- not a generic service keyword landing page.

`/about/`
Primary role:
- entity/company trust.

`/contact/`
Primary role:
- conversion;
- not an acquisition-keyword landing page.

`/knowledge/`
Primary role:
- editorial discovery and topical navigation.

---

# PHASE 6 — KEYWORD-TO-PAGE OWNERSHIP

## 4. Canonical mapping table

| Keyword cluster | Search intent | Primary owner | Supporting pages | Required internal-link direction | Status |
| --- | --- | --- | --- | --- | --- |
| شركة حلول رقمية / حلول رقمية للشركات | Commercial/entity | `/` | `/services/`, `/about/`, `/portfolio/` | Home → categories; proof → real service | Existing |
| خدمات رقمية / خدمات ابتكار تك | Navigation/commercial hub | `/services/` | five category hubs | Services → categories | Existing |
| تصميم متجر سلة / تصميم متجر إلكتروني / حلول متاجر | Broad commercial | `/ecommerce/` | ecommerce children | Hub → child by user state | Existing / guarded |
| إنشاء متجر إلكتروني / إطلاق متجر / إنشاء متجر سلة | Transactional | `/services/store-launch/` | store-launch article, ecommerce hub | Article → service; hub → launch | Existing |
| خطوات إنشاء متجر / تجهيز قبل الإطلاق | Informational | `/knowledge/store-launch/` | launch service | Article → commercial owner | Existing |
| تخصيص متجر سلة / واجهة / ثيم | Transactional specialist | `/services/storefront-customization/` | redesign comparison + redesign | Article → appropriate choice | Existing |
| إعادة تصميم متجر / تطوير متجر قائم | Transactional specialist | `/services/store-redesign/` | comparison + product page | Comparison → redesign when fit | Existing |
| تخصيص أم إعادة تصميم | Comparison | `/knowledge/store-redesign/` | customization + redesign | Article → both distinct choices | Existing |
| تحسين صفحة المنتج | Commercial specialist | `/services/product-page-optimization/` | product article, growth | Article → service | Existing |
| كيفية تحسين صفحة المنتج | Informational | `/knowledge/product-page/` | product service | Article → service | Existing |
| سيو متجر إلكتروني / سيو سلة | Transactional specialist | `/services/ecommerce-growth/` interim | growth + future SEO | Ecommerce modifier only | Interim |
| قياس/تتبع متجر | Commercial specialist | `/services/ecommerce-growth/` | growth | Store-specific → general when scope expands | Existing |
| دعم/صيانة متجر | Transactional/retention | `/services/ecommerce-support/` | ecommerce, redesign, growth | Hub → support | Existing |
| تصميم موقع شركة / شركة تصميم مواقع | Transactional | `/websites/` | brand, growth, systems | Hub/Home → websites | Existing |
| تصميم صفحة هبوط | Transactional | `/websites/` interim | future landing page | Move ownership only after new page approval | Candidate |
| تصميم هوية بصرية | Transactional | `/brand-content/` interim | websites/ecommerce | Move ownership only after specialist approval | Candidate |
| محتوى/استراتيجية علامة | Commercial specialist | `/brand-content/` | websites/ecommerce/growth | Brand → implementation | Existing secondary |
| شركة سيو / خدمات SEO / تحسين محركات البحث | Commercial/transactional | Future general SEO page | growth, ecommerce-growth, future articles | Future SEO becomes generic commercial destination | GAP / P1 |
| SEO تقني / تدقيق SEO | Mixed specialist | Future SEO architecture | future guides | Parent first | Candidate |
| GA4 / tracking / قياس موقع | Commercial implementation | `/growth/` | ecommerce-growth | General → ecommerce when store-specific | Existing |
| CRO / تحسين معدل التحويل | Commercial specialist | `/growth/` interim | websites/ecommerce | Growth → implementation page | Interim |
| تطوير أنظمة مخصصة | Transactional B2B | `/custom-systems/` | websites/growth | Services → systems | Existing |
| ربط الأنظمة / API | Transactional specialist | `/custom-systems/` | growth when analytics-specific | Contextual | Existing |
| أتمتة الأعمال | Mixed | `/custom-systems/` commercial | future guide | Guide → systems | Existing |
| ثيم سلة / ثيم ثراء | Product/navigational | `/tharaa/` | ecommerce/customization when needed | Theme → broader service only by need | Existing |

---

## 5. High-risk cannibalization rules

### 5.1 `تصميم متجر سلة`

Primary owner:
`/ecommerce/`

Do not make these pages primary for the same broad phrase:
- store-launch;
- storefront-customization;
- store-redesign;
- product-page-optimization;
- Tharaa.

Use modifiers instead:
- إنشاء/إطلاق → store-launch;
- تخصيص/واجهة/ثيم → storefront-customization;
- إعادة تصميم/متجر قائم → store-redesign;
- صفحة المنتج → product-page-optimization;
- ثيم/قالب → Tharaa.

### 5.2 Generic SEO

Future general SEO page owns:
- شركة سيو السعودية;
- خدمات SEO;
- تحسين محركات البحث;
- شركة تحسين محركات البحث.

`/growth/` owns:
- measurement;
- tracking;
- CRO;
- reporting;
- visibility/growth hub.

`/services/ecommerce-growth/` owns:
- ecommerce SEO modifier;
- ecommerce analytics/tracking;
- store-specific growth.

Until a dedicated SEO page exists, do not aggressively optimize either current page around generic SEO head terms.

### 5.3 Websites vs landing pages

Current:
`/websites/` owns landing-page intent temporarily.

If a dedicated landing-page page is approved:
- new page becomes transactional owner;
- websites becomes parent/hub;
- duplicate landing-page copy is reduced;
- links point directly to the specialist page.

### 5.4 Brand-content vs visual identity

Current:
`/brand-content/` owns visual identity temporarily.

If specialist page is approved:
- specialist owns visual identity commercial head terms;
- brand-content remains broader ecosystem/hub;
- avoid duplicate service copy.

### 5.5 Tharaa vs ecommerce services

Tharaa:
theme/product only.

Ecommerce architecture:
agency/service intent.

No keyword-stuffed cross-over.

---

## 6. Supporting-content architecture

| Commercial owner | Supporting content | Intent |
| --- | --- | --- |
| store-launch | existing store-launch guide | Informational/how-to |
| product-page optimization | existing product-page guide | Informational/problem diagnosis |
| customization + redesign | existing comparison article | Commercial comparison |
| websites | future website brief/cost/how-to-choose guide | Informational/comparison |
| future SEO service | future indexing/technical/keyword-intent guides | Informational/topical authority |
| brand/identity | future identity brief/components guide | Informational |
| custom systems | future automation-first/process guide | Informational |
| growth | future measurement-plan/tracking guide | Informational |

Rule:
The supporting page answers “how/why/which”. The commercial page answers “can you do this for me / what is included / what happens next”.

---

## 7. Internal-link architecture

### Homepage
Prominent descriptive links to:
- Services;
- Ecommerce;
- Websites;
- Brand & Content;
- Growth;
- Custom Systems;
- Tharaa where product context exists.

### Services hub
Links to all five category hubs.

### Ecommerce hub
Links to all six specialist ecommerce pages with distinct anchor families.

Recommended anchor families:
- إنشاء وإطلاق متجر إلكتروني;
- تخصيص واجهة المتجر;
- إعادة تصميم متجر قائم;
- تحسين صفحة المنتج;
- قياس ونمو المتجر;
- الدعم والتطوير المستمر.

### Specialist ecommerce pages
Must link:
- back to Ecommerce hub;
- to the most relevant article;
- to a sibling only when it is a plausible next decision.

### Knowledge
Articles link to their commercial owners with descriptive, non-stuffed anchors.

### Future SEO page
Once created:
- Growth → SEO for generic SEO commercial need;
- knowledge → SEO;
- ecommerce-growth retains ecommerce-specific intent.

---

## 8. Page-creation decisions

### P1 candidate — Dedicated general SEO service
Evidence:
Strong intent separation; generic SEO commercial queries expect dedicated service pages.

Current problem:
Growth and ecommerce-growth mix multiple jobs.

Decision:
Highest-priority new service-page candidate, subject to offer scope approval.

### P2 candidate — Dedicated landing-page service
Evidence:
Distinct user task and frequent dedicated commercial landing pages.

Current problem:
Buried inside Websites.

Decision:
Validate quantitatively, then likely split if business priority supports it.

### P2 candidate — Dedicated visual-identity service
Evidence:
Distinct service-page pattern and clear commercial task.

Current problem:
Mixed into broad Brand + Content hub.

Decision:
Validate quantitatively, then consider split.

### P2/P3 candidate — Ecommerce SEO
Evidence:
Specialized Salla/ecommerce SEO services exist.

Current problem:
Current ecommerce-growth is not pure SEO.

Decision:
Wait until general SEO architecture is established.

### Do not create now
- basic GA4 setup page;
- one SEO page for every platform;
- thin Riyadh/Jeddah city doorway pages;
- separate API page for every vendor;
- generic “best company” pages;
- pages created only from exact-match keyword variants.

---

## 9. Priority map for existing pages

### P1 — Optimize existing strong owners
1. `/ecommerce/`
2. `/services/store-launch/`
3. `/services/storefront-customization/`
4. `/services/store-redesign/`
5. `/services/product-page-optimization/`
6. `/websites/`
7. `/custom-systems/`
8. `/tharaa/`

### P2 — Clarify mixed owners
1. `/growth/`
2. `/services/ecommerce-growth/`
3. `/brand-content/`

### P3 — Supporting/content proof
1. Knowledge content expansion
2. Portfolio-to-service relevance links
3. About/entity strengthening

---

## 10. On-page ownership contract

Every acquisition page must have:

1. one primary keyword cluster;
2. one dominant user task;
3. a small set of closely related secondary variants/entities;
4. title/H1 consistent with the page role;
5. sections that answer scope, fit, proof, process, limits, and next action;
6. natural keyword language rather than repetition blocks;
7. contextual internal links to parent/supporting pages;
8. no duplicate service role already owned by another canonical page.

A new public acquisition URL must update:
- this master;
- `KEYWORD_TO_PAGE_MAP.md` if still maintained;
- `INDEXATION_MAP.md`;
- sitemap source only after indexation approval.

---

## 11. Saudi modifier policy

Use national/location modifiers only when they make sense for the actual proposition:
- السعودية;
- السوق السعودي;
- الرياض / جدة / الشرقية only when there is genuine location-specific evidence/value.

Do not build city doorway pages merely to repeat:
`تصميم مواقع الرياض`, `تصميم مواقع جدة`, etc.

A local page requires a distinct local proposition, evidence, service-area facts, or genuinely different useful content.

---

## 12. Platform-modifier policy

Supported platforms may appear naturally:
- Salla;
- Zid;
- Shopify;
- WooCommerce;
- WordPress;
- GA4;
- Google Tag Manager.

Do not multiply every service × platform into a URL.

Create platform-specific pages only when:
- intent is materially distinct;
- delivery scope differs;
- content can provide platform-specific depth;
- quantitative demand supports it;
- cannibalization is controlled.

---

## 13. Evidence and proof requirements

Do not copy market claims such as:
- “#1”;
- guaranteed first page;
- guaranteed sales;
- unverified project counts;
- fake performance statistics.

Ibtikar pages should use proof that can be verified:
- real project/case evidence;
- platform capability;
- documented process;
- clear exclusions;
- deliverables;
- screenshots/demos where owned/authorized;
- actual measurement data where available.

---

## 14. Qualitative evidence snapshot

Current Saudi/Arabic result samples used to validate intent separation include:

- Salla official guidance for store design/customization;
- Saudi Salla/Zid store-design service pages;
- dedicated landing-page services in Saudi Arabia;
- dedicated Saudi SEO service pages;
- dedicated visual-identity pages;
- Saudi corporate website-design pages;
- custom-system development service pages;
- Saudi workflow/business automation providers;
- official platform analytics documentation.

This evidence establishes query intent and expected page type, not exact ranking or search-volume estimates.

---

## 15. Quantitative research backlog

For each Tier-1 cluster, append when a trustworthy source becomes available:

- Saudi monthly search volume;
- KD;
- CPC;
- trend;
- SERP feature presence;
- top ranking pages/domains;
- GSC impressions;
- GSC clicks;
- average position;
- conversions/inquiries;
- assisted conversions;
- query-to-page overlap.

Priority should combine:
business value + intent fit + evidence + attainable opportunity + implementation effort.

Do not allow a volume number alone to override user intent or architecture.

---

## 16. Phase 5 + 6 completion criteria

Phase 5 is considered complete when:
- all principal service families are researched;
- commercial vs informational vs comparison intent is separated;
- page-type expectation is documented;
- architecture gaps are identified;
- unsupported numerical claims are excluded.

Phase 6 is considered complete when:
- every Tier-1 cluster has exactly one primary owner or an explicit unresolved gap;
- supporting pages have a non-competing role;
- internal-link direction is defined;
- high-risk cannibalization rules are explicit;
- new-page candidates are prioritized;
- on-page implementation can proceed page by page without changing ownership ad hoc.

Current status:
Both phases are structurally complete at qualitative level.
Quantitative validation remains pending and must be layered onto this master when reliable data becomes available.

---

## 17. Canonical companion documents

This master consolidates the decision layer.

Supporting technical documents:
- `docs/seo/INDEXATION_MAP.md`
- `docs/seo/ONPAGE_PAGE_BRIEFS.md`
- `docs/seo/INTERNAL_LINKING_MAP.md`
- `docs/seo/STRUCTURED_DATA_PLAN.md`

Historical/working keyword documents:
- `docs/seo/SERP_INTENT_RESEARCH_SA.md`
- `docs/seo/KEYWORD_TO_PAGE_MAP.md`
- `docs/seo/KEYWORD_INTENT_MAP.md`

If ownership wording differs, this master is the canonical decision source until a newer approved version replaces it.
