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

## المجموعة الحالية: Articles

### الصفحات

- `templates/public_preview/pages/knowledge.html`
- `templates/public_preview/pages/article-product-page.html`
- `templates/public_preview/pages/article-store-launch.html`
- `templates/public_preview/pages/article-store-redesign.html`

### العقد المعتمد

- `article_detail_base.html` يملك شريط تقدم القراءة و`main` وحزمة
  `articles.css` و`articles.js` المتطابقة للمقالات الثلاثة.
- كل مقال يملك metadata وOpen Graph وJSON-LD ومحتوى المقال والعناصر المرتبطة.
- `knowledge.html` يبقى صفحة مستقلة لأنه CollectionPage بفلترة ورحلة اكتشاف،
  وليس مقالًا تفصيليًا.
- ملكية أصول المقالات route-scoped ومحصورة في فهرس المعرفة والمقالات الثلاثة.
- لا تُستخرج فقرات المقال أو جداول المحتوى إلى مكوّنات مشتركة؛ دلالتها تحريرية.

### معايير القبول البنيوية

- title وdescription وOpen Graph وJSON-LD محفوظة لكل مقال.
- بنية `article` و`aside` وTable of Contents والمحتوى المرتبط محفوظة.
- رابط كل مقال وIDs الداخلية وتاريخ النشر بلا تغيير.
- `articles.css` و`articles.js` يظهران مرة واحدة لكل مستهلك معتمد.
- Browser QA وSEO rendering وa11y/performance الشاملة مؤجلة للمجموعة 9.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
