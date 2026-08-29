# عقد ملكية المحتوى العام

## القرار الحالي

المسارات العامة المنشورة تملك محتواها قوالب Django داخل
`templates/public_preview/pages/`. إعدادات Wagtail المشتركة فقط هي النشطة في
هذه الواجهة: `SiteSettings` و`TrackingSettings` عبر
`apps/content/site_config.py`.

نماذج Wagtail من نوع `HomePage` و`SolutionPage` و`PlatformPage` و
`TharaaPage` و`ArticlePage` و`CaseStudyPage` و`PortfolioPage` و
`AboutPage` و`LegalPage` و`LandingPage` موجودة كقدرات تحريرية، لكنها
ليست مصدر محتوى المسارات العامة الحالية.

## لماذا لا نفعّل الربط الآن

ربط القوالب مباشرة بهذه النماذج الآن سينشئ مصدرين للحقيقة: HTML المراجع والمنشور،
وحقول CMS قد تكون فارغة أو مختلفة في البنية وSEO. هذا يهدد المحتوى العربي،
الروابط الداخلية، JSON-LD، ونتيجة المقارنة البصرية، ويتطلب migrations وخطة
ترحيل محتوى لم تُعتمد بعد.

## المسموح الآن

| المجال | المالك |
| --- | --- |
| الهوية والشعار والتذييل | Wagtail `SiteSettings` |
| التواصل والسوشيال | Wagtail `SiteSettings` |
| SEO الافتراضي والتحقق | Wagtail `SiteSettings` |
| معرّفات القياس الخارجية | Wagtail `TrackingSettings` مع بوابة البيئة |
| نصوص وأقسام الصفحات العامة | Django templates |
| ترتيب عائلات العرض والأصول | Template وAsset contracts |
| طلبات المشاريع | `PublicInquiryForm` ثم CRM/Sales models |

## بوابات تفعيل Wagtail Page content

لا ينتقل أي حقل صفحة إلى Wagtail قبل اكتمال جميع الآتي:

1. خريطة مصدر على مستوى كل حقل، مع تحديد القيمة المطلوبة والاختيارية.
2. ترحيل محتوى قابل للتكرار وخطة rollback.
3. تطابق title وdescription وOpen Graph وJSON-LD والروابط.
4. Preview وpublishing workflow وصلاحيات تحرير واضحة.
5. قطع مسار واحد بلا fallback صامت أو ملكية مزدوجة.
6. اجتياز rendering وvisual regression للمسار قبل الدمج.

## المرحلة الأولى المقترحة لاحقًا

بعد QA النهائي، يبدأ Pilot بمقال واحد أو صفحة قانونية منخفضة المخاطر، لا
بالرئيسية أو ثراء أو صفحات الخدمات. يثبت الـPilot التحرير والمعاينة والـrollback
قبل توسيع النطاق.
