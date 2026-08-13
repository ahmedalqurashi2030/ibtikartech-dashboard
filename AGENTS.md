# AGENTS.md — Ibtikar Tech Dashboard

هذه التعليمات ملزمة لأي Agent أو مطور يعمل على هذا المستودع.

## Product baseline

هذا المشروع هو الباك إند ولوحة التشغيل وCRM وبوابة العميل لمنصة ابتكار تك.

### Non-negotiable domain decisions

- الخدمات: `ServiceCategory -> Service` فقط.
- لا تنشئ `ServiceFamily`, `ServicePackage`, أو `ServiceAddon` كطبقات تجارية مستقلة دون قرار معماري جديد صريح.
- ثراء في V1 صفحة عرض داخل Wagtail وليست Product/Commerce model.
- `User` للمصادقة فقط، و`Contact` هو CRM identity.
- يجب دعم Contact بلا User، وربطه بحساب لاحقًا دون فقدان التاريخ.
- الحساب اختياري ولا يجب أن يكون شرطًا للاستفسار أو تصفح الخدمات.
- `whatsapp_click` حدث تحليلي وليس Lead.
- CRM flow الأساسي: `Inquiry -> Opportunity -> Quote -> Project`.
- لا تنشئ Orders/Payments/Invoices قبل تشغيل commerce فعليًا.

## Engineering approach

- Modular monolith.
- Django 5.2 LTS + Wagtail 7.4 LTS + PostgreSQL.
- Django Templates + HTMX/lightweight JS؛ لا تنشئ React admin منفصلة دون قرار صريح.
- لوحة الموظفين موحدة تحت `/control/` باستخدام Wagtail Admin وModelViewSets وCustom operational views.
- Business models تظل Django models مستقلة عن Wagtail Page tree.
- استخدم UUID للمفاتيح العامة ما لم يوجد سبب موثق خلاف ذلك.
- استخدم `settings.AUTH_USER_MODEL` لكل علاقات المستخدم.
- حافظ على RTL والعربية كحالة استخدام أساسية.

## Quality gates

قبل اعتبار أي مرحلة مكتملة:

1. راجع المتطلبات والـERD المرتبطين بها.
2. افحص `git diff` ولا تغيّر ملفات غير مرتبطة بالمهمة.
3. شغّل migrations/tests ذات الصلة.
4. افحص صلاحيات access control وعدم تسريب بيانات العملاء.
5. تحقق من حالات null والضيوف وربط الحسابات.
6. تحقق من RTL والجوال والإتاحة لأي واجهة جديدة.
7. لا تدّع نجاح اختبار لم يتم تشغيله فعليًا.

## Data safety

- لا تحفظ أسرارًا أو tokens داخل Git.
- استخدم environment variables.
- لا تسجل كلمات مرور، tokens، أو payloads حساسة في logs.
- تعامل مع Consent كـaudit history وليس boolean واحد فقط.
- احفظ snapshots المالية داخل QuoteItem بدل الاعتماد على سعر Service الحالي.

## Architecture source of truth

ابدأ من `docs/architecture/ERD.md` و`docs/architecture/DECISIONS.md` قبل تغيير النماذج الأساسية.
