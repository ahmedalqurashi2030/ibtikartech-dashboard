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

## المجموعة الحالية: Global shell hardening

### النطاق

- `templates/public_preview/components/header.html`
- `templates/public_preview/components/mobile_menu.html`
- `static/public_preview/assets/js/ibtikar-shell.js`
- `static/public_preview/assets/css/ibtikar-shell.css`

### التحسينات المؤكدة

- إزالة popup semantics من رابط الوجهة؛ زر السهم وحده يملك التوسيع.
- جعل Mega Menu وقائمة الجوال `inert` في الحالة المغلقة منذ HTML الأولي.
- دعم ArrowUp لفتح Mega Menu والتركيز على آخر عنصر، مع استمرار
  Enter وSpace وArrowDown وEscape.
- نقل رأس قائمة الجوال وزر الإغلاق من HTML مولّد داخل JavaScript إلى القالب.
- جعل backdrop بصريًا وخارج ترتيب Tab لأن زر الإغلاق وEscape هما مسارا
  لوحة المفاتيح المعتمدان.
- إضافة focus-visible واضح لعناصر وروابط وsummary قائمة الجوال.

### الحدود

- لا تغيير في بنية التنقل أو أسماء الروابط أو وجهاتها.
- لا تغيير في الألوان أو المقاسات العامة للـHeader/Footer.
- لا مكتبة جديدة ولا إعادة كتابة للـshell.
- Browser QA والتوافق الفعلي عبر المقاسات مؤجلان للمجموعة 9 قبل الدمج.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
