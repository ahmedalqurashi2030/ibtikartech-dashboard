# Ibtikar Tech Dashboard

منصة الباك إند ولوحة التشغيل الداخلية وCRM وبوابة العميل لمنصة **ابتكار تك للحلول والخدمات الرقمية**.

> **Status:** Architecture baseline / pre-implementation foundation
>
> هذا الملف هو **المرجع الرئيسي الكامل لبنية المشروع** قبل وأثناء التنفيذ. أي مطور أو Agent يجب أن يبدأ منه ثم يراجع `AGENTS.md` و`docs/architecture/ERD.md` و`docs/architecture/DECISIONS.md` قبل تغيير أي قرار جوهري.

---

# 1. ما الذي نبنيه؟

ابتكار تك ليست مجرد موقع وكالة، وليست متجر خدمات تقليديًا، وليست SaaS أو Marketplace في V1.

نحن نبني **منصة تشغيل أعمال متخصصة للخدمات الرقمية** تجمع في نظام واحد:

- الموقع العام والمحتوى.
- دليل الخدمات وأسعارها وتفاصيلها.
- صفحة عرض ثيم **ثراء**.
- CRM موحد للعملاء وجهات الاتصال والشركات والمتاجر.
- استقبال الاستفسارات وتحويلها إلى فرص بيع.
- المتابعة التجارية.
- عروض الأسعار.
- إدارة المشاريع والمراحل والملفات والموافقات.
- بوابة عميل اختيارية.
- الدعم الفني والتذاكر.
- التسويق والمصادر وUTM والإسناد Attribution.
- التحليلات والأحداث المهمة.
- لوحة تشغيل موظفين واحدة تحت `/control/`.
- تكاملات واتساب والبريد وسلة وغيرها عند الحاجة.
- إمكانية إضافة الطلبات والمدفوعات والفواتير مستقبلًا دون إعادة بناء CRM.

السوق الأساسي: **السعودية أولًا ثم الخليج**، مع دعم العربية وRTL كحالة استخدام أساسية.

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
- الضغط على المعاينة أو الشراء يسجل كـ`AnalyticsEvent`.

## 2.3 الهوية والعميل

```text
User = Authentication Identity
Contact = CRM Person
```

- يمكن أن يوجد `Contact` بلا `User`.
- يمكن ربط Contact بحساب لاحقًا دون فقدان تاريخه.
- الحساب اختياري ولا يمنع تصفح الخدمات أو إرسال الاستفسار أو التواصل.

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

إلا عند وجود تفاعل تجاري حقيقي: نموذج مرسل، رسالة مستلمة عبر تكامل موثوق، أو إدخال موظف موثق.

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

حالة الحساب، وCRM lifecycle، وOpportunity stage ثلاثة مفاهيم مستقلة.

## 2.6 التجارة الإلكترونية

`Order / Payment / Invoice / Refund` **ليست ضمن V1**. يتم توثيق حدودها فقط وإضافتها عند الحاجة الفعلية للدفع المباشر.

## 2.7 الأسلوب الهندسي

- Modular Monolith.
- لا Microservices في V1.
- لا React Admin منفصلة.
- Wagtail هو shell لوحة التشغيل `/control/`.
- Business models مستقلة عن Wagtail Page Tree.

---

# 3. التقنية المعتمدة

- **Python**.
- **Django 5.2 LTS**.
- **Wagtail 7.4 LTS** بأحدث Patch مدعوم.
- **PostgreSQL**.
- **Django Templates**.
- **HTMX / JavaScript خفيف** عند الحاجة.
- **django-allauth** للمصادقة والتحقق واستعادة الحساب.
- **S3-compatible storage** للصور والملفات في الإنتاج.
- **Redis + Celery** فقط عندما توجد مهام خلفية حقيقية.
- API endpoints محددة عند الحاجة، وليس API-first بلا سبب.
- كل الأسرار والمفاتيح عبر Environment Variables.

---

# 4. الصورة العليا للمنصة

```text
                           IBTIKAR TECH
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
        PUBLIC WEBSITE                       CUSTOMER ACCOUNT
             │                                     │
    ┌────────┼────────┐                       Customer Portal
    │        │        │
Solutions Services  Tharaa
             │        │
      ServiceCategory │
             │        └── Wagtail Presentation Page
          Service
             │
      ┌──────┴──────┐
      │             │
WhatsApp Click    Inquiry
      │             │
AnalyticsEvent    Contact
                    │
                Opportunity
                    │
                   Quote
                    │
                  Project
                    │
             Delivery / Support
```

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
│   ├── base/
│   ├── public/
│   ├── account/
│   ├── portal/
│   └── wagtailadmin/
│
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fonts/
│
├── locale/
│   ├── ar/
│   └── en/
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

## 5.1 الهيكل القياسي داخل كل Django App

كل App تشغيلي يتبع قدر الإمكان هذا النمط:

```text
app_name/
├── __init__.py
├── apps.py
├── models.py            # أو models/ إذا كبر المجال
├── choices.py           # enums/choices عند الحاجة
├── services.py          # business operations / commands
├── selectors.py         # read/query logic المعقد
├── forms.py
├── urls.py              # إذا كان للتطبيق واجهات خاصة
├── views.py
├── wagtail_hooks.py     # ModelViewSets / menu / custom admin integration
├── permissions.py       # domain access helpers عند الحاجة
├── signals.py           # فقط عند وجود سبب واضح
├── migrations/
└── tests/
    ├── test_models.py
    ├── test_services.py
    ├── test_permissions.py
    └── test_views.py
```

**قاعدة:** لا نضع business logic ثقيل داخل views أو templates أو signals إذا كان يمكن وضعه في service واضح قابل للاختبار.

---

# 6. خريطة Apps والنماذج

```text
apps/
│
├── core/
│   └── AuditLog
│
├── accounts/
│   ├── User
│   └── StaffProfile
│
├── crm/
│   ├── Contact
│   ├── Organization
│   ├── OrganizationContact
│   ├── Store
│   ├── ConsentRecord
│   └── ActivityEvent
│
├── services/
│   ├── ServiceCategory
│   └── Service
│
├── sales/
│   ├── Inquiry
│   ├── Opportunity
│   ├── FollowUpTask
│   ├── Quote
│   └── QuoteItem
│
├── customer_portal/
│   ├── SavedService
│   └── CustomerPreference
│
├── projects/
│   ├── Project
│   ├── ProjectStage
│   ├── ProjectUpdate
│   ├── ProjectFile
│   └── Approval
│
├── support/
│   ├── SupportTicket
│   └── TicketMessage
│
├── marketing/
│   ├── Campaign
│   └── AttributionTouch
│
├── analytics/
│   └── AnalyticsEvent
│
├── content/
│   ├── HomePage
│   ├── SolutionPage
│   ├── PlatformPage
│   ├── TharaaPage
│   ├── ArticlePage
│   ├── CaseStudyPage
│   ├── PortfolioPage
│   ├── AboutPage
│   ├── LandingPage
│   └── LegalPage
│
└── integrations/
    ├── WhatsApp
    ├── Email
    ├── Salla
    └── Future adapters
```

---

# 7. قواعد عامة لكل Models

ما لم يوجد سبب موثق خلاف ذلك:

- المفاتيح الأساسية العامة: `UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
- كل العلاقات مع المستخدم تستخدم `settings.AUTH_USER_MODEL`.
- التواريخ تخزن timezone-aware.
- الحقول المالية تستخدم `DecimalField` وليس float.
- `created_at` و`updated_at` في النماذج التشغيلية المهمة.
- لا يتم حذف سجلات تجارية أو تدقيقية مهمة حذفًا متسلسلًا بلا قصد.
- نستخدم `PROTECT` أو `SET_NULL` في العلاقات التاريخية حسب المجال.
- الحقول التي تستخدم في الفلاتر اليومية تحصل على `db_index=True` أو index مركب مناسب.
- لا نخزن Tokens أو Secrets أو Passwords كنص صريح.

---

# 8. `core` — البنية المشتركة والتدقيق

## 8.1 `AuditLog`

سجل غير موجه للعميل، مخصص لتتبع التغييرات الحساسة.

| الحقل | Django type | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | معرف السجل |
| `actor_user` | FK User, SET_NULL | الموظف/المستخدم الذي نفذ التغيير |
| `action` | CharField(80) | create/update/delete/status_change/... |
| `object_type` | CharField(120) | اسم النوع أو model label |
| `object_id` | CharField(64) | يدعم UUID أو معرفات أخرى |
| `before_data` | JSONField | الحالة قبل التغيير، nullable/blank |
| `after_data` | JSONField | الحالة بعد التغيير، nullable/blank |
| `metadata` | JSONField | سياق إضافي غير حساس |
| `ip_address` | GenericIPAddressField | nullable |
| `request_id` | UUIDField | nullable، للربط مع request tracing |
| `created_at` | DateTimeField | auto_now_add، indexed |

Indexes المقترحة:

```text
(actor_user, created_at)
(object_type, object_id, created_at)
(action, created_at)
```

يستخدم خصوصًا لتغييرات الأسعار والصلاحيات والعروض والموافقات التسويقية وحالات المشاريع، والعمليات المالية مستقبلًا.

---

# 9. `accounts` — الدخول وهوية المستخدم

## 9.1 `User`

Custom User مبني على Django `AbstractUser` مع إزالة username واستخدام البريد للدخول.

| الحقل | Django type | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `email` | EmailField(unique=True) | `USERNAME_FIELD = "email"` |
| `username` | removed | لا يستخدم |
| `first_name` | CharField(150) | |
| `last_name` | CharField(150) | |
| `is_active` | BooleanField | |
| `is_staff` | BooleanField | وصول الموظفين |
| `is_superuser` | BooleanField | |
| `email_verified_at` | DateTimeField | nullable |
| `preferred_language` | CharField choices | `ar`, `en` |
| `last_login` | DateTimeField | Django built-in |
| `date_joined` | DateTimeField | |

العلاقات:

```text
User 1 ─── 0..1 Contact
User 1 ─── 0..1 StaffProfile
```

**مهم:** إنشاء User لا يعني تلقائيًا إنشاء Customer جديد إذا وجد Contact سابق يمكن ربطه بأمان.

## 9.2 `StaffProfile`

| الحقل | Django type | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `user` | OneToOne User, CASCADE | يجب أن يكون staff |
| `job_title` | CharField(150) | |
| `department` | CharField(100) | sales/content/projects/marketing/... |
| `phone` | CharField(32) | nullable |
| `avatar` | Image/FK Wagtail Image | nullable |
| `status` | CharField choices | ACTIVE / INACTIVE |
| `created_at` | DateTimeField | |
| `updated_at` | DateTimeField | |

الصلاحيات لا تخزن كحقول مخصصة هنا؛ الأساس هو:

```text
Django Groups + Permissions
```

---

# 10. `crm` — Customer 360 وقاعدة العملاء

هذا هو قلب المنصة التجاري.

## 10.1 `Contact`

يمثل الشخص داخل CRM سواء كان لديه حساب أم لا.

| الحقل | Django type | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `user` | OneToOne User, SET_NULL | nullable, unique |
| `full_name` | CharField(200) | required |
| `email` | EmailField | nullable, indexed |
| `phone` | CharField(32) | nullable, indexed |
| `lifecycle_stage` | CharField choices | LEAD / QUALIFIED / CUSTOMER / REPEAT_CUSTOMER / INACTIVE |
| `status` | CharField choices | ACTIVE / BLOCKED / ARCHIVED |
| `preferred_language` | CharField choices | ar / en |
| `owner` | FK User, SET_NULL | الموظف المسؤول، nullable |
| `first_source` | CharField(120) | organic/referral/ads/whatsapp/manual/... |
| `first_contact_at` | DateTimeField | nullable |
| `last_activity_at` | DateTimeField | nullable, indexed |
| `internal_notes` | TextField | nullable، موظفين فقط |
| `created_at` | DateTimeField | indexed |
| `updated_at` | DateTimeField | |

قيود وقواعد:

- لا نفرض `email unique` لأن بيانات CRM قد تكون ناقصة أو مشتركة؛ عملية المطابقة لها قواعد مستقلة.
- لا نربط User تلقائيًا بمجرد تطابق غير موثوق.
- Contact لا يحذف تاريخيًا إذا لديه Quotes/Projects؛ يطبق archival/anonymization policy عند الحاجة.

Indexes:

```text
(email)
(phone)
(lifecycle_stage, status)
(owner, lifecycle_stage)
(last_activity_at)
```

## 10.2 `Organization`

يمثل شركة/مؤسسة العميل.

| الحقل | النوع | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `name` | CharField(200) | |
| `legal_name` | CharField(250) | nullable |
| `website` | URLField | nullable |
| `industry` | CharField(150) | nullable |
| `country` | CharField(2/100) | nullable |
| `city` | CharField(120) | nullable |
| `status` | CharField choices | ACTIVE / INACTIVE / ARCHIVED |
| `notes` | TextField | nullable، داخلي |
| `created_at` | DateTimeField | |
| `updated_at` | DateTimeField | |

## 10.3 `OrganizationContact`

Bridge Many-to-Many بين Organization وContact.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `organization` | FK Organization, CASCADE |
| `contact` | FK Contact, CASCADE |
| `role_title` | CharField(150), nullable |
| `is_primary` | BooleanField(default=False) |
| `created_at` | DateTimeField |

Constraint:

```text
UNIQUE(organization, contact)
```

## 10.4 `Store`

يمثل متجر العميل أو الأصل الرقمي المرتبط بالخدمة.

| الحقل | النوع | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `primary_contact` | FK Contact, PROTECT | |
| `organization` | FK Organization, SET_NULL | nullable |
| `name` | CharField(200) | |
| `url` | URLField | nullable |
| `platform` | CharField choices | SALLA / ZID / SHOPIFY / WOOCOMMERCE / WORDPRESS / CUSTOM / OTHER |
| `external_store_id` | CharField(150) | nullable |
| `status` | CharField choices | ACTIVE / PAUSED / CLOSED / UNKNOWN |
| `notes` | TextField | nullable |
| `created_at` | DateTimeField | |
| `updated_at` | DateTimeField | |

Index:

```text
(primary_contact, platform)
(platform, external_store_id)
```

## 10.5 `ConsentRecord`

الموافقة التسويقية **سجل تاريخي** وليست Boolean داخل Contact.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | FK Contact, PROTECT |
| `channel` | choices: EMAIL / WHATSAPP / SMS |
| `purpose` | CharField(120) |
| `status` | GRANTED / WITHDRAWN |
| `source` | CharField(120) |
| `policy_version` | CharField(50) |
| `granted_at` | DateTimeField nullable |
| `withdrawn_at` | DateTimeField nullable |
| `ip_address` | GenericIPAddressField nullable |
| `user_agent` | TextField nullable |
| `created_at` | DateTimeField indexed |

لا نمسح Grant القديم عند السحب؛ نحتفظ بالـaudit history.

Index:

```text
(contact, channel, purpose, created_at)
```

## 10.6 `ActivityEvent`

Timeline تشغيلي داخل CRM، وليس Web Analytics.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | FK Contact, PROTECT |
| `actor_user` | FK User, SET_NULL nullable |
| `event_type` | CharField(100) |
| `reference_type` | CharField(100) nullable |
| `reference_id` | CharField(64) nullable |
| `title` | CharField(200) |
| `description` | TextField nullable |
| `metadata` | JSONField default dict |
| `created_at` | DateTimeField indexed |

أمثلة:

```text
CONTACT_CREATED
INQUIRY_RECEIVED
OPPORTUNITY_QUALIFIED
QUOTE_SENT
QUOTE_ACCEPTED
PROJECT_CREATED
TICKET_OPENED
```

---

# 11. `services` — دليل الخدمات

## 11.1 `ServiceCategory`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `name` | CharField(180) |
| `slug` | SlugField(unique=True) |
| `short_description` | TextField nullable |
| `description` | RichText/TextField nullable |
| `image` | FK Wagtail Image, SET_NULL nullable |
| `icon` | CharField/Text field nullable |
| `seo_title` | CharField(70) nullable |
| `seo_description` | CharField(170) nullable |
| `sort_order` | PositiveIntegerField(default=0) |
| `is_active` | BooleanField(default=True) |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |

Ordering:

```text
sort_order, name
```

## 11.2 `Service`

الوحدة التجارية الفعلية التي يطلبها العميل.

| الحقل | النوع | الملاحظات |
|---|---|---|
| `id` | UUIDField PK | |
| `category` | FK ServiceCategory, PROTECT | required |
| `name` | CharField(220) | |
| `slug` | SlugField(unique=True) | |
| `short_description` | TextField | |
| `description` | RichTextField/TextField | |
| `price_type` | choices | FIXED / STARTING_FROM / QUOTE / FREE |
| `price` | DecimalField(12,2) | nullable حسب price_type |
| `currency` | CharField(3) | default `SAR` |
| `delivery_time` | CharField(120) | nullable |
| `scope` | RichText/StreamField | nullable |
| `exclusions` | RichText/StreamField | nullable |
| `deliverables` | StreamField/JSON structured | nullable |
| `requirements` | StreamField/JSON structured | nullable |
| `process_steps` | StreamField/JSON structured | nullable |
| `revision_policy` | RichTextField | nullable |
| `faq` | StreamField | nullable |
| `featured_image` | FK Wagtail Image, SET_NULL | nullable |
| `gallery` | StreamField | nullable |
| `related_services` | M2M self | blank, symmetrical=False |
| `action_type` | choices | WHATSAPP / REQUEST_QUOTE / INTERNAL_CHECKOUT / EXTERNAL_CHECKOUT / DISABLED |
| `action_url` | URLField | nullable |
| `is_featured` | BooleanField | default False |
| `is_active` | BooleanField | default True |
| `sort_order` | PositiveIntegerField | default 0 |
| `seo_title` | CharField(70) | nullable |
| `seo_description` | CharField(170) | nullable |
| `created_at` | DateTimeField | |
| `updated_at` | DateTimeField | |

Validation:

- `FIXED` و`STARTING_FROM` يتطلبان `price`.
- `QUOTE` و`FREE` يسمحان بـ`price = NULL`.
- `EXTERNAL_CHECKOUT` يتطلب `action_url`.
- `INTERNAL_CHECKOUT` موجود كحالة future-ready فقط ولا يتم تشغيله قبل commerce.

**لا توجد Models تجارية بين ServiceCategory وService.**

---

# 12. `sales` — الاستفسارات وفرص البيع والعروض

## 12.1 `Inquiry`

أول تفاعل تجاري حقيقي.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | FK Contact, PROTECT |
| `service` | FK Service, SET_NULL nullable |
| `store` | FK Store, SET_NULL nullable |
| `inquiry_type` | SERVICE / CONSULTATION / QUOTE / GENERAL |
| `channel` | FORM / WHATSAPP / EMAIL / PHONE / MANUAL |
| `message` | TextField |
| `requirements_data` | JSONField default dict |
| `source` | CharField(120) nullable |
| `status` | NEW / REVIEWING / RESPONDED / CONVERTED / CLOSED / SPAM |
| `assigned_to` | FK User, SET_NULL nullable |
| `created_at` | DateTimeField indexed |
| `updated_at` | DateTimeField |

Index:

```text
(status, assigned_to, created_at)
(contact, created_at)
```

## 12.2 `Opportunity`

فرصة البيع الفعلية داخل Pipeline.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | FK Contact, PROTECT |
| `organization` | FK Organization, SET_NULL nullable |
| `store` | FK Store, SET_NULL nullable |
| `inquiry` | OneToOne Inquiry, SET_NULL nullable |
| `service` | FK Service, SET_NULL nullable |
| `title` | CharField(220) |
| `stage` | NEW / CONTACTED / QUALIFIED / QUOTE_SENT / NEGOTIATION / WON / LOST |
| `estimated_value` | DecimalField(12,2) nullable |
| `currency` | CharField(3), default SAR |
| `assigned_to` | FK User, SET_NULL nullable |
| `expected_close_date` | DateField nullable |
| `lost_reason` | TextField nullable |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |
| `closed_at` | DateTimeField nullable |

Indexes:

```text
(stage, assigned_to)
(contact, stage)
(expected_close_date)
```

## 12.3 `FollowUpTask`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `opportunity` | FK Opportunity, CASCADE |
| `contact` | FK Contact, SET_NULL nullable |
| `assigned_to` | FK User, PROTECT |
| `title` | CharField(220) |
| `description` | TextField nullable |
| `task_type` | CALL / WHATSAPP / EMAIL / MEETING / REVIEW / OTHER |
| `status` | OPEN / COMPLETED / CANCELLED |
| `priority` | LOW / NORMAL / HIGH |
| `due_at` | DateTimeField indexed |
| `completed_at` | DateTimeField nullable |
| `created_at` | DateTimeField |

## 12.4 `Quote`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `quote_number` | CharField(unique=True) |
| `public_token` | UUIDField(unique=True) | رابط عرض آمن للعميل عند الحاجة |
| `opportunity` | FK Opportunity, PROTECT |
| `contact` | FK Contact, PROTECT |
| `organization` | FK Organization, SET_NULL nullable |
| `status` | DRAFT / SENT / VIEWED / ACCEPTED / REJECTED / EXPIRED / CANCELLED |
| `currency` | CharField(3), default SAR |
| `subtotal` | DecimalField(12,2) |
| `discount_total` | DecimalField(12,2) |
| `tax_total` | DecimalField(12,2) |
| `grand_total` | DecimalField(12,2) |
| `valid_until` | DateField nullable |
| `notes` | TextField nullable |
| `terms` | TextField nullable |
| `sent_at` | DateTimeField nullable |
| `accepted_at` | DateTimeField nullable |
| `rejected_at` | DateTimeField nullable |
| `created_by` | FK User, PROTECT |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |

الأرقام المالية يعاد حسابها من QuoteItems داخل service layer، ولا تعتمد على قيم يرسلها المتصفح.

## 12.5 `QuoteItem`

يحفظ **snapshot مالي وتاريخي** مستقلًا عن السعر الحالي للخدمة.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `quote` | FK Quote, CASCADE |
| `service` | FK Service, SET_NULL nullable |
| `service_name_snapshot` | CharField(220) |
| `description_snapshot` | TextField nullable |
| `quantity` | DecimalField(10,2), default 1 |
| `unit_price` | DecimalField(12,2) |
| `discount_total` | DecimalField(12,2), default 0 |
| `tax_total` | DecimalField(12,2), default 0 |
| `total` | DecimalField(12,2) |
| `sort_order` | PositiveIntegerField(default=0) |

تغيير سعر Service لاحقًا **لا يغير Quote قديمًا**.

---

# 13. `customer_portal` — بوابة العميل

## 13.1 `SavedService`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | FK Contact, CASCADE |
| `service` | FK Service, CASCADE |
| `created_at` | DateTimeField |

Constraint:

```text
UNIQUE(contact, service)
```

## 13.2 `CustomerPreference`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `contact` | OneToOne Contact, CASCADE |
| `default_store` | FK Store, SET_NULL nullable |
| `language` | ar / en |
| `timezone` | CharField(64) |
| `portal_preferences` | JSONField default dict |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |

لا توضع الموافقات التسويقية هنا؛ مكانها `ConsentRecord`.

## 13.3 واجهات Portal في V1

```text
/account/
├── overview/
├── saved-services/
├── profile/
├── stores/
├── communication-preferences/
└── security/
```

بعد تشغيل المشاريع:

```text
├── inquiries/
├── quotes/
├── projects/
├── files/
├── approvals/
└── support/
```

لا نظهر أقسامًا فارغة قبل تشغيلها.

---

# 14. `projects` — تنفيذ العمل بعد البيع

## 14.1 `Project`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `project_number` | CharField(unique=True) |
| `quote` | FK Quote, SET_NULL nullable |
| `contact` | FK Contact, PROTECT |
| `organization` | FK Organization, SET_NULL nullable |
| `store` | FK Store, SET_NULL nullable |
| `name` | CharField(250) |
| `description` | TextField nullable |
| `status` | PLANNING / WAITING_CLIENT / IN_PROGRESS / REVIEW / REVISION / COMPLETED / ON_HOLD / CANCELLED |
| `progress_percentage` | PositiveSmallIntegerField 0..100 |
| `manager` | FK User, SET_NULL nullable |
| `start_date` | DateField nullable |
| `due_date` | DateField nullable |
| `completed_at` | DateTimeField nullable |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |

Indexes:

```text
(status, manager)
(contact, status)
(due_date, status)
```

## 14.2 `ProjectStage`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `project` | FK Project, CASCADE |
| `name` | CharField(220) |
| `description` | TextField nullable |
| `status` | PENDING / ACTIVE / COMPLETED / SKIPPED |
| `sort_order` | PositiveIntegerField |
| `start_date` | DateField nullable |
| `due_date` | DateField nullable |
| `completed_at` | DateTimeField nullable |

## 14.3 `ProjectUpdate`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `project` | FK Project, CASCADE |
| `stage` | FK ProjectStage, SET_NULL nullable |
| `author` | FK User, PROTECT |
| `title` | CharField(220) |
| `body` | TextField/RichTextField |
| `visibility` | INTERNAL / CUSTOMER |
| `created_at` | DateTimeField indexed |

`INTERNAL` لا يظهر للعميل نهائيًا.

## 14.4 `ProjectFile`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `project` | FK Project, CASCADE |
| `uploaded_by` | FK User, SET_NULL nullable |
| `file` | FileField/S3-backed |
| `name` | CharField(255) |
| `original_name` | CharField(255) nullable |
| `file_type` | CharField(100) nullable |
| `file_size` | PositiveBigIntegerField nullable |
| `visibility` | INTERNAL / CUSTOMER |
| `category` | REQUIREMENT / DESIGN / DELIVERABLE / CONTRACT / REFERENCE / OTHER |
| `created_at` | DateTimeField |

## 14.5 `Approval`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `project` | FK Project, CASCADE |
| `title` | CharField(220) |
| `description` | TextField nullable |
| `requested_by` | FK User, PROTECT |
| `requested_from_contact` | FK Contact, PROTECT |
| `status` | PENDING / APPROVED / CHANGES_REQUESTED / REJECTED |
| `requested_at` | DateTimeField |
| `responded_at` | DateTimeField nullable |
| `response_note` | TextField nullable |

---

# 15. `support` — التذاكر والدعم

## 15.1 `SupportTicket`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `ticket_number` | CharField(unique=True) |
| `contact` | FK Contact, PROTECT |
| `project` | FK Project, SET_NULL nullable |
| `subject` | CharField(250) |
| `description` | TextField |
| `priority` | LOW / NORMAL / HIGH / URGENT |
| `status` | OPEN / IN_PROGRESS / WAITING_CUSTOMER / RESOLVED / CLOSED |
| `assigned_to` | FK User, SET_NULL nullable |
| `created_at` | DateTimeField indexed |
| `updated_at` | DateTimeField |
| `closed_at` | DateTimeField nullable |

## 15.2 `TicketMessage`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `ticket` | FK SupportTicket, CASCADE |
| `sender_user` | FK User, SET_NULL nullable |
| `sender_contact` | FK Contact, SET_NULL nullable |
| `body` | TextField |
| `attachment` | FileField nullable |
| `is_internal` | BooleanField(default=False) |
| `created_at` | DateTimeField indexed |

`is_internal=True` لا يظهر للعميل.

---

# 16. `marketing` — الحملات والإسناد

## 16.1 `Campaign`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `name` | CharField(220) |
| `channel` | ORGANIC / PAID_SEARCH / SOCIAL / EMAIL / WHATSAPP / REFERRAL / PARTNER / OTHER |
| `status` | DRAFT / ACTIVE / PAUSED / COMPLETED |
| `start_date` | DateField nullable |
| `end_date` | DateField nullable |
| `utm_source` | CharField(120) nullable |
| `utm_medium` | CharField(120) nullable |
| `utm_campaign` | CharField(180) nullable |
| `budget` | DecimalField(12,2) nullable |
| `notes` | TextField nullable |
| `created_at` | DateTimeField |
| `updated_at` | DateTimeField |

## 16.2 `AttributionTouch`

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `campaign` | FK Campaign, SET_NULL nullable |
| `contact` | FK Contact, SET_NULL nullable |
| `anonymous_session_id` | CharField/UUID nullable |
| `touch_type` | FIRST_TOUCH / TOUCH / CONVERSION_TOUCH |
| `source` | CharField(120) nullable |
| `medium` | CharField(120) nullable |
| `campaign_name` | CharField(180) nullable |
| `landing_page` | TextField nullable |
| `referrer` | TextField nullable |
| `occurred_at` | DateTimeField indexed |

يسمح لاحقًا بفهم رحلة مثل:

```text
Google → Instagram → Direct → Inquiry
```

---

# 17. `analytics` — أحداث الاستخدام والتحويل

## 17.1 `AnalyticsEvent`

مختلف تمامًا عن `ActivityEvent`.

| الحقل | النوع |
|---|---|
| `id` | UUIDField PK |
| `anonymous_session_id` | CharField/UUID nullable, indexed |
| `user` | FK User, SET_NULL nullable |
| `contact` | FK Contact, SET_NULL nullable |
| `event_name` | CharField(120), indexed |
| `service` | FK Service, SET_NULL nullable |
| `page_path` | TextField nullable |
| `utm_source` | CharField(120) nullable |
| `utm_medium` | CharField(120) nullable |
| `utm_campaign` | CharField(180) nullable |
| `referrer` | TextField nullable |
| `metadata` | JSONField default dict |
| `occurred_at` | DateTimeField indexed |

أحداث أساسية:

```text
page_view
service_view
whatsapp_click
inquiry_start
inquiry_submit
quote_view
signup_start
signup_complete
tharaa_demo_click
tharaa_marketplace_click
saved_service
```

لا تستخدم AnalyticsEvent كـCRM record.

---

# 18. `content` — صفحات Wagtail العامة

هذه صفحات تحريرية. لا تتحول إلى Business Domain Models.

## 18.1 `HomePage`

الحقول الأساسية المتوقعة:

- `hero_eyebrow`
- `hero_title`
- `hero_description`
- `hero_primary_cta_label`
- `hero_primary_cta_url`
- `hero_secondary_cta_label`
- `hero_secondary_cta_url`
- `hero_media`
- `body: StreamField`
- أقسام الخدمات/الحلول/ثراء/الأعمال/المقالات عبر blocks أو علاقات واضحة.
- Wagtail SEO fields.

## 18.2 `SolutionPage`

تمثل صفحات تبدأ من مشكلة/هدف العميل، وليست Service.

- `intro`
- `problem_statement`
- `body: StreamField`
- `related_services` علاقات إلى Service.
- `related_case_studies` عند الحاجة.
- CTA.
- SEO.

## 18.3 `PlatformPage`

أمثلة:

```text
/platforms/salla/
/platforms/zid/
/platforms/shopify/
/platforms/wordpress/
```

الحقول:

- `platform_key`
- `intro`
- `body`
- `related_services`
- `related_articles`
- `related_case_studies`
- CTA.
- SEO.

لا تنشئ نسخًا من Service لكل منصة دون حاجة حقيقية.

## 18.4 `TharaaPage`

**صفحة عرض فقط**.

الحقول المتوقعة:

- `eyebrow`
- `headline`
- `short_description`
- `long_description/body`
- `marketplace_url`
- `demo_url`
- `displayed_price_label` — نص عرض فقط، وليس سعر تجارة داخلي.
- `hero_media`
- `features: StreamField`
- `screenshots/gallery: StreamField`
- `suitable_sectors: StreamField`
- `comparison/value sections: StreamField`
- `faq: StreamField`
- `guide_url` أو علاقة إلى صفحة دليل.
- `changelog_content` إذا أريد عرضه تحريريًا.
- `related_services` علاقات إلى Service.
- CTA للمعاينة والشراء الخارجي.
- SEO.

لا توجد جداول Product أو License أو Inventory لهذه الصفحة.

## 18.5 `ArticlePage`

- `intro`
- `cover_image`
- `body: StreamField`
- `author`/editorial attribution.
- `category/tags` حسب حاجة المحتوى.
- `related_services` اختياري.
- `related_articles` اختياري.
- SEO + Wagtail publishing workflow.

## 18.6 `CaseStudyPage`

- `client_name` (يمكن إخفاؤه إذا تطلبت السرية).
- `industry`
- `platform`
- `challenge`
- `solution`
- `results`
- `cover_image`
- `gallery/body`
- `related_services`
- CTA.

لا نعرض نتائج أو أرقام غير مثبتة.

## 18.7 `PortfolioPage`

- عنوان المشروع.
- وصف مختصر.
- العميل/القطاع عند السماح.
- المنصة.
- الصور.
- الخدمات المرتبطة.
- رابط خارجي اختياري.
- body/تفاصيل التنفيذ.

## 18.8 `AboutPage`

- نبذة ابتكار تك.
- الرؤية.
- الرسالة.
- الوعد.
- منهجية Build / Brand / Connect / Grow.
- القيم.
- CTA.

## 18.9 `LandingPage`

صفحة مرنة للحملات والعروض والاختبارات، مع `StreamField` وUTM-ready CTA tracking.

## 18.10 `LegalPage`

- نوع الوثيقة: Privacy / Terms / Cookies / Other.
- body.
- version/effective date عند الحاجة.
- تاريخ آخر تحديث.

---

# 19. `integrations` — طبقة التكاملات الخارجية

التكاملات يجب أن تكون Adapters واضحة ولا يتسرب منطق API الخارجي إلى باقي المشروع.

## 19.1 WhatsApp

V1:

- توليد رابط واتساب prefilled.
- تسجيل `whatsapp_click` في Analytics.
- إضافة reference/session metadata قدر الإمكان دون بيانات حساسة في الرابط.

Future WhatsApp Business API:

- Webhook receiver موثق.
- التحقق من signature.
- idempotency.
- إنشاء/تحديث Inquiry فقط عند وصول رسالة فعلية قابلة للإثبات.
- retry queue عبر Celery عند الحاجة.

## 19.2 Email

يستخدم لـ:

- التحقق من الحساب.
- استعادة كلمة المرور.
- إشعارات الطلبات/الاستفسارات.
- إرسال عروض الأسعار.
- تحديثات المشاريع.
- الدعم.

التسويق عبر البريد يعتمد على Consent مستقل، ولا نخلطه مع transactional email.

## 19.3 Salla

V1 لا يحتاج تكاملًا عميقًا بالضرورة.

مستقبلًا يمكن إضافة:

- Store metadata sync بموافقة العميل.
- Apps/API integration.
- Webhooks.
- Theme/store references.

لا نربط الـCRM مباشرة ببنية سلة الداخلية؛ نستخدم adapter/service boundary.

---

# 20. العلاقات الأساسية — Cardinality

| العلاقة | النوع |
|---|---|
| User ↔ Contact | 1 : 0..1 |
| User ↔ StaffProfile | 1 : 0..1 |
| Contact ↔ Organization | M:N عبر OrganizationContact |
| Contact → Store | 1:N |
| Organization → Store | 1:N |
| ServiceCategory → Service | 1:N |
| Contact → Inquiry | 1:N |
| Inquiry → Opportunity | 0..1 : 0..1 |
| Contact → Opportunity | 1:N |
| Service → Opportunity | 1:N nullable |
| Opportunity → FollowUpTask | 1:N |
| Opportunity → Quote | 1:N |
| Quote → QuoteItem | 1:N |
| Service → QuoteItem | 1:N nullable |
| Quote → Project | 1:N possible |
| Contact → Project | 1:N |
| Project → ProjectStage | 1:N |
| Project → ProjectUpdate | 1:N |
| Project → ProjectFile | 1:N |
| Project → Approval | 1:N |
| Contact → SupportTicket | 1:N |
| SupportTicket → TicketMessage | 1:N |
| Contact ↔ Service | M:N عبر SavedService |
| Contact → ConsentRecord | 1:N |
| Contact → ActivityEvent | 1:N |
| Campaign → AttributionTouch | 1:N |
| Contact → AttributionTouch | 1:N nullable |

---

# 21. Customer 360 داخل لوحة التحكم

صفحة العميل يجب أن تجمع في مكان واحد:

```text
Contact
├── Identity & contact data
├── Account link إن وجد
├── Organizations
├── Stores
├── Lifecycle
├── Owner
├── Inquiries
├── Opportunities
├── Quotes
├── Projects
├── Support tickets
├── Saved services
├── Attribution
├── Consent history
├── Activity timeline
└── Internal notes
```

لا يحتاج الموظف للتنقل بين أنظمة منفصلة لفهم العميل.

---

# 22. مراحل الحالة منفصلة

## Account status

```text
Guest / No User
Registered
Verified
Disabled
```

## CRM lifecycle

```text
LEAD
QUALIFIED
CUSTOMER
REPEAT_CUSTOMER
INACTIVE
```

## Opportunity pipeline

```text
NEW
  ↓
CONTACTED
  ↓
QUALIFIED
  ↓
QUOTE_SENT
  ↓
NEGOTIATION
  ↓
WON
```

أو:

```text
LOST
```

لا نستخدم `REGISTERED` كـCRM lifecycle stage.

---

# 23. رحلة العميل بدون حساب

```text
Visitor
  ↓
Service Page
  ↓
WhatsApp Click / Inquiry Form
  ↓
Analytics + Real Inquiry
  ↓
Contact
  ↓
Opportunity
  ↓
Quote
  ↓
Project
```

إنشاء الحساب ليس شرطًا.

إذا أنشأ العميل حسابًا لاحقًا:

```text
Existing Contact
      ↓
Link User
      ↓
Old history remains
```

---

# 24. رحلة العميل بالحساب

```text
Register
  ↓
Verify email
  ↓
Contact linked/created safely
  ↓
Customer Portal
  ├── Saved services
  ├── Stores
  ├── Profile
  ├── Quotes
  ├── Projects
  ├── Files
  ├── Approvals
  └── Support
```

التسجيل الأولي يطلب أقل قدر ممكن من البيانات، وتجمع بيانات المتجر والهاتف عند الحاجة الفعلية.

---

# 25. لوحة الموظفين `/control/`

Wagtail هو shell واحد للعمليات.

```text
Dashboard
│
├── CRM
│   ├── Contacts
│   ├── Organizations
│   ├── Stores
│   └── Customer 360
│
├── Sales
│   ├── Inquiries
│   ├── Opportunities / Pipeline
│   ├── Follow-ups
│   └── Quotes
│
├── Services
│   ├── Categories
│   └── Services
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
├── Marketing
│   ├── Campaigns
│   ├── Attribution
│   ├── Consents
│   └── Segmentation views لاحقًا
│
├── Analytics
│   ├── Funnel
│   ├── Service performance
│   ├── Source performance
│   └── Operational metrics
│
├── Content
│   ├── Pages
│   ├── Articles
│   ├── Case studies
│   ├── Portfolio
│   ├── Tharaa page
│   └── Legal
│
└── System
    ├── Staff
    ├── Groups & Permissions
    ├── Integrations
    ├── Site settings
    └── Audit log
```

التنفيذ داخل Wagtail:

- Native Pages للمحتوى.
- ModelViewSets للنماذج التشغيلية البسيطة.
- Custom operational views لـDashboard، CRM 360، Pipeline، Timeline، التقارير.

---

# 26. أدوار الموظفين

الأدوار المنطقية المستهدفة:

```text
System Administrator
Content Manager
Service & Pricing Manager
Sales / CRM
Project Manager
Support
Marketing
Analyst (Read-only)
```

الصلاحيات تطبق عبر Django Groups/Permissions مع object/business checks عند الحاجة.

قواعد:

- العميل لا يدخل `/control/`.
- الموظف لا يرى أو يعدل ما لا يحتاجه دوره.
- MFA للموظفين هدف إلزامي قبل الإنتاج.
- Audit للتغييرات الحساسة.

---

# 27. الخصوصية وحماية البيانات

- Consent التسويقي منفصل عن إنشاء الحساب.
- لا يتم تفعيل checkbox تسويقي مسبقًا.
- تسجيل grant/withdrawal تاريخيًا.
- عدم تسجيل passwords/tokens في logs.
- تقليل البيانات التي تجمع عند التسجيل.
- فصل internal notes عن البيانات الظاهرة للعميل.
- دعم حذف/إخفاء/تصدير البيانات وفق السياسة القانونية المعتمدة عند الإطلاق.
- Cookies/advertising consent يعالج ضمن آلية Consent/Cookie مستقلة عن مجرد `ConsentRecord` التسويقي إذا تم تشغيل تتبع إعلاني يحتاج ذلك.

---

# 28. الأمن

الحد الأدنى المستهدف:

- CSRF protection.
- Secure/HttpOnly/SameSite cookies حسب البيئة.
- HTTPS only في production.
- Secure password hashing عبر Django.
- Email verification.
- MFA للموظفين.
- Rate limiting على login/forms الحساسة.
- File upload validation.
- منع رفع الملفات التنفيذية الخطرة.
- S3 private ACL للمخرجات الخاصة.
- Signed/authorized downloads للملفات الخاصة.
- Permission checks server-side دائمًا.
- لا نعتمد على إخفاء أزرار الواجهة كحماية.
- Security headers.
- Secret rotation readiness.
- Audit trail.

---

# 29. الفهارس والأداء

نركز الفهارس على أنماط البحث الفعلية:

- Contact email/phone/lifecycle/owner.
- Opportunity stage/assignee/close date.
- FollowUpTask due date/status.
- Quote number/status/contact.
- Project status/manager/due date.
- Ticket status/assignee.
- Analytics event/time/session.
- Activity contact/time.

لا ننشئ indexes عشوائية لكل حقل.

نستخدم `select_related` / `prefetch_related` في Customer 360 وDashboards لتجنب N+1.

---

# 30. Search داخل `/control/`

الهدف لاحقًا Search موحد في:

```text
Contacts
Organizations
Stores
Services
Inquiries
Opportunities
Quotes
Projects
Tickets
```

البداية يمكن أن تعتمد PostgreSQL search/filters؛ لا نضيف Elasticsearch أو خدمة بحث مستقلة دون حاجة مثبتة.

---

# 31. Dashboard مؤشرات التشغيل

الصفحة الرئيسية للموظفين تعرض ما يساعد القرار، لا Charts للزينة:

- Inquiries الجديدة.
- Follow-ups المستحقة اليوم والمتأخرة.
- Opportunities حسب المرحلة.
- Quotes المفتوحة والمنتهية قريبًا.
- Active projects.
- مشاريع متأخرة.
- متوسط زمن أول رد عند توفر البيانات.
- الخدمات الأكثر طلبًا.
- التحويل Service View → WhatsApp Click → Inquiry → Opportunity → Won.
- مصادر العملاء.
- تسجيلات الحساب الجديدة.
- حالات Support الحرجة.
- Content drafts التي تنتظر النشر.

---

# 32. URL Architecture المقترحة

## Public

```text
/
/services/
/services/<category-slug>/
/services/<category-slug>/<service-slug>/
/solutions/<slug>/
/platforms/salla/
/platforms/zid/
/platforms/shopify/
/platforms/wordpress/
/tharaa/
/portfolio/
/case-studies/<slug>/
/articles/<slug>/
/about/
/contact/
/legal/<slug>/
```

## Auth / Portal

```text
/accounts/login/
/accounts/signup/
/accounts/password/reset/
/account/
/account/profile/
/account/stores/
/account/saved-services/
/account/quotes/
/account/projects/
/account/support/
```

## Staff

```text
/control/
```

---

# 33. إعدادات الموقع Site Settings

يفضل استخدام Wagtail Settings أو نموذج إعدادات مركزي للأشياء غير التجارية مثل:

- Brand/contact info.
- WhatsApp public number.
- Support email.
- Social links.
- Default SEO metadata.
- Company legal information.
- Footer links.
- Global CTA labels.
- Maintenance flags.

لا نخزن أسرار API داخل Site Settings؛ تبقى في Environment Variables/secret manager.

---

# 34. Notifications

لا نحتاج App ضخم في أول يوم، لكن التصميم يدعم قنوات:

```text
IN_APP
EMAIL
WHATSAPP   # future integration
```

أحداث مرشحة:

- Inquiry received.
- Follow-up due.
- Quote sent/accepted/expired.
- Project update.
- Approval requested/responded.
- Support reply.

عند زيادة الحجم يمكن إضافة notification model وCelery، لكن لا نبنيه لمجرد التوقع.

---

# 35. ما لا نبنيه الآن

```text
Shopping Cart ❌
Inventory ❌
Shipping ❌
Subscriptions ❌
Usage Credits ❌
Marketplace ❌
Affiliate system ❌
Community ❌
Mobile App ❌
Microservices ❌
React Admin ❌
Product catalog for Tharaa ❌
License system for Tharaa ❌
```

---

# 36. Commerce Boundary — مستقبل فقط

عند تشغيل الدفع المباشر نضيف App مستقل منطقيًا:

```text
commerce/
├── Order
├── OrderItem
├── Payment
├── Invoice
└── Refund
```

العلاقة المتوقعة:

```text
Quote
  ↓
Order
  ↓
Payment
  ↓
Invoice
```

أو شراء مباشر مستقبلًا:

```text
Service
  ↓
Checkout
  ↓
Order
  ↓
Payment
  ↓
Project
```

## 36.1 حقول مستقبلية مبدئية

### `Order`

- id UUID.
- order_number unique.
- contact.
- quote nullable.
- status.
- currency.
- subtotal/discount/tax/total.
- created_at/updated_at.

### `OrderItem`

- order.
- service nullable.
- name/description snapshot.
- quantity.
- unit_price.
- totals.

### `Payment`

- order.
- provider.
- provider_reference.
- amount.
- currency.
- status.
- paid_at.
- raw safe metadata فقط.

### `Invoice`

- order.
- invoice_number.
- totals/tax.
- issued_at.
- status.
- document/file reference.

### `Refund`

- payment.
- amount.
- reason.
- provider_reference.
- status.
- created_at/completed_at.

**هذه الحدود موثقة فقط ولا تنفذ في V1.**

---

# 37. Data Flow الأساسي

```text
Public Page
   ↓
AnalyticsEvent
   ↓  [real business action]
Inquiry
   ↓
Contact / existing Contact match
   ↓
Opportunity
   ↓
Follow-up
   ↓
Quote + QuoteItems snapshots
   ↓
Accepted
   ↓
Project
   ↓
Stages / Updates / Files / Approvals
   ↓
Support
   ↓
Repeat opportunity / retention
```

---

# 38. Matching Contact مع User أو Inquiry

الدمج التلقائي الخاطئ أخطر من وجود duplicate مؤقت.

القاعدة:

1. تطابق User↔Contact يتم بقواعد موثوقة.
2. البريد/الجوال قد يكونان إشارات، لا قرار merge أعمى.
3. عند الشك، الموظف يراجع.
4. أي merge مستقبلي يجب أن يكون audited وقابلًا للتتبع.

---

# 39. قواعد الحذف

أمثلة مبدئية:

- `ServiceCategory` مع Services → `PROTECT`.
- `Contact` مع Quotes/Projects → لا cascade delete.
- `Quote` مع QuoteItems → CASCADE للـitems لأنهم جزء منه.
- `Project` مع stages/updates/files → CASCADE منطقي، لكن حذف Project نفسه يجب أن يكون مقيدًا/إداريًا؛ يفضل archival بدل الحذف في الإنتاج.
- `User` المشار إليه تاريخيًا → غالبًا `SET_NULL` أو `PROTECT` حسب السياق.

لا نعتمد CASCADE بشكل آلي دون مراجعة المعنى التجاري.

---

# 40. Testing Strategy

كل مرحلة يجب أن تغطي على الأقل:

- Model constraints.
- Status transitions.
- permissions.
- Guest flows.
- User↔Contact linking.
- Quote calculations/snapshots.
- Visibility INTERNAL vs CUSTOMER.
- Consent history.
- Analytics لا ينشئ Lead تلقائيًا.
- File authorization.
- RTL/public forms عند إضافة UI.

أنواع الاختبارات:

```text
Unit tests
Model tests
Service/domain tests
Permission tests
Integration tests
Critical browser flows
```

---

# 41. Quality Gates

قبل اعتبار أي مرحلة مكتملة:

1. مراجعة المتطلبات والـERD.
2. مراجعة `git diff`.
3. تشغيل migrations.
4. تشغيل tests ذات الصلة.
5. فحص permissions/data leakage.
6. اختبار Guest وRegistered flows.
7. اختبار الجوال وRTL والإتاحة لأي UI جديد.
8. التحقق من error states.
9. عدم الادعاء بنجاح اختبار لم يتم تشغيله.
10. Git checkpoint واضح.

---

# 42. ترتيب تأسيس قاعدة البيانات

الترتيب المنطقي الأولي للمهاجرات:

```text
1. accounts
   ├── User
   └── StaffProfile

2. core
   └── AuditLog

3. crm
   ├── Contact
   ├── Organization
   ├── OrganizationContact
   ├── Store
   ├── ConsentRecord
   └── ActivityEvent

4. services
   ├── ServiceCategory
   └── Service

5. sales
   ├── Inquiry
   ├── Opportunity
   ├── FollowUpTask
   ├── Quote
   └── QuoteItem

6. customer_portal
   ├── SavedService
   └── CustomerPreference

7. projects
   ├── Project
   ├── ProjectStage
   ├── ProjectUpdate
   ├── ProjectFile
   └── Approval

8. support
   ├── SupportTicket
   └── TicketMessage

9. marketing
   ├── Campaign
   └── AttributionTouch

10. analytics
    └── AnalyticsEvent

11. content
    └── Wagtail Pages
```

قد تتغير تفاصيل migration dependencies أثناء التنفيذ، لكن لا تتغير حدود المجال دون قرار معماري.

---

# 43. مراحل التنفيذ

## Phase 0 — Foundation

- Django/Wagtail/PostgreSQL.
- settings split.
- Custom User.
- base templates.
- environment config.
- logging/security baseline.

## Phase 1 — CRM + Services

- Contact/Organization/Store.
- ServiceCategory/Service.
- Wagtail ModelViewSets.
- basic Customer 360.

## Phase 2 — Public dynamic content

- ربط واجهة ابتكار تك الحالية بقوالب Django/Wagtail دون تغيير الهوية المعتمدة.
- Services pages.
- Platforms/Solutions.
- TharaaPage.
- Articles/Portfolio/Case Studies.

## Phase 3 — Inquiry + Analytics + WhatsApp

- Forms.
- Analytics events.
- UTM capture.
- WhatsApp click tracking.
- Inquiry creation.

## Phase 4 — Sales CRM

- Opportunity Pipeline.
- Follow-ups.
- Quotes + snapshots.
- Customer activity timeline.

## Phase 5 — Optional Account + Portal

- allauth.
- Contact linking.
- Saved services.
- Profile/store/preferences.

## Phase 6 — Projects

- Project.
- Stages.
- Updates.
- Files.
- Approvals.

## Phase 7 — Support

- Tickets/messages.
- portal support view.

## Phase 8 — Marketing + Reporting

- Campaigns.
- Attribution.
- funnel reporting.
- source/service performance.

## Phase 9 — Commerce عند الحاجة فقط

- Orders.
- Payments.
- Invoices.
- Refunds.

---

# 44. تعريف V1 المكتملة

V1 تعتبر مكتملة عندما يستطيع النظام فعليًا:

1. إدارة تصنيفات الخدمات والخدمات.
2. إدارة المحتوى وصفحة ثراء.
3. استقبال Inquiry حقيقية.
4. إنشاء/ربط Contact بدون إجبار حساب.
5. تحويل Inquiry إلى Opportunity.
6. إدارة Pipeline والمتابعات.
7. إنشاء وإرسال Quote تحفظ Snapshot.
8. تحويل العمل المقبول إلى Project.
9. إدارة مراحل وتحديثات وملفات المشروع.
10. توفير Portal أساسي للعميل عند إنشاء حساب.
11. إدارة Support.
12. تتبع Analytics وAttribution الأساسية.
13. إدارة كل ذلك من `/control/` بصلاحيات مناسبة.

---

# 45. قواعد Naming

Python/Django:

```text
apps: snake_case
models: PascalCase
fields: snake_case
URLs: kebab-case when public
status values: UPPER_SNAKE_CASE
```

Identifiers مثل quote/project/ticket numbers لها generator/service مركزي ولا تنشأ عشوائيًا في views.

---

# 46. مبدأ Source of Truth

- `Service` هو مصدر الحقيقة لبيانات الخدمة الحالية.
- `QuoteItem` هو مصدر الحقيقة لما تم عرضه ماليًا تاريخيًا.
- `Contact` هو CRM identity.
- `User` هو authentication identity.
- `ActivityEvent` هو operational CRM timeline.
- `AnalyticsEvent` هو behavioral analytics.
- Wagtail Pages هي مصدر الحقيقة للمحتوى التحريري.
- TharaaPage هي مصدر الحقيقة لعرض ثراء داخل الموقع، وليست Product entity.

---

# 47. ملفات المرجع

- [`AGENTS.md`](./AGENTS.md) — قواعد التنفيذ الإلزامية لأي Agent/مطور.
- [`docs/architecture/ERD.md`](./docs/architecture/ERD.md) — العلاقات الأساسية.
- [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) — القرارات المعمارية ADR baseline.

إذا تعارض تنفيذ جديد مع هذا README أو ADRs، **يجب توثيق القرار الجديد أولًا قبل تغيير النماذج**.

---

# 48. الخلاصة المعتمدة

```text
Django 5.2 LTS
+ Wagtail 7.4 LTS
+ PostgreSQL
+ Modular Monolith
+ Unified /control/
+ Optional Customer Account
+ CRM-first architecture
+ ServiceCategory → Service
+ Tharaa = Wagtail Presentation Page
+ Inquiry → Opportunity → Quote → Project
+ Analytics separated from CRM Activity
+ Commerce deferred until real need
```

هذه البنية هي **Architecture Baseline الرسمي لمنصة ابتكار تك Dashboard**، ويجب أن تكون نقطة البداية لكل تنفيذ لاحق.