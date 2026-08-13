# Ibtikar Tech Dashboard

منصة الباك إند، الموقع الديناميكي، CRM، بوابة العميل، ولوحة التشغيل الداخلية لمنصة **ابتكار تك للحلول والخدمات الرقمية**.

> **Status:** Architecture baseline / pre-implementation foundation
>
> هذا الملف هو **المرجع الرئيسي الشامل لبنية المشروع كاملة**: الموقع العام، الصفحات، الخدمات، الحساب، بوابة العميل، لوحة الموظفين، الـCRM، المبيعات، المشاريع، المحتوى، التكاملات، والبيانات. أي مطور أو Agent يجب أن يبدأ من هذا الملف ثم يراجع `AGENTS.md` و`docs/architecture/ERD.md` و`docs/architecture/DECISIONS.md` قبل تغيير قرار جوهري.

---

# 1. ما الذي نبنيه؟

ابتكار تك ليست مجرد موقع وكالة، وليست متجر خدمات تقليديًا، وليست SaaS أو Marketplace في V1.

نحن نبني **منصة تشغيل أعمال متخصصة للخدمات الرقمية** تتكون من أربع واجهات/طبقات استخدام مترابطة فوق Backend واحد وقاعدة بيانات واحدة:

```text
                         IBTIKAR TECH PLATFORM
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        │                         │                          │
  PUBLIC WEBSITE            CUSTOMER PORTAL             CONTROL PANEL
  الموقع العام               بوابة العميل               لوحة الموظفين
        │                         │                          │
        └─────────────────────────┼──────────────────────────┘
                                  │
                         DJANGO DOMAIN LAYER
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
             CRM                SALES              PROJECTS
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                             POSTGRESQL
                                  │
                           INTEGRATIONS
                    WhatsApp / Email / Salla / Future
```

المنصة تجمع في نظام واحد:

- الموقع العام وصفحات التسويق والمحتوى.
- دليل الخدمات وأسعارها وتفاصيلها.
- صفحة عرض ثيم **ثراء**.
- حساب عميل اختياري.
- بوابة عميل.
- CRM موحد للعملاء والشركات والمتاجر.
- استقبال الاستفسارات وتحويلها إلى فرص بيع.
- المتابعة التجارية وعروض الأسعار.
- إدارة المشاريع والمراحل والملفات والموافقات.
- الدعم الفني والتذاكر.
- التسويق والمصادر وUTM والإسناد Attribution.
- التحليلات والأحداث المهمة.
- لوحة تشغيل موظفين واحدة تحت `/control/`.
- إدارة المحتوى عبر Wagtail.
- تكاملات واتساب والبريد وسلة وغيرها عند الحاجة.
- إمكانية إضافة الطلبات والمدفوعات والفواتير مستقبلًا دون إعادة بناء الـCRM.

السوق الأساسي: **السعودية أولًا ثم الخليج**، مع العربية وRTL كحالة استخدام أساسية.

---

# 2. القرارات المعمارية غير القابلة للكسر دون ADR جديد

## 2.1 الخدمات

```text
ServiceCategory
      ↓
   Service
```

فقط.

لا توجد في V1:

```text
ServiceFamily ❌
ServicePackage ❌
ServiceAddon ❌
```

الخدمة نفسها تحمل السعر والتفاصيل والمدة والنطاق والمخرجات والمتطلبات وطريقة الإجراء.

## 2.2 ثراء

**ثراء صفحة عرض وتسويق داخل Wagtail فقط في V1.**

- ليست `Service`.
- ليست `Product` business model.
- لا يوجد `products/` app حاليًا.
- لا توجد License / Inventory / Order خاصة بثراء داخل المنصة.
- الشراء يتم خارجيًا عبر متجر ثيمات سلة.
- يمكن للصفحة عرض خدمات مرتبطة من `Service`.
- الضغط على المعاينة أو الشراء يسجل كـ`AnalyticsEvent` فقط.

## 2.3 الهوية والعميل

```text
User = Authentication Identity
Contact = CRM Person
```

- يمكن أن يوجد `Contact` بلا `User`.
- يمكن ربط Contact موجود بحساب لاحقًا دون فقدان التاريخ.
- الحساب اختياري ولا يمنع التصفح أو مشاهدة الأسعار أو الاستفسار أو التواصل.

## 2.4 واتساب

```text
whatsapp_click = AnalyticsEvent
```

ولا ينشئ تلقائيًا:

```text
Contact ❌
Inquiry ❌
Opportunity ❌
```

إلا عند وجود تفاعل تجاري حقيقي قابل للإثبات.

## 2.5 مسار المبيعات

```text
Inquiry
   ↓
Opportunity
   ↓
Quote
   ↓
Project
```

Account status وCRM lifecycle وOpportunity stage مفاهيم مستقلة.

## 2.6 التجارة الإلكترونية

`Order / Payment / Invoice / Refund` ليست ضمن V1. يتم توثيق حدودها فقط وإضافتها عندما يصبح الدفع المباشر مطلوبًا.

## 2.7 الأسلوب الهندسي

- Modular Monolith.
- لا Microservices في V1.
- لا React Admin منفصلة.
- Wagtail هو shell لوحة التشغيل `/control/`.
- Business models مستقلة عن Wagtail Page Tree.
- الواجهة الحالية لابتكار تك تُدمج في Django Templates **مع الحفاظ على الهوية وأسلوب العرض** بدل إعادة تصميمها من الصفر.

---

# 3. التقنية المعتمدة

- **Python**.
- **Django 5.2 LTS**.
- **Wagtail 7.4 LTS** بأحدث Patch مدعوم.
- **PostgreSQL**.
- **Django Templates**.
- **HTMX / JavaScript خفيف** للتفاعلات التي تستفيد منه.
- **django-allauth** للمصادقة والتحقق واستعادة الحساب.
- **S3-compatible storage** للصور والملفات في الإنتاج.
- **Redis + Celery** فقط عند وجود مهام خلفية فعلية.
- API endpoints محددة عند الحاجة، وليس API-first بلا سبب.
- Environment Variables للأسرار والمفاتيح.

---

# 4. حدود الواجهات الثلاث

## 4.1 Public Website

واجهة الزائر والتسويق والتحويل.

مسؤولياتها:

- الصفحة الرئيسية.
- الحلول.
- الخدمات والتصنيفات وصفحة الخدمة.
- صفحات المنصات.
- صفحة ثراء.
- الأعمال ودراسات الحالة.
- المعرفة والمقالات.
- عن ابتكار تك.
- التواصل وبدء المشروع.
- الصفحات القانونية.
- CTA واتساب / استشارة / طلب عرض سعر.

لا تتطلب تسجيل دخول.

## 4.2 Customer Portal

واجهة العميل المسجل فقط.

مسؤولياتها حسب ما هو مفعّل:

- نظرة عامة.
- بيانات الحساب.
- المتاجر.
- الخدمات المحفوظة.
- الاستفسارات/الطلبات ذات الصلة به.
- عروض الأسعار.
- المشاريع والمراحل والتحديثات.
- الملفات والموافقات.
- الدعم.
- تفضيلات التواصل والأمان.

لا نظهر قسمًا فارغًا قبل تشغيل ميزته فعليًا.

## 4.3 Control Panel `/control/`

واجهة موظفي ابتكار تك فقط، وهي **Ibtikar OS** التشغيلية.

تجمع:

- Dashboard.
- الخدمات.
- CRM.
- المبيعات.
- المشاريع.
- الدعم.
- المحتوى.
- التسويق.
- التحليلات.
- الإعدادات والصلاحيات.

Wagtail Admin هو الـShell، مع ModelViewSets للشاشات القياسية وCustom Operational Views للشاشات المعقدة.

---

# 5. هيكل المستودع المستهدف

```text
ibtikartech-dashboard/
│
├── manage.py
├── pyproject.toml
├── README.md
├── AGENTS.md
├── .env.example
├── .gitignore
│
├── config/
│   ├── __init__.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── settings/
│       ├── __init__.py
│       ├── base.py
│       ├── local.py
│       ├── test.py
│       └── production.py
│
├── apps/
│   ├── __init__.py
│   │
│   ├── core/
│   ├── accounts/
│   ├── crm/
│   ├── services/
│   ├── sales/
│   ├── customer_portal/
│   ├── projects/
│   ├── support/
│   ├── marketing/
│   ├── analytics/
│   ├── content/
│   └── integrations/
│
├── templates/
│   ├── layouts/
│   │   ├── public_base.html
│   │   ├── account_base.html
│   │   └── portal_base.html
│   │
│   ├── components/
│   │   ├── public/
│   │   ├── portal/
│   │   └── control/
│   │
│   ├── account/
│   ├── portal/
│   ├── errors/
│   └── wagtailadmin/
│
├── static/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── utilities.css
│   │   ├── components/
│   │   ├── pages/
│   │   ├── portal/
│   │   └── control/
│   │
│   ├── js/
│   │   ├── core/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── portal/
│   │   └── control/
│   │
│   ├── images/
│   └── icons/
│
├── media/                  # local development only
│
├── locale/
│   ├── ar/
│   └── en/
│
├── tests/
│   └── e2e/
│       ├── public/
│       ├── portal/
│       └── control/
│
├── docs/
│   └── architecture/
│       ├── ERD.md
│       └── DECISIONS.md
│
└── scripts/
    ├── bootstrap.sh
    ├── check.sh
    └── deploy/
```

---

# 6. الهيكل القياسي داخل كل Django App

```text
app_name/
├── __init__.py
├── apps.py
├── models.py                  # أو models/ عند كبر المجال
├── choices.py                 # TextChoices / enums
├── services.py                # write/business operations
├── selectors.py               # read/query logic المعقد
├── forms.py
├── urls.py                    # إذا كان للتطبيق routes
├── views.py
├── permissions.py
├── wagtail_hooks.py           # control panel integration
├── signals.py                 # عند وجود سبب واضح فقط
├── migrations/
│   └── __init__.py
├── templates/
│   └── app_name/
├── static/
│   └── app_name/              # فقط إذا كان الأصل خاصًا بالتطبيق
└── tests/
    ├── test_models.py
    ├── test_services.py
    ├── test_permissions.py
    └── test_views.py
```

**قاعدة:** لا نضع Business Logic ثقيلًا داخل Views أو Templates أو Signals.

---

# 7. Frontend Architecture

## 7.1 قاعدة الفصل

```text
CONTENT DATA        → Wagtail Pages / Settings
BUSINESS DATA       → Django Domain Models
PRESENTATION        → Django Templates
SHARED UI           → Template Components + CSS/JS
INTERACTION         → HTMX / lightweight JS
```

لا نكرر محتوى الصفحة داخل HTML إذا كان من المفترض أن يديره فريق ابتكار تك من `/control/`.

## 7.2 Layouts

### `public_base.html`

يشمل:

- `<head>` / SEO defaults.
- Header.
- Mega menu / mobile navigation.
- Breadcrumb region.
- Main content slot.
- Global CTA.
- Footer.
- Cookie/consent UI عند الحاجة.
- Scripts المشتركة.

### `account_base.html`

لصفحات:

- تسجيل الدخول.
- إنشاء الحساب.
- التحقق من البريد.
- استعادة كلمة المرور.

يكون أبسط بصريًا من الموقع العام ويركز على المهمة.

### `portal_base.html`

يشمل:

- Portal header.
- Account navigation/sidebar.
- Mobile navigation.
- Alerts/notifications region.
- Main content.

## 7.3 Public UI Components

```text
templates/components/public/
├── header.html
├── mega_menu.html
├── mobile_menu.html
├── footer.html
├── breadcrumbs.html
├── section_heading.html
├── hero.html
├── service_card.html
├── service_category_card.html
├── related_service_card.html
├── platform_card.html
├── portfolio_card.html
├── case_study_card.html
├── article_card.html
├── testimonial_card.html
├── faq.html
├── stats.html
├── process_steps.html
├── trust_strip.html
├── pagination.html
├── empty_state.html
├── form_field.html
├── form_errors.html
├── whatsapp_cta.html
└── global_cta.html
```

لا نكرر نفس Header/Footer/FAQ/Button markup بين الصفحات.

## 7.4 Portal Components

```text
templates/components/portal/
├── portal_nav.html
├── page_header.html
├── metric_card.html
├── status_badge.html
├── timeline.html
├── project_progress.html
├── project_stage.html
├── quote_card.html
├── file_row.html
├── approval_card.html
├── ticket_card.html
├── empty_state.html
└── confirmation_dialog.html
```

## 7.5 Control Components

Custom control views تستخدم مكونات وظيفية متسقة:

```text
templates/components/control/
├── page_header.html
├── metric_card.html
├── filter_bar.html
├── status_badge.html
├── timeline.html
├── customer_summary.html
├── activity_feed.html
├── pipeline_column.html
├── project_progress.html
├── quick_actions.html
└── empty_state.html
```

أما شاشات Wagtail الأصلية فلا نعيد بناءها دون حاجة؛ نستخدم امتدادات Wagtail الرسمية ونخصص فقط ما يخدم التجربة.

---

# 8. هيكل صفحات الموقع العام

```text
PUBLIC WEBSITE
│
├── /
│   └── الرئيسية
│
├── /solutions/
│   └── صفحات الحلول التسويقية عند الحاجة
│
├── /services/
│   ├── دليل الخدمات
│   ├── /services/<category>/
│   │   └── صفحة التصنيف
│   └── /services/<category>/<service>/
│       └── صفحة الخدمة
│
├── /platforms/
│   ├── /platforms/salla/
│   ├── /platforms/zid/
│   ├── /platforms/shopify/
│   ├── /platforms/wordpress/
│   └── منصات مستقبلية
│
├── /tharaa/
│   └── صفحة عرض ثراء
│
├── /portfolio/
│   ├── الأعمال
│   └── /portfolio/<slug>/
│
├── /case-studies/
│   └── /case-studies/<slug>/
│
├── /knowledge/
│   ├── المقالات/الأدلة
│   └── /knowledge/<slug>/
│
├── /about/
├── /contact/
├── /start-project/
│
├── /legal/
│   ├── /legal/privacy/
│   ├── /legal/terms/
│   └── صفحات قانونية إضافية
│
└── /accounts/
    ├── login/
    ├── signup/
    ├── logout/
    ├── password/reset/
    └── email/verify/
```

## 8.1 الصفحة الرئيسية `HomePage`

تدار عبر Wagtail وتحافظ على هوية الواجهة المعتمدة.

حقول/Blocks مقترحة:

```text
HomePage
├── hero_eyebrow
├── hero_title
├── hero_description
├── primary_cta_label
├── primary_cta_url
├── secondary_cta_label
├── secondary_cta_url
├── featured_services
├── featured_platforms
├── tharaa_promo
├── portfolio_items
├── case_studies
├── testimonials
├── trust_content
├── faq
├── final_cta
├── seo_title
├── search_description
└── social_image
```

## 8.2 الحلول `SolutionPage`

صفحات تسويقية تبدأ من مشكلة/هدف العميل، وليست طبقة داخل Service.

```text
SolutionPage
├── title
├── intro
├── hero_media
├── problem_statement
├── outcomes
├── related_services
├── related_platforms
├── case_studies
├── faq
├── cta
└── SEO
```

## 8.3 صفحة المنصة `PlatformPage`

صفحة تجميع Editorial Landing Page.

```text
PlatformPage
├── title
├── platform_name
├── intro
├── logo/media
├── related_services
├── featured_work
├── related_articles
├── faq
├── cta
└── SEO
```

مثال صفحة سلة تعرض خدمات سلة + ثراء + أعمال سلة + محتوى سلة.

## 8.4 صفحة ثراء `TharaaPage`

ثراء صفحة عرض وليست Product entity.

```text
TharaaPage
├── title
├── eyebrow
├── hero_title
├── hero_description
├── hero_media
├── demo_url
├── marketplace_url
├── displayed_price
├── value_proposition
├── features
├── industries
├── screenshots
├── demo_sections
├── trust_content
├── related_services
├── documentation_links
├── faq
├── changelog_content/links
├── support_content
├── final_cta
├── seo_title
├── search_description
└── social_image
```

Clicks المهمة:

```text
tharaa_demo_click
tharaa_marketplace_click
tharaa_related_service_click
```

تسجل في `AnalyticsEvent`.

## 8.5 صفحة المقال `ArticlePage`

```text
ArticlePage
├── title
├── excerpt
├── cover_image
├── author/display_author
├── published_at
├── categories/tags
├── body
├── related_articles
├── related_services
├── CTA
└── SEO
```

## 8.6 CaseStudyPage / PortfolioPage

```text
CaseStudyPage
├── client_name
├── title
├── challenge
├── solution
├── scope
├── platform
├── services_used
├── media/gallery
├── verified_results
├── testimonial optional
├── CTA
└── SEO
```

لا نعرض نتائج أو أرقامًا غير مثبتة.

## 8.7 LegalPage

```text
LegalPage
├── title
├── effective_date
├── last_updated
├── body
└── SEO/noindex control when appropriate
```

---

# 9. صفحات الخدمات

الخدمات Business Domain وليست Wagtail Page Tree.

## 9.1 ServiceCategory

```text
ServiceCategory
├── id                  UUIDField PK
├── name                CharField
├── slug                SlugField unique
├── short_description   TextField blank
├── description         RichText/structured content blank
├── icon                Image/File reference blank
├── image               Image reference blank
├── seo_title           CharField blank
├── seo_description     TextField blank
├── sort_order          PositiveIntegerField default 0
├── is_active           BooleanField default True
├── created_at          DateTimeField auto_now_add
└── updated_at          DateTimeField auto_now
```

Indexes:

- `slug` unique.
- `(is_active, sort_order)`.

## 9.2 Service

```text
Service
├── id                    UUIDField PK
├── category              FK ServiceCategory PROTECT
├── name                  CharField
├── slug                  SlugField unique
├── short_description     TextField
├── description           RichText/StreamField
├── price_type            CharField choices
├── price                 DecimalField nullable
├── currency              CharField default SAR
├── delivery_time         CharField blank
├── scope                 structured content
├── exclusions            structured content
├── deliverables          structured content
├── requirements          structured content
├── process               structured content
├── revision_policy       structured content
├── faq                   structured content
├── featured_image        image nullable
├── gallery               structured media blank
├── related_services      M2M self blank
├── action_type           CharField choices
├── action_url            URLField blank
├── is_featured           BooleanField default False
├── is_active             BooleanField default True
├── sort_order            PositiveIntegerField default 0
├── seo_title             CharField blank
├── seo_description       TextField blank
├── social_image          image nullable
├── created_at            DateTimeField auto_now_add
└── updated_at            DateTimeField auto_now
```

`price_type`:

```text
FIXED
STARTING_FROM
QUOTE
FREE
```

`action_type`:

```text
WHATSAPP
REQUEST_QUOTE
INTERNAL_CHECKOUT   # future-ready; لا يستخدم قبل التجارة
EXTERNAL_CHECKOUT
DISABLED
```

صفحة الخدمة تعرض:

1. النتيجة/الوعد.
2. الوصف المختصر.
3. السعر ونوعه.
4. لمن تناسب.
5. المخرجات.
6. نطاق العمل.
7. ما لا يشمله.
8. المتطلبات.
9. مدة التنفيذ.
10. مراحل التنفيذ.
11. سياسة التعديلات.
12. أعمال/حالات مرتبطة عند توفرها.
13. FAQ.
14. خدمات مرتبطة.
15. CTA واضح.

لا توجد Packages/Add-ons كطبقة تجارية مستقلة.

---

# 10. Accounts

## 10.1 User

هوية المصادقة فقط.

```text
User
├── id                  UUIDField PK
├── email               EmailField unique
├── password            Django hash
├── first_name          CharField blank
├── last_name           CharField blank
├── is_active           BooleanField
├── is_staff            BooleanField
├── is_superuser        BooleanField
├── email_verified_at   DateTimeField nullable
├── last_login          DateTimeField nullable
└── date_joined         DateTimeField
```

- `USERNAME_FIELD = email`.
- لا username تقليدي.

## 10.2 StaffProfile

```text
StaffProfile
├── id           UUIDField PK
├── user         OneToOne User CASCADE
├── job_title    CharField blank
├── department   CharField blank
├── phone        CharField blank
├── avatar       ImageField blank
├── status       CharField choices
├── created_at   DateTimeField
└── updated_at   DateTimeField
```

الأدوار الأساسية تعتمد على Django Groups + Permissions.

---

# 11. CRM

## 11.1 Contact

الشخص داخل CRM سواء لديه حساب أم لا.

```text
Contact
├── id                   UUIDField PK
├── user                 OneToOne User SET_NULL nullable unique
├── full_name            CharField
├── email                EmailField blank/indexed
├── phone                CharField blank/indexed
├── lifecycle_stage      CharField choices/indexed
├── status               CharField choices/indexed
├── preferred_language   CharField default ar
├── owner                FK User SET_NULL nullable
├── first_source         CharField blank
├── first_contact_at     DateTimeField nullable
├── last_activity_at     DateTimeField nullable/indexed
├── created_at           DateTimeField
└── updated_at           DateTimeField
```

Lifecycle:

```text
LEAD
QUALIFIED
CUSTOMER
REPEAT_CUSTOMER
INACTIVE
```

## 11.2 Organization

```text
Organization
├── id          UUIDField PK
├── name        CharField indexed
├── legal_name  CharField blank
├── website     URLField blank
├── industry    CharField blank
├── status      CharField choices
├── created_at  DateTimeField
└── updated_at  DateTimeField
```

## 11.3 OrganizationContact

```text
OrganizationContact
├── id              UUIDField PK
├── organization    FK Organization CASCADE
├── contact         FK Contact CASCADE
├── role_title      CharField blank
├── is_primary      BooleanField default False
└── created_at      DateTimeField
```

Unique constraint: `(organization, contact)`.

## 11.4 Store

```text
Store
├── id                   UUIDField PK
├── primary_contact      FK Contact SET_NULL nullable
├── organization         FK Organization SET_NULL nullable
├── name                 CharField
├── url                  URLField
├── platform             CharField choices/indexed
├── external_store_id    CharField blank
├── status               CharField choices
├── notes                TextField blank
├── created_at           DateTimeField
└── updated_at           DateTimeField
```

Platforms:

```text
SALLA
ZID
SHOPIFY
WOOCOMMERCE
WORDPRESS
CUSTOM
OTHER
```

## 11.5 ConsentRecord

سجل Append-only للموافقات.

```text
ConsentRecord
├── id              UUIDField PK
├── contact         FK Contact CASCADE
├── channel         CharField choices/indexed
├── purpose         CharField
├── status          CharField choices/indexed
├── source          CharField
├── policy_version  CharField
├── granted_at      DateTimeField nullable
├── withdrawn_at    DateTimeField nullable
├── ip_address      GenericIPAddressField nullable
├── user_agent      TextField blank
└── created_at      DateTimeField
```

Channels:

```text
EMAIL
WHATSAPP
SMS
```

Status:

```text
GRANTED
WITHDRAWN
```

## 11.6 ActivityEvent

Timeline تشغيلي للـCRM وليس Web Analytics.

```text
ActivityEvent
├── id              UUIDField PK
├── contact         FK Contact CASCADE
├── actor_user      FK User SET_NULL nullable
├── event_type      CharField indexed
├── reference_type  CharField blank
├── reference_id    UUID/Char blank
├── title           CharField
├── description     TextField blank
├── metadata        JSONField default dict
└── created_at      DateTimeField indexed
```

---

# 12. Sales

## 12.1 Inquiry

أول تفاعل تجاري حقيقي.

```text
Inquiry
├── id                 UUIDField PK
├── contact            FK Contact CASCADE
├── service            FK Service SET_NULL nullable
├── store              FK Store SET_NULL nullable
├── inquiry_type       CharField choices
├── message            TextField
├── requirements_data  JSONField default dict
├── source             CharField blank/indexed
├── status             CharField choices/indexed
├── assigned_to        FK User SET_NULL nullable
├── created_at         DateTimeField indexed
└── updated_at         DateTimeField
```

Types:

```text
SERVICE
CONSULTATION
QUOTE
GENERAL
```

Status:

```text
NEW
REVIEWING
RESPONDED
CONVERTED
CLOSED
SPAM
```

## 12.2 Opportunity

```text
Opportunity
├── id                    UUIDField PK
├── contact               FK Contact CASCADE
├── organization          FK Organization SET_NULL nullable
├── store                 FK Store SET_NULL nullable
├── inquiry               FK Inquiry SET_NULL nullable
├── service               FK Service SET_NULL nullable
├── title                 CharField
├── stage                 CharField choices/indexed
├── estimated_value       DecimalField nullable
├── currency              CharField default SAR
├── assigned_to           FK User SET_NULL nullable
├── expected_close_date   DateField nullable
├── lost_reason           TextField blank
├── created_at            DateTimeField
├── updated_at            DateTimeField
└── closed_at             DateTimeField nullable
```

Pipeline:

```text
NEW
CONTACTED
QUALIFIED
QUOTE_SENT
NEGOTIATION
WON
LOST
```

## 12.3 FollowUpTask

```text
FollowUpTask
├── id              UUIDField PK
├── opportunity     FK Opportunity CASCADE
├── contact         FK Contact SET_NULL nullable
├── assigned_to     FK User SET_NULL nullable
├── title           CharField
├── description     TextField blank
├── task_type       CharField choices
├── status          CharField choices/indexed
├── due_at          DateTimeField indexed
├── completed_at    DateTimeField nullable
└── created_at      DateTimeField
```

## 12.4 Quote

```text
Quote
├── id                UUIDField PK
├── quote_number      CharField unique
├── opportunity       FK Opportunity CASCADE
├── contact           FK Contact PROTECT
├── organization      FK Organization SET_NULL nullable
├── status            CharField choices/indexed
├── currency          CharField default SAR
├── subtotal          DecimalField
├── discount_total    DecimalField default 0
├── tax_total         DecimalField default 0
├── grand_total       DecimalField
├── valid_until       DateField nullable
├── notes             TextField blank
├── terms             TextField blank
├── sent_at           DateTimeField nullable
├── accepted_at       DateTimeField nullable
├── rejected_at       DateTimeField nullable
├── created_by        FK User PROTECT
├── created_at        DateTimeField
└── updated_at        DateTimeField
```

Status:

```text
DRAFT
SENT
VIEWED
ACCEPTED
REJECTED
EXPIRED
CANCELLED
```

## 12.5 QuoteItem

Financial snapshot.

```text
QuoteItem
├── id                    UUIDField PK
├── quote                 FK Quote CASCADE
├── service               FK Service SET_NULL nullable
├── service_name_snapshot CharField
├── description_snapshot  TextField blank
├── quantity              DecimalField default 1
├── unit_price            DecimalField
├── discount              DecimalField default 0
├── tax                   DecimalField default 0
├── total                 DecimalField
└── sort_order            PositiveIntegerField default 0
```

تغيير سعر Service لاحقًا لا يغيّر العرض القديم.

---

# 13. Customer Portal

## 13.1 Routes

```text
/portal/
├── overview/
├── profile/
├── stores/
├── saved-services/
├── inquiries/
├── quotes/
├── projects/
│   └── <project_id>/
├── files/
├── approvals/
├── support/
│   └── <ticket_id>/
├── preferences/
└── security/
```

لا تُفعّل route في الواجهة قبل تشغيل ميزتها.

## 13.2 SavedService

```text
SavedService
├── id          UUIDField PK
├── contact     FK Contact CASCADE
├── service     FK Service CASCADE
└── created_at  DateTimeField
```

Unique constraint: `(contact, service)`.

## 13.3 CustomerPreference

```text
CustomerPreference
├── id                  UUIDField PK
├── contact             OneToOne Contact CASCADE
├── default_store       FK Store SET_NULL nullable
├── language            CharField default ar
├── timezone            CharField default Asia/Riyadh
├── portal_preferences  JSONField default dict
├── created_at          DateTimeField
└── updated_at          DateTimeField
```

Consent لا يوضع هنا؛ له `ConsentRecord` مستقل.

---

# 14. Projects

## 14.1 Project

```text
Project
├── id                   UUIDField PK
├── project_number       CharField unique
├── quote                FK Quote SET_NULL nullable
├── contact              FK Contact PROTECT
├── organization         FK Organization SET_NULL nullable
├── store                FK Store SET_NULL nullable
├── name                 CharField
├── description          TextField blank
├── status               CharField choices/indexed
├── progress_percentage  PositiveSmallIntegerField default 0
├── manager              FK User SET_NULL nullable
├── start_date           DateField nullable
├── due_date             DateField nullable/indexed
├── completed_at         DateTimeField nullable
├── created_at           DateTimeField
└── updated_at           DateTimeField
```

Status:

```text
PLANNING
WAITING_CLIENT
IN_PROGRESS
REVIEW
REVISION
COMPLETED
ON_HOLD
CANCELLED
```

## 14.2 ProjectStage

```text
ProjectStage
├── id            UUIDField PK
├── project       FK Project CASCADE
├── name          CharField
├── description   TextField blank
├── status        CharField choices/indexed
├── sort_order    PositiveIntegerField
├── start_date    DateField nullable
├── due_date      DateField nullable
└── completed_at  DateTimeField nullable
```

Status:

```text
PENDING
ACTIVE
COMPLETED
SKIPPED
```

## 14.3 ProjectUpdate

```text
ProjectUpdate
├── id          UUIDField PK
├── project     FK Project CASCADE
├── stage       FK ProjectStage SET_NULL nullable
├── author      FK User SET_NULL nullable
├── title       CharField
├── body        TextField
├── visibility  CharField choices/indexed
└── created_at  DateTimeField indexed
```

Visibility:

```text
INTERNAL
CUSTOMER
```

## 14.4 ProjectFile

```text
ProjectFile
├── id           UUIDField PK
├── project      FK Project CASCADE
├── uploaded_by  FK User SET_NULL nullable
├── file         FileField
├── name         CharField
├── file_type    CharField blank
├── visibility   CharField choices
├── category     CharField choices/indexed
└── created_at   DateTimeField
```

Categories:

```text
REQUIREMENT
DESIGN
DELIVERABLE
CONTRACT
REFERENCE
OTHER
```

## 14.5 Approval

```text
Approval
├── id                       UUIDField PK
├── project                  FK Project CASCADE
├── title                    CharField
├── description              TextField blank
├── requested_by             FK User SET_NULL nullable
├── requested_from_contact   FK Contact PROTECT
├── status                   CharField choices/indexed
├── requested_at             DateTimeField
├── responded_at             DateTimeField nullable
└── response_note            TextField blank
```

Status:

```text
PENDING
APPROVED
CHANGES_REQUESTED
REJECTED
```

---

# 15. Support

## 15.1 SupportTicket

```text
SupportTicket
├── id             UUIDField PK
├── ticket_number  CharField unique
├── contact        FK Contact PROTECT
├── project        FK Project SET_NULL nullable
├── subject        CharField
├── description    TextField
├── priority       CharField choices/indexed
├── status         CharField choices/indexed
├── assigned_to    FK User SET_NULL nullable
├── created_at     DateTimeField indexed
├── updated_at     DateTimeField
└── closed_at      DateTimeField nullable
```

Status:

```text
OPEN
IN_PROGRESS
WAITING_CUSTOMER
RESOLVED
CLOSED
```

## 15.2 TicketMessage

```text
TicketMessage
├── id                 UUIDField PK
├── ticket             FK SupportTicket CASCADE
├── sender_user        FK User SET_NULL nullable
├── sender_contact     FK Contact SET_NULL nullable
├── body               TextField
├── attachment         FileField blank
├── is_internal        BooleanField default False
└── created_at         DateTimeField indexed
```

يجب التحقق من أن رسالة العميل لا يمكن تعليمها `is_internal=True` من واجهة العميل.

---

# 16. Marketing

## 16.1 Campaign

```text
Campaign
├── id            UUIDField PK
├── name          CharField
├── channel       CharField choices/indexed
├── status        CharField choices/indexed
├── start_date    DateField nullable
├── end_date      DateField nullable
├── utm_source    CharField blank
├── utm_medium    CharField blank
├── utm_campaign  CharField blank/indexed
└── created_at    DateTimeField
```

## 16.2 AttributionTouch

```text
AttributionTouch
├── id                    UUIDField PK
├── campaign              FK Campaign SET_NULL nullable
├── contact               FK Contact SET_NULL nullable
├── anonymous_session_id  CharField blank/indexed
├── touch_type            CharField choices/indexed
├── source                CharField blank
├── medium                CharField blank
├── campaign_name         CharField blank
├── landing_page          URL/Text blank
├── referrer              URL/Text blank
└── occurred_at           DateTimeField indexed
```

Touch types:

```text
FIRST_TOUCH
TOUCH
CONVERSION_TOUCH
```

---

# 17. Analytics

## AnalyticsEvent

Web/Product analytics منفصل عن CRM ActivityEvent.

```text
AnalyticsEvent
├── id                    UUIDField PK
├── anonymous_session_id  CharField blank/indexed
├── user                  FK User SET_NULL nullable
├── contact               FK Contact SET_NULL nullable
├── event_name            CharField indexed
├── service               FK Service SET_NULL nullable
├── page_path             CharField indexed
├── utm_source            CharField blank
├── utm_medium            CharField blank
├── utm_campaign          CharField blank
├── referrer              TextField blank
├── metadata              JSONField default dict
└── occurred_at           DateTimeField indexed
```

أمثلة Events:

```text
page_view
service_view
whatsapp_click
inquiry_start
inquiry_submit
signup_start
signup_complete
quote_view
tharaa_demo_click
tharaa_marketplace_click
portal_login
```

---

# 18. Core Audit

## AuditLog

```text
AuditLog
├── id          UUIDField PK
├── actor_user  FK User SET_NULL nullable
├── action      CharField indexed
├── object_type CharField indexed
├── object_id   CharField indexed
├── before_data JSONField nullable
├── after_data  JSONField nullable
├── ip_address  GenericIPAddressField nullable
└── created_at  DateTimeField indexed
```

يستخدم خصوصًا في:

- الأسعار.
- الصلاحيات.
- عروض الأسعار.
- Opportunity stages.
- الموافقات التسويقية.
- حالات المشاريع.
- العمليات المالية مستقبلًا.

---

# 19. Content / Wagtail

`apps/content/` مسؤول عن المحتوى التحريري، لا عن Business Domain.

```text
content/
├── models/
│   ├── home.py
│   ├── solutions.py
│   ├── platforms.py
│   ├── tharaa.py
│   ├── articles.py
│   ├── portfolio.py
│   ├── case_studies.py
│   ├── about.py
│   ├── landing.py
│   └── legal.py
│
├── blocks/
│   ├── common.py
│   ├── hero.py
│   ├── media.py
│   ├── faq.py
│   ├── cta.py
│   └── proof.py
│
├── settings.py
├── wagtail_hooks.py
└── templates/content/
```

نستخدم Blocks مشتركة بدل نسخ نفس تعريف القسم بين الصفحات.

## Site Settings المقترحة

تدار عبر Wagtail Settings:

```text
BrandSettings
├── company_name_ar
├── company_name_en
├── logo_light
├── logo_dark
├── favicon
├── default_social_image
└── footer_description

ContactSettings
├── email
├── phone
├── whatsapp_number
├── address
└── business_hours

SocialSettings
├── x_url
├── instagram_url
├── linkedin_url
├── youtube_url
├── tiktok_url
└── other links

SEOSettings
├── default_title_suffix
├── default_description
├── default_og_image
└── organization_schema fields

AnalyticsSettings
├── enabled integrations flags
└── public-safe identifiers only
```

الأسرار لا تحفظ داخل Settings العامة؛ تبقى Environment Variables.

---

# 20. Integrations

```text
apps/integrations/
├── whatsapp/
│   ├── client.py
│   ├── services.py
│   ├── webhooks.py
│   └── tests/
│
├── email/
│   ├── services.py
│   ├── templates/
│   └── tests/
│
├── salla/
│   ├── client.py
│   ├── services.py
│   ├── webhooks.py     # only when required
│   └── tests/
│
└── common/
    ├── exceptions.py
    └── retry.py
```

قواعد:

- لا نربط Domain Models مباشرة بمكتبة مزود خارجي.
- كل Provider خلف service/client boundary.
- Webhooks يتم التحقق من توقيعها، idempotency، والتكرار.
- لا Tokens في Git أو Logs.

---

# 21. Control Panel Information Architecture

```text
/control/
│
├── Dashboard
│
├── Services
│   ├── Categories
│   └── Services
│
├── CRM
│   ├── Contacts
│   ├── Organizations
│   ├── Stores
│   ├── Customer 360
│   └── Activity
│
├── Sales
│   ├── Inquiries
│   ├── Opportunities
│   ├── Pipeline
│   ├── Quotes
│   └── Follow-ups
│
├── Projects
│   ├── Projects
│   ├── Stages
│   ├── Updates
│   ├── Files
│   └── Approvals
│
├── Support
│   ├── Tickets
│   └── Messages
│
├── Content
│   ├── Pages
│   ├── Articles
│   ├── Portfolio
│   ├── Case Studies
│   ├── Tharaa
│   ├── Legal
│   └── Media
│
├── Marketing
│   ├── Campaigns
│   ├── Attribution
│   ├── Segments (when implemented)
│   └── Consent / preferences views
│
├── Analytics
│   ├── Funnel
│   ├── Service Performance
│   ├── Campaign Performance
│   └── Sources
│
└── System
    ├── Staff
    ├── Groups
    ├── Permissions
    ├── Site Settings
    ├── Integrations
    └── Audit Log
```

## 21.1 Dashboard الرئيسية

تعرض فقط مؤشرات قابلة لاتخاذ إجراء:

- طلبات/استفسارات تحتاج متابعة اليوم.
- فرص جديدة.
- Quotes المفتوحة.
- Active Projects.
- Projects المتأخرة.
- Tickets المفتوحة.
- متوسط زمن أول رد.
- الخدمات الأكثر طلبًا.
- Conversion من صفحة الخدمة إلى Inquiry/WhatsApp click.
- أفضل مصادر العملاء.
- آخر الأنشطة المهمة.

لا نملأها Charts تجميلية بلا قرار تشغيلي.

## 21.2 Customer 360

صفحة العميل الموحدة:

```text
Contact Summary
├── Identity / contact info
├── Account link/status
├── Organization
├── Stores
├── Lifecycle
├── Owner
├── Source / attribution
├── Interests / saved services
├── Inquiries
├── Opportunities
├── Quotes
├── Projects
├── Support
├── Consents
├── Internal notes (when implemented)
└── Activity Timeline
```

## 21.3 Sales Pipeline

Custom Operational View، وليست قائمة Wagtail عادية فقط.

```text
NEW → CONTACTED → QUALIFIED → QUOTE_SENT → NEGOTIATION → WON / LOST
```

مع:

- filters.
- owner.
- service.
- value.
- due follow-up.
- source.

---

# 22. Frontend Design System Rules

الهدف: دمج الواجهة الحالية **بدون تغيير أسلوب العرض المعتمد** مع جعلها قابلة لإدارة المحتوى.

## 22.1 CSS Organization

```text
static/css/
├── tokens.css
├── base.css
├── utilities.css
│
├── components/
│   ├── buttons.css
│   ├── forms.css
│   ├── cards.css
│   ├── navigation.css
│   ├── modal.css
│   ├── accordion.css
│   └── slider.css
│
├── pages/
│   ├── home.css
│   ├── services.css
│   ├── service-detail.css
│   ├── platform.css
│   ├── tharaa.css
│   ├── portfolio.css
│   ├── article.css
│   └── legal.css
│
├── portal/
│   ├── portal.css
│   ├── projects.css
│   └── support.css
│
└── control/
    └── control-overrides.css
```

## 22.2 JS Organization

```text
static/js/
├── core/
│   ├── bootstrap.js
│   ├── analytics.js
│   └── accessibility.js
│
├── components/
│   ├── navigation.js
│   ├── accordion.js
│   ├── modal.js
│   └── slider.js
│
├── pages/
│   ├── services.js
│   └── tharaa.js
│
├── portal/
│   └── portal.js
│
└── control/
    └── control.js
```

لا نستخدم JavaScript لتوليد محتوى يمكن أن يكون HTML server-rendered بلا سبب.

## 22.3 Design Tokens

`tokens.css` هو المرجع للألوان والمسافات والـradius والظلال والطباعة والـz-index.

- هوية ابتكار تك الداكنة مع Cyan/Pink accents.
- IBM Plex Sans Arabic أو الخط المعتمد للهوية.
- استخدام CSS logical properties لدعم RTL/LTR.
- عدم تكرار قيم design system يدويًا في كل صفحة.

## 22.4 Responsive / Accessibility

- Mobile-first.
- RTL first-class.
- Keyboard navigation.
- Visible focus states.
- Semantic landmarks.
- Form labels/errors واضحة.
- Color contrast AA على الأقل.
- دعم `prefers-reduced-motion`.
- الصور بأبعاد واضحة وlazy-loading عند المناسب.
- منع layout shift بقدر الإمكان.

---

# 23. Navigation Architecture

## Public Header

الهيكل المقترح:

```text
الحلول والخدمات
المنصات
ثراء
أعمالنا
المعرفة
عن ابتكار تك
[ابدأ مشروعك]
[حسابي]
```

يمكن استخدام Mega Menu للحلول والخدمات والمنصات بدل ازدحام الـHeader.

## Portal Navigation

```text
نظرة عامة
عروض الأسعار
مشاريعي
الملفات
الدعم
الخدمات المحفوظة
بياناتي ومتجري
تفضيلات التواصل
الأمان
```

يظهر فقط ما تم تشغيله فعليًا.

## Control Navigation

حسب الهيكل الموجود في القسم 21، مع صلاحيات تخفي العناصر التي لا يملك الموظف حق الوصول إليها.

---

# 24. URL Ownership

كل Route له Owner واضح لتجنب الفوضى:

```text
/                       → content/Wagtail
/solutions/*            → content/Wagtail
/platforms/*            → content/Wagtail
/tharaa/                 → content/Wagtail
/knowledge/*             → content/Wagtail
/portfolio/*             → content/Wagtail
/case-studies/*          → content/Wagtail
/about/*                 → content/Wagtail
/legal/*                 → content/Wagtail

/services/*              → services app
/start-project/           → sales app
/contact/                 → sales/content presentation + Inquiry creation

/accounts/*               → django-allauth/accounts app
/portal/*                 → customer_portal app
/control/*                → Wagtail Admin + custom operational views

/webhooks/*               → integrations app, secured
```

---

# 25. Data Flows

## 25.1 Service Inquiry

```text
Public Service Page
      ↓
Inquiry Form / CTA
      ↓
Validate
      ↓
Resolve/Create Contact
      ↓
Create Inquiry
      ↓
ActivityEvent
      ↓
Optional Opportunity
      ↓
Staff Notification
```

## 25.2 WhatsApp CTA

```text
Service Page
   ↓
whatsapp_click
   ↓
AnalyticsEvent
   ↓
Open WhatsApp
```

لا Opportunity تلقائية من click فقط.

## 25.3 Account Creation

```text
Signup
  ↓
User
  ↓
Verify email
  ↓
Safely match existing Contact by verified identity rules
  ↓
Link User ↔ Contact
  ↓
Portal access
```

يجب منع duplicate Contact قدر الإمكان دون دمج خاطئ للأشخاص.

## 25.4 Quote → Project

```text
Opportunity
   ↓
Quote
   ↓
Accepted
   ↓
Project created
   ↓
Stages
   ↓
Updates / Files / Approvals
   ↓
Delivery
```

---

# 26. Permissions / Roles

أدوار مبدئية:

```text
System Administrator
Content Manager
Services & Pricing Manager
Sales / CRM
Project Manager / Support
Marketing
Analyst (read-only)
Customer
```

قواعد:

- Customer لا يصل `/control/`.
- Staff لا يرى كل شيء لمجرد `is_staff=True`؛ تستخدم Permissions.
- تغييرات السعر والصلاحيات والـQuote والـConsent والحالات الحساسة تُسجل في AuditLog.
- MFA للموظفين عند تجهيز الإنتاج.
- Object-level access مهم في Portal: العميل يرى بياناته فقط.

---

# 27. Database General Rules

- UUID للمفاتيح الأساسية العامة ما لم يوجد ADR يغير ذلك.
- كل FK إلى User يستخدم `settings.AUTH_USER_MODEL`.
- `PROTECT` للبيانات التي لا يجب حذف مرجعها تاريخيًا مثل Quote contact/service category عند الحاجة.
- `SET_NULL` للروابط الاختيارية التي يجب ألا تمنع الاحتفاظ بالسجل.
- `CASCADE` فقط عندما يكون السجل الفرعي بلا معنى مستقل.
- timestamps موحدة.
- indexes للحالات، التواريخ، المالك، slug، المصادر، وأعمدة البحث المتكررة.
- Unique constraints في قواعد البيانات، لا في Form فقط.
- Financial values تستخدم Decimal، لا Float.
- Structured metadata يستخدم JSONField فقط عندما لا توجد فائدة حقيقية من التطبيع.

---

# 28. Search Architecture

## Public Search

عند الحاجة:

- المقالات.
- الأعمال.
- الخدمات.

## Control Global Search

يستهدف:

- Contact name/email/phone.
- Organization.
- Store URL/name.
- Inquiry ID.
- Opportunity.
- Quote number.
- Project number/name.
- Ticket number.

لا نبدأ بمحرك بحث خارجي قبل أن تتجاوز PostgreSQL/Wagtail Search الاحتياج.

---

# 29. Notifications

Notifications ليست Domain رئيسيًا مستقلًا في البداية، لكن قواعدها موحدة:

```text
Events
├── New Inquiry
├── Follow-up Due
├── Quote Sent/Accepted
├── Project Update
├── Approval Requested
├── Ticket Reply
└── Staff operational alerts
```

التوصيل يمكن أن يكون:

```text
In-app
Email
WhatsApp later
```

وعند ظهور Jobs حقيقية نضيف Redis/Celery.

---

# 30. Privacy / Security

- إنشاء الحساب لا يعني موافقة تسويقية.
- Consent مستقل حسب القناة والغرض.
- لا secrets/tokens في Git.
- Sensitive payloads لا تكتب في Logs.
- ملفات المشاريع خاصة افتراضيًا.
- Signed/authorized file access في الإنتاج عند الحاجة.
- CSRF / secure cookies / HSTS / production security settings.
- Rate limiting للنماذج الحساسة عند الحاجة.
- Anti-spam للـInquiry/Contact forms.
- Audit trail للتغييرات الحساسة.
- فصل `ActivityEvent` التشغيلي عن `AnalyticsEvent` السلوكي.

---

# 31. Future Commerce Boundary — غير منفذ في V1

عندما يصبح الدفع المباشر مطلوبًا نضيف:

```text
apps/commerce/
├── Order
├── OrderItem
├── Payment
├── Invoice
└── Refund
```

العلاقات المستقبلية:

```text
Quote → Order → Payment → Project

أو

Service → Checkout → Order → Payment → Project
```

حقول مبدئية:

```text
Order
├── id
├── order_number
├── contact
├── quote nullable
├── status
├── currency
├── subtotal
├── discount_total
├── tax_total
├── grand_total
├── created_at
└── updated_at

OrderItem
├── order
├── service nullable
├── name_snapshot
├── description_snapshot
├── quantity
├── unit_price
├── tax
└── total

Payment
├── order
├── provider
├── provider_reference
├── amount
├── currency
├── status
├── paid_at
└── metadata

Invoice
├── order
├── invoice_number
├── status
├── issued_at
├── due_at
└── totals snapshot

Refund
├── payment
├── amount
├── reason
├── status
└── created_at
```

لا ننشئ هذا App قبل الحاجة الفعلية.

---

# 32. ما لن نبنيه الآن

- Service Family.
- Service Packages.
- Service Add-ons كطبقات تجارية.
- Product model لثراء.
- متجر منتجات رقمية داخلي.
- سلة مشتريات.
- مخزون أو شحن.
- اشتراكات شهرية.
- أرصدة استخدام.
- مجتمع تجار.
- تطبيق جوال.
- Microservices.
- React Admin منفصلة.
- أدوات SaaS لا تخدم التشغيل الحالي.

---

# 33. Testing Strategy

داخل كل App:

- Model tests.
- Service/business logic tests.
- Permission tests.
- Form validation tests.
- View tests.

Integration tests:

- Guest inquiry → Contact → Inquiry.
- Existing Contact → account linking.
- Opportunity → Quote.
- Accepted Quote → Project.
- Customer portal object isolation.
- Consent grant/withdrawal history.
- WhatsApp click does not create lead.

E2E browser tests المهمة:

```text
Public
├── navigation
├── service browsing
├── inquiry form
├── tharaa external CTAs
└── responsive / RTL

Portal
├── auth
├── quote visibility
├── project visibility
├── file permissions
└── support

Control
├── permissions
├── customer 360
├── pipeline
├── quote workflow
└── project workflow
```

---

# 34. Migration / Implementation Order

```text
0. Django/Wagtail foundation
1. accounts
2. core
3. crm
4. services
5. content + public frontend migration
6. analytics
7. sales
8. customer_portal
9. projects
10. support
11. marketing
12. integrations
13. control custom operational views
14. hardening / tests / performance / deployment
```

ترتيب migrations التفصيلي يجب أن يحترم الاعتماد بين Apps، ولا ننشئ circular dependencies بلا حاجة.

---

# 35. Phased Delivery

## Phase 0 — Foundation

- Django/Wagtail/PostgreSQL.
- Settings split.
- Custom User قبل أول migration حقيقي.
- Static/media/storage strategy.
- Base templates.
- CI checks الأساسية.

## Phase 1 — Public Frontend + Content

- تحويل الواجهة الحالية إلى Django Templates دون تغيير أسلوب العرض.
- Header/Footer ومكونات مشتركة.
- Home/Solutions/Platforms/Tharaa/Knowledge/About/Legal.
- Design tokens.
- RTL/mobile/accessibility.

## Phase 2 — Service Catalog

- ServiceCategory.
- Service.
- صفحات التصنيف والخدمة.
- البحث/الفلاتر عند الحاجة.
- Related services.

## Phase 3 — CRM + Inquiry

- Contact/Organization/Store.
- Inquiry.
- Activity timeline.
- WhatsApp analytics.
- consent records.

## Phase 4 — Sales

- Opportunity.
- Pipeline.
- Follow-ups.
- Quote/QuoteItem.

## Phase 5 — Accounts + Portal

- allauth.
- progressive registration.
- Contact linking.
- saved services.
- profile/stores/preferences.
- quote visibility.

## Phase 6 — Projects

- Project.
- stages.
- updates.
- files.
- approvals.
- Portal project experience.

## Phase 7 — Support

- Tickets.
- Messages.
- Portal support.

## Phase 8 — Marketing + Analytics

- Campaigns.
- Attribution.
- Funnel dashboards.
- service/campaign/source performance.

## Phase 9 — Production Hardening

- security.
- MFA for staff.
- storage.
- backups.
- monitoring.
- accessibility.
- performance.
- deployment.

---

# 36. Definition of V1 Complete

V1 تعتبر جاهزة عندما يستطيع:

## الزائر

- تصفح الموقع والخدمات.
- مشاهدة الأسعار.
- مشاهدة ثراء.
- إرسال استفسار.
- التواصل عبر واتساب دون Account.

## العميل المسجل

- تسجيل الدخول بأمان.
- ربط حسابه ببيانات CRM الصحيحة.
- إدارة بياناته ومتاجره.
- حفظ خدمة.
- مشاهدة ما يخصه فقط من Quotes/Projects/Files/Support عند تفعيلها.

## الموظف

- إدارة المحتوى والخدمات.
- إدارة Contact 360.
- متابعة Inquiries وOpportunities.
- إنشاء وإرسال Quotes.
- إدارة Projects وStages وUpdates وFiles وApprovals.
- إدارة Support.
- مشاهدة المؤشرات التشغيلية.
- العمل وفق صلاحيات واضحة وتدقيق للتغييرات الحساسة.

---

# 37. قواعد الواجهة أثناء نقل الموقع الحالي

1. لا نعيد تصميم الصفحات الموجودة لمجرد نقلها إلى Django.
2. نحافظ على ترتيب الأقسام وأسلوب العرض المعتمد إلا بقرار تصميم مستقل.
3. نحول المحتوى الثابت إلى Fields/Blocks فقط عندما يحتاج إدارة من `/control/`.
4. لا نحول كل عنصر صغير إلى Model منفصل بلا فائدة.
5. لا نضع Business Data داخل Wagtail StreamField إذا كانت تحتاج Query/CRM/Sales logic.
6. لا نضع Editorial Content داخل Domain Models إذا كانت Page/SEO/Content concern.
7. المكونات المشتركة تستخرج تدريجيًا بعد التحقق بصريًا من التطابق.
8. RTL والجوال وحالات Dark/Light المعتمدة تُختبر فعليًا.
9. Header/Footer/Mega Menu/FAQ/CTA وغيرها لها مكونات مشتركة ولا تنسخ بين الصفحات.
10. كل صفحة جديدة يجب أن تحدد: Owner App، URL، Data Source، Template، Permissions، Analytics Events.

---

# 38. Page Ownership Matrix

| الصفحة/الواجهة | Owner | مصدر البيانات | Template/واجهة |
|---|---|---|---|
| الرئيسية | `content` | Wagtail | Public template |
| Solution | `content` | Wagtail + related Services | Public template |
| Services index | `services` | ServiceCategory/Service | Services template |
| Service category | `services` | ServiceCategory + Services | Services template |
| Service detail | `services` | Service | Services template |
| Platform | `content` | Wagtail + related Services/Content | Public template |
| Tharaa | `content` | Wagtail + related Services | Public template |
| Portfolio/Case Study | `content` | Wagtail | Public template |
| Knowledge/Article | `content` | Wagtail | Public template |
| About/Legal | `content` | Wagtail | Public template |
| Start Project/Inquiry | `sales` | Inquiry/Contact | Public form template |
| Login/Signup | `accounts` | User/allauth | Account template |
| Portal overview | `customer_portal` | Contact-related domain data | Portal template |
| Portal project | `projects` + portal | Project scoped to Contact | Portal template |
| Portal support | `support` + portal | Ticket scoped to Contact | Portal template |
| Control Dashboard | custom control | Aggregated domain data | Wagtail custom view |
| Customer 360 | `crm` | CRM + related domains | Wagtail custom view |
| Sales Pipeline | `sales` | Opportunity | Wagtail custom view |
| Content editing | `content` | Wagtail Pages | Native Wagtail UI |

---

# 39. Source of Truth

- **هذا README:** الصورة الكاملة للمنتج، الواجهات، الصفحات، الملفات، النماذج، والحدود.
- `docs/architecture/ERD.md`: علاقات الكيانات الرسمية.
- `docs/architecture/DECISIONS.md`: القرارات المعمارية ولماذا اتخذناها.
- `AGENTS.md`: قواعد التنفيذ الإلزامية لأي Agent/Developer.

إذا تعارض التنفيذ مع هذه الوثائق، لا يتم تغيير الـDomain بصمت؛ يوثق القرار أولًا ثم تعدّل الوثائق والكود معًا.
