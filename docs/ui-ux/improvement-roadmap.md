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

## المجموعة الحالية: Wagtail content evolution

### النتيجة المعمارية

- `SiteSettings` و`TrackingSettings` هما المالكان النشطان للإعدادات العامة.
- محتوى المسارات العامة الـ22 يبقى template-owned في هذه المرحلة.
- نماذج Wagtail Page الحالية Editorial Candidates وليست مصادر عرض عامة.
- `wagtail_page_binding=false` مسجل في manifest وعقد قابل للفحص.
- لا models جديدة ولا migrations ولا نقل محتوى في هذه المجموعة.

### سبب عدم الربط المباشر

توجد نماذج Wagtail جاهزة وظيفيًا، لكنها تعرض `content/standard_page.html`
ولا تملك تطابقًا مثبتًا مع عائلات العرض وSEO وJSON-LD الحالية. تفعيلها الآن
ينشئ dual ownership وfallback صامتًا ويعرّض المحتوى المنشور للتراجع.

### بوابات التفعيل اللاحق

- Field mapping.
- Content migration + rollback.
- SEO/structured-data parity.
- Preview/publishing workflow.
- Route cutover بلا مصدرين.
- Visual regression approval.

التفاصيل في `docs/ui-ux/content-ownership-contract.md`. بعد QA النهائي يبدأ
Pilot منخفض المخاطر بمقال واحد أو صفحة قانونية، لا بالرئيسية أو ثراء.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
