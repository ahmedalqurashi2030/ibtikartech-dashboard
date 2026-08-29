# خارطة تطوير UI/UX

تعتمد الخارطة أسلوب ترحيل تدريجي. لا تُنفّذ المجموعات معًا، ولا يُخلط تغيير
المحتوى أو إعادة التصميم مع إعادة الهيكلة في Pull Request واحد.

## ترتيب العمل

| الترتيب | المجموعة | الهدف | النطاق الأساسي | الخطر الأهم | معيار الانتهاء |
| ---: | --- | --- | --- | --- | --- |
| 0 | Baseline and contracts | تثبيت مصدر الحقيقة والقياسات | shell، manifest، assets، tests | قياس وضع غير صحيح | خريطة ملكية وعقد مكتوب وصور مرجعية |
| 1 | Template architecture pilot | إثبات Page Family آمنة | صفحتا store-launch وecommerce-growth | كسر أدوات التحويل والعقد | نفس العرض والسلوك مع عقد اختبارات جديد |
| 2 | Service detail family | ترحيل بقية صفحات الخدمة الأربع | صفحات الخدمات الست | universal component متشعب | هيكل مشترك واختلافات صفحة واضحة |
| 3 | Asset ownership | جعل التحميل حسب الحاجة | CSS/JS العام وعائلات الصفحات | حذف ملف ما زال مستخدمًا | مالك واحد لكل أصل ومرجع |
| 4 | Category pages | توحيد رحلة فئات الحلول | ecommerce، websites، growth، brand-content، custom-systems | تسطيح اختلاف أهداف الصفحات | عائلة مرنة مع أقسام سردية مستقلة |
| 5 | Articles | توحيد تجربة المعرفة | listing و3 article detail pages | تراجع SEO أو hierarchy | قالب مقال دلالي وبيانات SEO محفوظة |
| 6 | Global shell hardening | تحسين التنقل المؤكد فقط | Header، mega menu، mobile menu، footer | تغيير بصري غير مبرر | keyboard/focus/RTL وتوافق الجوال |
| 7 | Unique conversion pages | تحسين التجربة والتحويل | home، services، tharaa، contact | خلط إعادة التصميم بالهندسة | هدف وCTA وقياس واضح لكل صفحة |
| 8 | Wagtail content evolution | تحرير المحتوى المستقر | blocks/snippets المختارة | CMS يفرض بنية غير ناضجة | عقود تحرير تعكس المكونات المستقرة |
| 9 | Comprehensive QA | إطلاق آمن | جميع الصفحات والمقاسات | ثغرات بصرية ومتصفحات | Visual/a11y/performance regression كاملة |

## المجموعة الحالية: Category pages

### الصفحات

- `templates/public_preview/pages/ecommerce.html`
- `templates/public_preview/pages/websites.html`
- `templates/public_preview/pages/brand-content.html`
- `templates/public_preview/pages/growth.html`
- `templates/public_preview/pages/custom-systems.html`

### العقد المعتمد

- `service_category_base.html` يملك document-family shell و`main` وحزمة
  CSS/JavaScript المتطابقة.
- كل صفحة تملك عنوان SEO ووصفه وخصائص `body` وجميع أقسام المحتوى.
- `ecommerce.html` يحتفظ بامتدادات أصول صريحة لأنه يستخدم
  `approved-source.css` و`ecommerce-category.css` و`approved-source.js`
  ولا يستخدم بطاقات الخدمات المرتبطة.
- اختلاف السرد أو ترتيب الأقسام لا يتحول إلى شروط داخل القالب المشترك.
- أي أصل route-scoped يُحسب من block الفعّال؛ override مختلف لا يرث أصلًا
  لم تطلبه الصفحة.

### معايير القبول البنيوية

- الروابط والصور والنصوص وanalytics attributes وIDs محفوظة بلا تغيير.
- كل صفحة ترث عائلة واحدة مع blocks المطلوبة مرة واحدة.
- كل أصل CSS/JavaScript فعّال يظهر مرة واحدة فقط للمستهلكين المعتمدين.
- أدوات التحويل تبقى idempotent ولا تسطّح صفحات العائلات.
- Browser QA والمقارنة البصرية وa11y/performance الشاملة تُنفّذ في المجموعة 9
  قبل الدمج النهائي.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
