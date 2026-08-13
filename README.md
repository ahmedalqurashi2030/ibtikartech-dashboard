# Ibtikar Tech Dashboard

منصة الباك إند ولوحة التشغيل الداخلية وCRM وبوابة العميل لمنصة **ابتكار تك للحلول والخدمات الرقمية**.

> Status: Architecture baseline / initial foundation

## Core architecture

- Python
- Django 5.2 LTS
- Wagtail 7.4 LTS
- PostgreSQL
- Django Templates
- HTMX / lightweight JavaScript where needed
- django-allauth for customer authentication
- S3-compatible storage for media/files
- Redis + Celery only when background jobs are actually needed

## Architectural decisions

1. **Service Category → Service فقط**. لا توجد Service Family أو Packages أو Add-ons كطبقات تجارية مستقلة في V1.
2. **ثراء صفحة عرض وتسويق داخل Wagtail**، وليس Product model في V1. الشراء يتم خارجيًا عبر متجر ثيمات سلة.
3. `User` هوية دخول، بينما `Contact` هو الشخص داخل CRM، ويمكن أن يوجد Contact بلا حساب.
4. إنشاء حساب العميل اختياري ولا يمنع تصفح الخدمات أو إرسال الاستفسار أو التواصل عبر واتساب.
5. ضغط واتساب هو Analytics Event فقط، وليس Lead مؤكدًا.
6. المسار التجاري الأساسي: `Inquiry → Opportunity → Quote → Project`.
7. Orders / Payments / Invoices مؤجلة حتى يصبح الدفع الإلكتروني المباشر مطلوبًا.
8. المشروع Modular Monolith، وليس Microservices.
9. Wagtail هو shell لوحة التشغيل `/control/` باستخدام Pages + ModelViewSets + Custom operational views.

## Planned apps

```text
apps/
├── core/
├── accounts/
├── crm/
├── services/
├── content/
├── sales/
├── customer_portal/
├── projects/
├── support/
├── marketing/
├── analytics/
└── integrations/
```

## Public content

Wagtail manages editorial/content pages such as:

- Home
- Solutions
- Platforms
- Tharaa presentation page
- Articles / Knowledge
- Case studies / Portfolio
- About
- Legal pages

Business-domain models such as Service, Contact, Opportunity, Quote, and Project remain Django domain models and are managed through the unified Wagtail control panel.

## Repository rules

See [`AGENTS.md`](./AGENTS.md) and the architecture documentation under [`docs/`](./docs/).
