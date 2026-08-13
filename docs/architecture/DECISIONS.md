# Architecture Decisions — Baseline v1.0

## ADR-001 — Modular Monolith

**Decision:** بناء النظام كتطبيق Django/Wagtail واحد مقسم إلى apps واضحة، وليس Microservices.

**Reason:** حجم المشروع الحالي وتدفقاته لا تبرر تعقيد الخدمات الموزعة، مع الحفاظ على حدود modules قابلة للفصل مستقبلًا.

## ADR-002 — Service catalog

**Decision:**

```text
ServiceCategory
      -> Service
```

فقط.

لا توجد Service Family / Package / Add-on كطبقات تجارية مستقلة في V1. السعر والتفاصيل ومدة التنفيذ والمتطلبات والمخرجات وحالة الإجراء كلها داخل Service.

## ADR-003 — Tharaa

**Decision:** ثراء صفحة عرض وتسويق داخل Wagtail في V1.

- ليست Service.
- ليست Product business model.
- لا توجد إدارة License أو Inventory أو Order داخل ابتكار تك لها حاليًا.
- زر الشراء يقود إلى متجر ثيمات سلة الخارجي.
- النقرات على المعاينة/الشراء تسجل كأحداث Analytics فقط.

## ADR-004 — User vs Contact

**Decision:** `User` هوية المصادقة؛ `Contact` هو الشخص داخل CRM.

- يمكن وجود Contact بدون User.
- يمكن ربط Contact موجود بحساب لاحقًا.
- لا ننشئ Contact جديدًا إذا أنشأ العميل حسابًا بعد تفاعل سابق ويمكن مطابقة هويته بأمان.

## ADR-005 — Optional customer account

الحساب اختياري للتصفح والاستفسار والتواصل.

Portal يضيف قيمة مثل حفظ الخدمات والمتابعة والعروض والمشاريع لاحقًا، ولا يعمل كجدار تسجيل.

## ADR-006 — WhatsApp

`whatsapp_click` = Analytics Event فقط.

لا يتحول إلى Contact/Inquiry/Opportunity حتى يوجد تفاعل تجاري حقيقي قابل للإثبات (نموذج مرسل، رسالة مستلمة عبر تكامل، أو إدخال موظف موثق).

## ADR-007 — Sales flow

المسار الأساسي:

```text
Inquiry -> Opportunity -> Quote -> Project
```

Account state وCRM lifecycle وOpportunity stage مفاهيم منفصلة.

## ADR-008 — Commerce deferred

Orders/Payments/Invoices/Refunds لا تُبنى في V1. توثق حدودها معماريًا فقط وتضاف عندما يصبح الدفع المباشر مطلوبًا.

## ADR-009 — Unified control panel

لوحة الموظفين موحدة تحت `/control/` باستخدام:

- Wagtail Pages للمحتوى التحريري.
- Wagtail ModelViewSets لنماذج التشغيل البسيطة.
- Custom operational views للـCRM 360، Pipeline، Dashboards، Timeline وغيرها.

لا توجد React Admin منفصلة في V1.

## ADR-010 — CMS vs domain

Business domain models مستقلة عن Wagtail Page tree.

Wagtail يدير صفحات Home / Solutions / Platforms / Tharaa / Articles / Case Studies / Legal وغيرها، بينما Service / Contact / Opportunity / Quote / Project تظل Django models مستقلة.

## ADR-011 — Privacy and consent

الموافقة التسويقية ليست boolean داخل Contact. تحفظ كـ`ConsentRecord` تاريخي يدعم grant/withdrawal والقناة والغرض والمصدر وإصدار السياسة.

## ADR-012 — Financial snapshots

`QuoteItem` يحتفظ بنسخة snapshot من الاسم والوصف والسعر وقت إنشاء العرض. تغيير Service لاحقًا لا يغير عرضًا سابقًا.

## ADR-013 — Database environments

**Decision:** استخدام SQLite للتطوير المحلي والاختبارات الأولية، مع PostgreSQL كقاعدة الإنتاج الإلزامية.

```text
local       -> SQLite (db.sqlite3)
test / CI   -> SQLite in-memory
production  -> PostgreSQL via DATABASE_URL
```

- لا يحتاج المطور إلى PostgreSQL أو Docker لبدء المشروع محليًا.
- `production.py` لا يسمح بالرجوع تلقائيًا إلى SQLite، ويوقف التشغيل إذا لم يتم توفير `DATABASE_URL` صالح لـPostgreSQL.
- يجب تجنب الاعتماد على سلوك خاص بـSQLite في منطق الأعمال، والحفاظ على Models/queries قابلة للعمل على PostgreSQL.
- قبل الإطلاق الفعلي تضاف/تشغل دورة اختبار توافق PostgreSQL كاملة تشمل migrations وDjango checks والاختبارات ذات الحساسية لقواعد البيانات.
