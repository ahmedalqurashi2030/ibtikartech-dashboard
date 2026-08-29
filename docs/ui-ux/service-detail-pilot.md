# عقد Pilot عائلة صفحات تفاصيل الخدمات

## الهدف

إثبات أن Django Template Family تقلل التكرار البنيوي مع بقاء رحلة كل خدمة
ومحتواها مستقلين. الـPilot إعادة هيكلة فقط وليس إعادة تصميم.

## البنية المقترحة

```text
public_preview/base.html
└── public_preview/families/service_detail_base.html
    ├── pages/store-launch.html
    └── pages/ecommerce-growth.html
```

العائلة تملك:

- الأصول المشتركة لصفحات تفاصيل الخدمات.
- `body_attrs` و`main` wrapper.
- Breadcrumb skeleton.
- Decision navigation وتسميات الحالات وترتيبها.
- تحميل JavaScript المشترك في نهاية الصفحة.

الصفحة تملك:

- title وmeta description.
- اسم Breadcrumb الحالي.
- محتوى Hero وGallery.
- بيانات Quick info.
- محتوى decision panels.
- process وrelated services وCTA.

## لماذا لا نستخدم Universal Section

الأقسام متشابهة بصريًا لكنها تؤدي أدوارًا تجارية مختلفة. تحويلها إلى include
واحد يقرأ عشرات القيم والشروط سيخفي الدلالة ويجعل أي تعديل مخاطرة على جميع
الصفحات. نشارك الهيكل الثابت أولًا، ثم نستخرج أصغر نمط ثبت تطابقه.

## عقد الانتقال المؤقت

خلال الـPilot يقبل النظام نوعين من الصفحات:

1. صفحة قديمة ترث `public_preview/base.html` وتملك `block body` واحدًا.
2. صفحة Pilot ترث عائلة معتمدة ولا تعيد تعريف shell العام.

هذا ليس استثناءً غير محدود. يجب أن تحتوي اختبارات العقد على allowlist للعائلات
المعتمدة، وأن تفشل أمام parent مجهول أو include خارج `components/` و`families/`.

## خطة التحقق

- Render GET للمسارين والتحقق من 200.
- فحص وجود `main-content` مرة واحدة.
- فحص title/meta والروابط المسماة.
- فحص عدم تكرار أصول service detail.
- فحص IDs وARIA bindings.
- اختبار Decision tabs وGallery المستهدف.
- مقارنة HTML الناتج قبل/بعد في المناطق غير المقصود تغييرها.
- screenshots عند 375px و1440px مع RTL وreduced motion.

## قرار التعميم

لا تُرحّل الصفحات الأربع الأخرى إلا إذا نجح الـPilot من دون إضافة شروط تعتمد
على اسم الصفحة، ومن دون تغيير بصري أو وظيفي غير مقصود. عند النجاح تصبح العائلة
هي العقد القانوني لصفحات الخدمة الجديدة.
