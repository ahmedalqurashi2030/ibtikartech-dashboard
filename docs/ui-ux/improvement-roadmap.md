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

## المجموعة التالية: Comprehensive QA

اكتملت مجموعات التطوير البنيوي والقياس وحوكمة المحتوى في PRs متسلسلة Draft.
لا يوجد تغيير تطويري إضافي آمن قبل الاختبار؛ أي إصلاح جديد يجب أن ينتج عن عيب
مثبت في QA، لا عن توسع جديد في النطاق.

### نطاق البوابة

- اختبارات Django والعقود والملكية.
- 22 مسارًا على الجوال والكمبيوتر.
- الصفحات الحرجة على المقاسات الوسطية.
- Keyboard/focus/RTL/reduced-motion وaxe.
- نموذج التواصل والـData Layer والـrate limit.
- screenshots وvisual regression.
- Lighthouse وملكية الأصول.
- تحقق Browser QA على self-hosted runner دون اشتراك خارجي.

الخطة التنفيذية ومعايير الإيقاف والأدلة المطلوبة موثقة في
`docs/ui-ux/comprehensive-qa-plan.md`. لا دمج ولا نشر قبل نجاحها.

## سياسة Pull Requests

- PR للعقد والخارطة فقط.
- PR للـPilot بلا تغيير بصري.
- PR لترحيل بقية عائلة الخدمات.
- PR مستقل لملكية الأصول وإزالة التكرار.
- PRs تحسين التصميم تأتي بعد استقرار البنية.

كل PR يذكر بوضوح ما تغيّر، ما لم يتغيّر، الفحوص المنفذة، والفحوص المؤجلة.
