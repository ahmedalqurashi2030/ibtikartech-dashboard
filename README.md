# Ibtikar Tech Dashboard

منصة الباك إند ولوحة التشغيل الداخلية وCRM وبوابة العميل لمنصة **ابتكار تك للحلول والخدمات الرقمية**.

> **Status:** Architecture baseline / pre-implementation foundation
>
> هذا الملف هو المدخل الرئيسي لفهم المنصة كاملة. التفاصيل المرجعية للعلاقات والقرارات موجودة أيضًا داخل `docs/architecture/`.

---

## 1. هدف المشروع

بناء **منصة تشغيل أعمال متكاملة لابتكار تك** وليست مجرد لوحة Admin تقليدية.

المنصة تجمع في نظام واحد:

- إدارة الخدمات وأسعارها ومحتواها.
- CRM موحد للعملاء وجهات الاتصال والشركات والمتاجر.
- استقبال الاستفسارات وتحويلها إلى فرص بيع.
- عروض الأسعار والمتابعة التجارية.
- إدارة المشاريع والمراحل والملفات والموافقات.
- بوابة عميل اختيارية.
- الدعم الفني والتذاكر.
- التسويق والمصادر وUTM والإسناد Attribution.
- التحليلات والأحداث المهمة.
- إدارة محتوى الموقع عبر Wagtail.
- تكاملات واتساب والبريد وسلة وغيرها عند الحاجة.
- إضافة الطلبات والمدفوعات والفواتير مستقبلًا دون إعادة بناء CRM.

---

## 2. القرارات المعمارية المعتمدة

1. **Service Category → Service فقط**.
   - لا توجد `ServiceFamily`.
   - لا توجد `ServicePackage`.
   - لا توجد `ServiceAddon` كطبقات تجارية مستقلة في V1.
   - الخدمة نفسها تحمل السعر والتفاصيل والمدة والمخرجات والمتطلبات.

2. **ثراء صفحة عرض وتسويق داخل Wagtail فقط في V1**.
   - ليس `Product` model.
   - لا يوجد `products/` app حاليًا.
   - شراء ثراء يتم خارجيًا عبر متجر ثيمات سلة.
   - يمكن لصفحة ثراء عرض خدمات مرتبطة من `Service`.

3. `User` = هوية الدخول Authentication.

4. `Contact` = الشخص داخل CRM.
   - يمكن وجود `Contact` بدون حساب.
   - يمكن ربطه لاحقًا بـ`User` دون فقدان تاريخه.

5. إنشاء حساب العميل **اختياري** ولا يمنع:
   - تصفح الخدمات.
   - مشاهدة الأسعار.
   - إرسال استفسار.
   - التواصل عبر واتساب.

6. ضغط واتساب = `AnalyticsEvent` فقط، وليس Lead أو Opportunity تلقائيًا.

7. المسار التجاري الأساسي:

```text
Inquiry
  ↓
Opportunity
  ↓
Quote
  ↓
Project
```

8. Orders / Payments / Invoices مؤجلة حتى يصبح الدفع الإلكتروني المباشر مطلوبًا.

9. المشروع **Modular Monolith** وليس Microservices.

10. Wagtail هو الـBack Office shell الرئيسي على `/control/` باستخدام:
    - Wagtail Pages.
    - ModelViewSets.
    - Custom operational views.

11. لا توجد لوحة React منفصلة في V1.

---

## 3. التقنية المعتمدة

- Python.
- Django 5.2 LTS.
- Wagtail 7.4 LTS.
- PostgreSQL.
- Django Templates.
- HTMX أو JavaScript خفيف عند الحاجة.
- django-allauth لتسجيل الدخول والتحقق واستعادة الحساب.
- S3-compatible storage للصور والملفات في الإنتاج.
- Redis + Celery فقط عند ظهور حاجة فعلية للمهام الخلفية.
- API endpoints محددة عند الحاجة، وليس API-first بلا سبب.

---

## 4. الصورة العليا للمنصة

```text
                         IBTIKAR TECH
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        PUBLIC WEBSITE                    CUSTOMER ACCOUNT
             │                                 │
    ┌────────┼────────┐                  Customer Portal
    │        │        │
Solutions  Services  Tharaa
             │        │
      ServiceCategory │
             │        └── Wagtail Presentation Page
          Service
             │
        ┌────┴─────┐
        │          │
   WhatsApp      Inquiry
     Click          │
        │         Contact
 AnalyticsEvent     │
                  Opportunity
                     │
                    Quote
                     │
                   Project
                     │
               Delivery / Support
```

---

## 5. هيكل تطبيقات Django المعتمد

> هذا هو الهيكل المنطقي الكامل لـV1. المجلدات ستُنشأ فعليًا عند بدء تأسيس Django.

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
│   └── Wagtail Pages
│       ├── HomePage
│       ├── SolutionPage
│       ├── PlatformPage
│       ├── TharaaPage
│       ├── ArticlePage
│       ├── CaseStudyPage
│       ├── PortfolioPage
│       ├── AboutPage
│       ├── LandingPage
│       └── LegalPage
│
└── integrations/
    ├── WhatsApp
    ├── Email
    ├── Salla
    └── Future external integrations
```

### ملاحظة مهمة عن `products/`

لا يوجد `products/` في V1 عن قصد.

```text
products/ ❌
Product ❌
ProductRelease ❌
ProductService ❌
```

لأن **ثراء حاليًا صفحة عرض فقط** داخل `content/TharaaPage`، وليس منتجًا يتم بيعه أو ترخيصه داخل منصة ابتكار تك.

إذا بدأت ابتكار تك مستقبلًا بيع منتجات رقمية مباشرة، يتم حينها تصميم `products/` كحد مستقل دون كسر البنية الحالية.

---

## 6. core

### `AuditLog`

سجل تدقيق داخلي للتغييرات الحساسة.

يُستخدم خصوصًا لتتبع:

- تغييرات أسعار الخدمات.
- تغييرات الصلاحيات.
- تغييرات عروض الأسعار.
- تغييرات حالات فرص البيع.
- تغييرات الموافقات التسويقية.
- تغييرات حالات المشاريع.
- العمليات المالية مستقبلًا.

البيانات الرئيسية المتوقعة:

```text
AuditLog
├── actor_user
├── action
├── object_type
├── object_id
├── before_data
├── after_data
├── ip_address
└── created_at
```

---

## 7. accounts

### `User`

هوية الدخول فقط.

مسؤول عن:

- تسجيل الدخول.
- كلمة المرور.
- التحقق من البريد.
- حالة الحساب.
- staff / superuser.

قاعدة مهمة:

```text
User ≠ Customer CRM Record
```

### `StaffProfile`

امتداد خاص بموظفي ابتكار تك:

- المسمى الوظيفي.
- القسم.
- الهاتف.
- الصورة.
- الحالة.

الأدوار والصلاحيات تعتمد على Django Groups + Permissions.

---

## 8. crm

هذا هو قلب قاعدة بيانات العملاء.

### `Contact`

يمثل الشخص داخل CRM سواء كان لديه حساب أم لا.

```text
Contact
├── user nullable
├── full_name
├── email
├── phone
├── lifecycle_stage
├── status
├── preferred_language
├── owner
├── first_source
├── first_contact_at
└── last_activity_at
```

Lifecycle المقترح:

```text
LEAD
QUALIFIED
CUSTOMER
REPEAT_CUSTOMER
INACTIVE
```

### `Organization`

يمثل الشركة أو المنشأة التي يتبع لها العميل عند الحاجة.

### `OrganizationContact`

جدول ربط Many-to-Many بين الشركات وجهات الاتصال.

يسمح مثلًا بوجود:

```text
شركة ABC
├── المدير
├── المحاسب
└── مسؤول التسويق
```

### `Store`

يمثل متجر العميل أو موقعه الرقمي.

المنصات المتوقعة:

```text
SALLA
ZID
SHOPIFY
WOOCOMMERCE
WORDPRESS
CUSTOM
OTHER
```

يمكن للعميل امتلاك أكثر من متجر.

### `ConsentRecord`

سجل تاريخي للموافقات التسويقية.

القنوات:

```text
EMAIL
WHATSAPP
SMS
```

الحالات:

```text
GRANTED
WITHDRAWN
```

لا يتم استبدال السجل القديم عند سحب الموافقة؛ يتم الاحتفاظ بتاريخ كامل للتغييرات.

### `ActivityEvent`

Timeline تشغيلي داخل CRM، مثل:

- Contact created.
- Inquiry received.
- Opportunity qualified.
- Quote sent.
- Quote accepted.
- Project created.
- Ticket opened.

وهو مختلف عن Web Analytics.

---

## 9. services

### `ServiceCategory`

التصنيف الرئيسي للخدمات.

أمثلة:

- المتاجر الإلكترونية.
- المواقع.
- الهوية والمحتوى.
- النمو والتسويق.
- الأنظمة والتكامل.
- الدعم والرعاية.
- الاستشارات.

### `Service`

الوحدة الفعلية التي يطلبها العميل.

تحمل الخدمة نفسها:

- الاسم.
- Slug.
- التصنيف.
- الوصف المختصر.
- الوصف الكامل.
- السعر.
- نوع السعر.
- العملة.
- مدة التنفيذ.
- النطاق.
- ما لا يشمله العمل.
- المخرجات.
- المتطلبات.
- خطوات التنفيذ.
- سياسة التعديلات.
- الصور.
- CTA / Action type.
- SEO.
- حالة النشر.
- ترتيب العرض.

أنواع السعر:

```text
FIXED
STARTING_FROM
QUOTE
FREE
```

طرق الإجراء:

```text
WHATSAPP
REQUEST_QUOTE
INTERNAL_CHECKOUT   # future-ready only
EXTERNAL_CHECKOUT
DISABLED
```

لا توجد طبقات بين Category وService:

```text
ServiceCategory
       ↓
    Service
```

---

## 10. sales

### `Inquiry`

أول تفاعل تجاري حقيقي من العميل.

قد يكون:

- طلب خدمة.
- طلب استشارة.
- طلب عرض سعر.
- استفسار عام.

### `Opportunity`

فرصة البيع الفعلية داخل CRM.

Pipeline المقترح:

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
WON / LOST
```

### `FollowUpTask`

مهام متابعة المبيعات:

- اتصال.
- رسالة.
- إرسال عرض.
- مراجعة متطلبات.
- متابعة في تاريخ محدد.

### `Quote`

عرض السعر التجاري.

الحالات:

```text
DRAFT
SENT
VIEWED
ACCEPTED
REJECTED
EXPIRED
CANCELLED
```

### `QuoteItem`

كل بند داخل عرض السعر يحتفظ بـSnapshot خاص به.

لا يعتمد العرض القديم على السعر الحالي للخدمة.

مثال:

```text
service_name_snapshot
unit_price
quantity
discount
tax
total
```

---

## 11. customer_portal

الحساب اختياري ولا يعيق التحويل.

### `SavedService`

يسمح للمستخدم المسجل بحفظ خدمة للرجوع إليها لاحقًا.

### `CustomerPreference`

تفضيلات البوابة والحساب، مثل:

- اللغة.
- المنطقة الزمنية.
- المتجر الافتراضي.
- تفضيلات واجهة البوابة.

الموافقات التسويقية لا توضع هنا؛ مكانها `ConsentRecord`.

### أقسام بوابة العميل في V1

```text
حسابي
├── نظرة عامة
├── طلباتي / استفساراتي
├── الخدمات المحفوظة
├── بياناتي
├── متاجري
├── تفضيلات التواصل
└── الأمان
```

وعند تشغيل المشاريع:

```text
├── مشاريعي
├── المراحل والتحديثات
├── عروض الأسعار
├── الملفات
├── الموافقات
└── الدعم
```

لا نظهر أقسامًا فارغة قبل تشغيلها.

---

## 12. projects

### `Project`

يمثل التنفيذ الفعلي بعد قبول العمل.

الحالات المقترحة:

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

### `ProjectStage`

مراحل المشروع المرتبة.

```text
PENDING
ACTIVE
COMPLETED
SKIPPED
```

### `ProjectUpdate`

تحديثات Timeline للمشروع.

الرؤية:

```text
INTERNAL
CUSTOMER
```

### `ProjectFile`

ملفات المشروع مع تصنيفات مثل:

```text
REQUIREMENT
DESIGN
DELIVERABLE
CONTRACT
REFERENCE
OTHER
```

### `Approval`

موافقات العميل على التصاميم والمخرجات.

الحالات:

```text
PENDING
APPROVED
CHANGES_REQUESTED
REJECTED
```

---

## 13. support

### `SupportTicket`

تذكرة دعم مرتبطة بالعميل، ويمكن ربطها بمشروع عند الحاجة.

الحالات:

```text
OPEN
IN_PROGRESS
WAITING_CUSTOMER
RESOLVED
CLOSED
```

### `TicketMessage`

رسائل التذكرة مع دعم:

- رسالة العميل.
- رد الموظف.
- المرفقات.
- ملاحظات داخلية لا يراها العميل.

---

## 14. marketing

### `Campaign`

تعريف الحملات التسويقية ومصادرها.

يدعم:

- channel.
- start / end date.
- UTM source.
- UTM medium.
- UTM campaign.

### `AttributionTouch`

يحفظ لمسات الإسناد التسويقي عبر رحلة العميل.

```text
FIRST_TOUCH
TOUCH
CONVERSION_TOUCH
```

يسمح مستقبلًا بمعرفة رحلة مثل:

```text
Google Ads
   ↓
Instagram
   ↓
Direct
   ↓
Inquiry
```

---

## 15. analytics

### `AnalyticsEvent`

أحداث سلوكية وتحليلية، وليست CRM Activities.

أمثلة:

```text
service_view
whatsapp_click
quote_start
quote_submit
signup_start
signup_complete
tharaa_demo_click
tharaa_marketplace_click
```

قاعدة مهمة:

```text
whatsapp_click ≠ Inquiry
whatsapp_click ≠ Opportunity
```

---

## 16. content / Wagtail

Wagtail مسؤول عن المحتوى التحريري وصفحات الموقع.

### الصفحات الأساسية

```text
HomePage
SolutionPage
PlatformPage
TharaaPage
ArticlePage
CaseStudyPage
PortfolioPage
AboutPage
LandingPage
LegalPage
```

### `TharaaPage`

ثراء صفحة عرض وتسويق فقط وتحتوي على ما يلزم مثل:

- Hero.
- وصف الثيم.
- المزايا.
- الصور.
- المعاينة.
- رابط متجر ثيمات سلة.
- السعر المعروض.
- القطاعات المناسبة.
- FAQ.
- دليل الاستخدام.
- سجل تحديثات مرئي إذا احتجناه كمحتوى.
- خدمات مرتبطة من `Service`.

ولا تدخل في:

```text
Orders ❌
Payments ❌
Inventory ❌
Licenses ❌
Subscriptions ❌
```

---

## 17. integrations

يحتوي التكاملات الخارجية فقط، ولا يصبح مصدر الحقيقة للبيانات.

### WhatsApp

في البداية:

```text
Service CTA
   ↓
whatsapp_click AnalyticsEvent
   ↓
Open WhatsApp
```

وعند إضافة WhatsApp Business API مستقبلًا يمكن ربط الرسائل الواردة بـContact وInquiry.

### Email

لـ:

- التحقق من الحساب.
- الإشعارات.
- عروض الأسعار.
- تحديثات المشروع.
- الدعم.

### Salla

لا يتم بناء تكامل عميق قبل وجود حاجة فعلية.

أمثلة مستقبلية:

- ربط بيانات متجر العميل.
- التحقق من بيانات مرتبطة بخدمات سلة.
- تكاملات منتجات ابتكار تك مستقبلًا.

---

## 18. لوحة التشغيل `/control/`

لوحة واحدة وليست عدة أنظمة منفصلة.

```text
Dashboard
│
├── CRM
│   ├── Contacts
│   ├── Organizations
│   ├── Stores
│   └── Activities
│
├── Sales
│   ├── Inquiries
│   ├── Opportunities
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
├── Content
│   ├── Pages
│   ├── Articles
│   ├── Case Studies
│   ├── Portfolio
│   └── Tharaa Page
│
├── Marketing
│   ├── Campaigns
│   ├── Attribution
│   └── Consents
│
├── Analytics
│
└── System
    ├── Staff
    ├── Roles & Permissions
    ├── Integrations
    └── Audit Logs
```

### الصفحة الرئيسية للوحة

تركز على مؤشرات قابلة للتنفيذ، مثل:

- استفسارات جديدة تحتاج متابعة.
- فرص البيع حسب المرحلة.
- عروض الأسعار المفتوحة.
- المشاريع النشطة.
- متوسط زمن أول رد.
- الخدمات الأكثر طلبًا.
- التحويل من صفحة الخدمة إلى واتساب / Inquiry.
- أفضل مصادر العملاء.
- تنبيهات تشغيلية.

---

## 19. ملف العميل 360°

صفحة Contact داخل لوحة التشغيل يجب أن تجمع:

- بيانات الشخص.
- الحساب المرتبط إن وجد.
- الشركة.
- المتاجر.
- الموظف المسؤول.
- Lifecycle stage.
- مصدر العميل.
- الاستفسارات.
- فرص البيع.
- عروض الأسعار.
- المشاريع.
- الدعم.
- الموافقات التسويقية.
- Timeline كامل.
- الملاحظات الداخلية.

---

## 20. الصلاحيات الأساسية

الأدوار التشغيلية المتوقعة:

- System Administrator.
- Content Manager.
- Services Manager.
- Sales / CRM.
- Project Manager.
- Support Agent.
- Marketing Manager.
- Analyst / Read-only.
- Customer.

العميل لا يصل إلى `/control/`.

MFA مطلوب للموظفين عند تشغيل الإنتاج.

---

## 21. رحلة العميل

### بدون حساب

```text
Visit
 ↓
Service Page
 ↓
WhatsApp / Inquiry
 ↓
Contact
 ↓
Opportunity
 ↓
Quote
 ↓
Project
```

### مع حساب اختياري

```text
Register
 ↓
User
 ↓
Link to Contact
 ↓
Saved Services / Portal / Quotes / Projects
```

إنشاء الحساب لا ينشئ Contact جديدًا إذا وجد Contact مطابق يمكن ربطه بأمان.

---

## 22. الفصل بين Activity وAnalytics

### `ActivityEvent`

أحداث تشغيلية CRM:

```text
Inquiry received
Quote sent
Project created
Ticket opened
```

### `AnalyticsEvent`

أحداث سلوكية:

```text
service_view
whatsapp_click
signup_start
tharaa_demo_click
```

لا يتم دمجهما في جدول واحد.

---

## 23. مستقبل التجارة والدفع

لا يتم تنفيذ `commerce/` في V1.

عند الحاجة فقط نضيف:

```text
commerce/
├── Order
├── OrderItem
├── Payment
├── Invoice
└── Refund
```

المسار المستقبلي:

```text
Quote
 ↓
Order
 ↓
Payment
 ↓
Invoice
 ↓
Project
```

أو للشراء المباشر مستقبلًا:

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

يتم تصميم هذا لاحقًا دون إعادة بناء CRM أو Service Catalog.

---

## 24. ما لن نبنيه الآن

- Service Families.
- Service Packages.
- Service Add-ons كطبقات تجارية.
- Product catalog داخلي.
- بيع ثراء داخل المنصة.
- Shopping cart.
- Inventory.
- Shipping.
- Subscriptions.
- Usage credits.
- Affiliate system.
- Community.
- Mobile app.
- Microservices.
- React admin منفصلة.

---

## 25. هيكل المستودع المستهدف بعد التأسيس البرمجي

```text
ibtikartech-dashboard/
│
├── AGENTS.md
├── README.md
├── manage.py
├── pyproject.toml
├── .env.example
├── .gitignore
│
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
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
│   ├── public/
│   ├── account/
│   ├── customer_portal/
│   └── wagtailadmin/
│
├── static/
│
├── docs/
│   └── architecture/
│       ├── DECISIONS.md
│       └── ERD.md
│
└── tests/
```

---

## 26. ترتيب التنفيذ

```text
Phase 0 — Architecture
✓ Architecture baseline
✓ ERD v1.0
✓ Repository rules
✓ Complete README

Phase 1 — Foundation
→ Django project
→ PostgreSQL configuration
→ Wagtail
→ Custom User
→ django-allauth
→ settings split
→ environment management

Phase 2 — Core domain
→ accounts
→ crm
→ services

Phase 3 — Sales
→ Inquiry
→ Opportunity
→ FollowUpTask
→ Quote / QuoteItem

Phase 4 — Content
→ Wagtail pages
→ TharaaPage
→ Dynamic Service rendering

Phase 5 — Customer portal
→ SavedService
→ Preferences
→ Account portal

Phase 6 — Projects & support
→ Projects
→ Stages
→ Updates
→ Files
→ Approvals
→ Tickets

Phase 7 — Marketing & analytics
→ Campaigns
→ Attribution
→ Analytics events
→ Operational dashboards

Phase 8 — Integrations
→ WhatsApp
→ Email
→ Salla when required

Phase 9 — Commerce when justified
→ Orders
→ Payments
→ Invoices
→ Refunds
```

---

## 27. قواعد التنفيذ

أي مطور أو Agent يعمل على المستودع يجب أن يلتزم بما يلي:

- قراءة `AGENTS.md` قبل التعديل.
- عدم إضافة طبقات خدمات جديدة دون قرار معماري موثق.
- عدم تحويل ثراء إلى Product model في V1.
- عدم ربط الضغط على واتساب مباشرة بإنشاء Lead.
- عدم خلط User مع Contact.
- عدم كسر Snapshot الخاص بعروض الأسعار.
- عدم إضافة Microservices أو React Admin دون حاجة مثبتة.
- الحفاظ على RTL والإتاحة وتجربة الجوال في الواجهات.
- تشغيل الاختبارات ومراجعة الـdiff قبل الدمج.
- توثيق القرارات المعمارية المهمة داخل `docs/architecture/`.

راجع أيضًا [`AGENTS.md`](./AGENTS.md).

---

## 28. مراجع المعمارية داخل المستودع

- [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) — القرارات المعمارية الملزمة.
- [`docs/architecture/ERD.md`](./docs/architecture/ERD.md) — ERD v1.0 والعلاقات الأساسية.
- [`AGENTS.md`](./AGENTS.md) — قواعد العمل للمطورين والـAgents.

---

## 29. قاعدة المشروع المختصرة

```text
ServiceCategory → Service

User → optional Contact link
Contact → Inquiry → Opportunity → Quote → Project

Tharaa → Wagtail presentation page only

WhatsApp Click → AnalyticsEvent only

Commerce → future boundary, not V1
```

هذا هو **Architecture Baseline المعتمد لمنصة Ibtikar Tech Dashboard V1** حتى يتم توثيق أي تغيير مستقبلي بقرار معماري جديد.