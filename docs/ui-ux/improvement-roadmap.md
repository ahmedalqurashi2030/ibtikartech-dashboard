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

## المجموعة التالية: Template architecture pilot

### الصفحات

- `templates/public_preview/pages/store-launch.html`
- `templates/public_preview/pages/ecommerce-growth.html`

### سبب الاختيار

الصفحتان تشتركان في رحلة قرار واحدة، لكن محتواهما مختلف بما يكفي لاختبار مرونة
العائلة: الأولى خدمة تأسيس، والثانية خدمة قياس وتحسين لمتجر قائم.

### المشترك المؤكد

- حزمة CSS وJavaScript.
- `body` attributes و`main` shell.
- Breadcrumb hierarchy.
- Hero + gallery + decision information.
- Quick information strip.
- Decision navigation بخمس حالات.
- Problems، fit، scope، deliverables، exclusions.
- Process، related services، final CTA.

### التنفيذ المقترح

1. التقاط baseline للجوال والكمبيوتر للصفحتين.
2. إنشاء `templates/public_preview/families/service_detail_base.html`.
3. مشاركة الهيكل العام وDecision Navigation والأصول أولًا.
4. إبقاء محتوى Hero وPanels وProcess وCTA داخل الصفحة في الـPilot.
5. السماح بالمكونات الصغيرة لاحقًا فقط بعد ثبوت تطابق دلالتها.
6. تحديث `test_template_body_contract.py` و
   `verify_django_template_contract.py` وأدوات التحويل وworkflow guards في commit
   واحد مع القالب الجديد.
7. تشغيل الاختبارات المستهدفة ثم CI الكامل؛ لا دمج قبل نجاح الاثنين.

### ممنوع في الـPilot

- تغيير النصوص أو الصور أو الروابط أو SEO.
- تعديل models أو migrations أو إعدادات النشر.
- نقل المحتوى إلى قاعدة البيانات أو StreamField.
- إزالة ملفات CSS المكررة في نفس PR.
- إعادة تصميم الصفحة أو إضافة Animation جديدة.
- ترحيل الصفحات الست دفعة واحدة.

### معايير القبول

- URLs وnamed routes دون تغيير.
- عنوان الصفحة والوصف وanalytics attributes محفوظة.
- DOM الدلالي وIDs الفعالة بلا تكرار.
- Decision tabs وgallery تعمل بالنقر ولوحة المفاتيح.
- لا overflow عند 375px ولا كسر RTL.
- reduced-motion وfocus states محفوظان.
- page-family asset يظهر مرة واحدة فقط في HTML الناتج.
- أدوات التحويل reproducible ولا تعيد الصفحة إلى العقد القديم.
- اختبارات services وtemplate contract وUX foundation ناجحة.
- مقارنة screenshots لا تكشف تغييرًا بصريًا مقصودًا.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
