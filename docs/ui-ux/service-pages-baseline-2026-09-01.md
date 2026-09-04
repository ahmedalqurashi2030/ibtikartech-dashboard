# خط أساس تنفيذ تجربة صفحات الخدمات

## مرجع المستودع

- التاريخ: 2026-09-01.
- الفرع المحلي: `service-pages-v2`.
- المرجع الرسمي: `origin/main`.
- SHA الأساس: `a39dcc9cc016d1893618145784416f13fdec09f9`.
- المستودع: `https://github.com/ahmedalqurashi2030/ibtikartech-dashboard.git`.
- طريقة الجلب: partial clone بمرشح `blob:none` بسبب انقطاعات الشبكة أثناء تنزيل
  الحزمة الكاملة. تم تثبيت commit والشجرة، وقورنت ملفات النطاق عبر Git OIDs من
  دون استبدال working tree.

## ملفات النطاق المطابقة للأساس

- `apps/public_preview/asset_contract.py`
- `apps/public_preview/template_contract.py`
- `docs/ui-ux/current-design-contract.md`
- `docs/ui-ux/content-ownership-contract.md`
- `docs/ui-ux/comprehensive-qa-plan.md`
- `templates/public_preview/pages/services.html`

## ملفات النطاق المعدلة محليًا

- `templates/public_preview/families/service_detail_base.html`
- `templates/public_preview/families/service_category_base.html`
- `templates/public_preview/pages/ecommerce.html`
- `templates/public_preview/pages/store-launch.html`
- `templates/public_preview/pages/product-page-optimization.html`

هذه الملفات مملوكة للتغيير المحلي السابق. لا تُستبدل بنسخ `main`، وتخضع
للمراجعة والاختبارات قبل اعتمادها.

## ملفات جديدة غير موجودة في الأساس

- `static/public_preview/assets/css/service-primitives.css`
- `static/public_preview/assets/js/service-primitives.js`
- `docs/ui-ux/service-pages-experience-execution-plan-v2.md`
- `LOCAL_DEVELOPMENT_COMMANDS.md`

## قيود ومخاطر معروفة

- لم يكتمل تنزيل جميع blobs بسبب `curl 56: connection reset`، لذلك لا يعتمد
  التنفيذ على `git diff` الكامل حتى تتحسن الشبكة أو تُجلب الملفات عند الطلب.
- لا توجد أسرار أو tokens ضمن ملفات المشروع؛ المصادقة محفوظة في Git Credential
  Manager.
- لا يُنشر أو يُدفع أي تغيير قبل اكتمال بوابات QA وموافقة صريحة مستقلة.

