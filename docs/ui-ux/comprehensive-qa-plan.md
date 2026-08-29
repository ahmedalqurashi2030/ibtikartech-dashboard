# خطة QA الشاملة قبل الدمج والنشر

هذه الخطة هي البوابة النهائية للـPRs المتسلسلة. لا يبدأ دمج أو نشر قبل اكتمالها
على رأس السلسلة، لأن الفرع الأعلى يحتوي جميع التغييرات السابقة.

## نقطة الاختبار

- المستودع: `ahmedalqurashi2030/ibtikartech-dashboard`
- رأس السلسلة الحالي: `docs/public-content-ownership`
- آخر commit قبل إعداد الخطة: `e51d5295d72170a1ab3775f50c4b0410e53a8c55`
- الإنتاج لا يُستخدم كبيئة كتابة أو تثبيت.
- لا reboot ولا تحديث نظام ضمن QA إلا بموافقة مستقلة وبعد snapshot.

## ترتيب PRs

1. #68 — Service detail family.
2. #70 — Route-scoped asset ownership.
3. #71 — Service category family.
4. #72 — Article detail family.
5. #73 — Global shell accessibility hardening.
6. #74 — Success-bound conversion contracts.
7. #75 — Public content ownership and Wagtail gates.
8. PR خطة QA.

يُختبر رأس السلسلة أولًا. بعد النجاح تُحوّل PRs من Draft وتُدمج بالترتيب نفسه،
مع إعادة فحص سريع بعد كل تغيير base لأن GitHub سيعيد حساب الفروق.

## المرحلة 1: سلامة المستودع وDjango

- `git diff --check`
- `python3 manage.py check`
- `python3 manage.py makemigrations --check --dry-run`
- Ruff على ملفات Python المتغيرة فقط.
- `scripts/verify_django_template_contract.py`
- `scripts/verify_frontend_single_repo_ownership.py`
- اختبارات:
  - `apps.public_preview.tests.test_template_body_contract`
  - `apps.public_preview.tests.test_preview_routes`
  - `apps.public_preview.tests.test_ux_foundation`
  - `apps.public_preview.tests.test_explicit_view_routes`
  - `apps.public_preview.tests.test_contact_submission`
  - `apps.public_preview.tests.test_content_ownership_contract`
  - `apps.content.tests.test_site_settings`
  - `apps.content.tests.test_content_pages`

بوابة النجاح: صفر خطأ، صفر migration جديدة، ولا تعديل غير متوقع خارج السلسلة.

## المرحلة 2: مصفوفة العرض

### جميع المسارات

تُفحص الصفحات العامة الـ22 عند عرضين أساسيين:

- 375×812 للجوال.
- 1440×1000 للكمبيوتر.

### الصفحات الحرجة

تُضاف 768×1024 و1024×900 للصفحات:

- الرئيسية.
- الخدمات.
- المتاجر الإلكترونية.
- صفحة خدمة تحسين المنتج.
- ثراء.
- المعرفة ومقال واحد.
- التواصل.

بوابة النجاح:

- لا overflow أفقي.
- Header وCTA لا يغطيان المحتوى.
- RTL وترتيب النص والأيقونات صحيح.
- لا صور مكسورة ولا font fallback غير مقصود.
- لا duplicate IDs أو anchors مفقودة.
- المقارنة البصرية لا تكشف تغييرًا غير موثق.

## المرحلة 3: لوحة المفاتيح والوصول

- Skip link يصل إلى `#main-content`.
- Mega Menu: Enter وSpace وArrowDown وArrowUp وEscape واسترجاع التركيز.
- قائمة الجوال: فتح، focus trap، details، زر الإغلاق، backdrop، Escape.
- Theme toggle: الاسم والحالة ووضوح التركيز.
- المقالات: Table of Contents ونسخ الرابط.
- الخدمات: Gallery وDecision Tabs.
- ثراء: dialogs وstudio controls.
- التواصل: الخطوات، الخطأ، النجاح، وaria-live.
- تشغيل axe على جميع المسارات؛ لا Critical أو Serious.
- مراجعة يدوية للتباين وfocus-visible وreduced-motion.

## المرحلة 4: التحويل والباك إند

- نجاح POST واحد ينشئ Contact/Inquiry صحيحين ويرجع مرجع `IBT-*`.
- الضغط المتكرر أثناء `aria-busy=true` لا ينشئ طلبًا ثانيًا.
- أخطاء phone/email تكشف الخطوة والحقل وتضيف `aria-invalid`.
- honeypot وrate limit يرفضان دون إنشاء بيانات.
- `inquiry_submitted` يظهر مرة واحدة بعد 201 فقط.
- نقر Next/Previous أو الحقول لا يطلق conversion.
- كل `quote_request` يحمل label وdestination صحيحين.
- GTM/DIRECT يبقيان معطلين عندما `ENABLE_EXTERNAL_TRACKING=false`.

## المرحلة 5: الأداء والأصول

- لا أصل route-scoped خارج المستهلكين المحددين.
- لا CSS/JS مكرر في HTML الفعّال.
- جميع scripts الخارجية المحلية `defer` أو module/async حيث يلزم.
- Lighthouse للصفحات الحرجة، مع أهداف مختبرية:
  - Performance ≥ 85 للجوال و≥ 90 للكمبيوتر.
  - Accessibility ≥ 95.
  - Best Practices ≥ 95.
  - SEO ≥ 95 للصفحات indexable.
  - CLS < 0.1.
  - LCP < 2.5s في بيئة القياس المستقرة.
- توثيق أي استثناء مع السبب والأصل والصفحة وخطة الإصلاح.

## Browser QA المجاني على VPS

الخادم الذاتي كافٍ ولا يحتاج اشتراك BrowserStack. الحالة السابقة أظهرت أن Chrome
غير موجود في `/opt/hostedtoolcache/setup-chrome`. قبل QA فقط:

1. فحص runner والـworkflow الحاليين دون reboot.
2. تجربة `browser-actions/setup-chrome@v2` كما هو معرف في workflow.
3. إذا فشل بسبب مكتبات نظام، إعداد قائمة الحزم المطلوبة وعرضها للموافقة قبل
   تثبيتها؛ لا تستخدم sudo أو تغيّر VPS ضمن تنفيذ تلقائي غير مراجع.
4. بديل أكثر عزلة: container مخصص للـQA على runner، دون تعريض أي port عام.
5. لا فتح Chrome debugging port على `0.0.0.0/0`.

وجود رسالة `Restart required` لا يعني أن Browser QA يحتاج reboot. إعادة التشغيل
قرار صيانة منفصل يسبب downtime ويؤجل إلى نافذة معتمدة.

## الأدلة المطلوبة

- سجل أو artifact لكل مجموعة اختبارات.
- screenshots باسم route/viewport/theme.
- تقرير axe.
- تقارير Lighthouse.
- سجل Data Layer لسيناريو التواصل.
- قائمة الاستثناءات إن وجدت.
- SHA المختبر النهائي.

## قرار الإطلاق

لا تتحول PRs من Draft ولا تُدمج إذا فشلت بوابة واحدة. بعد النجاح:

1. توثيق SHA والنتائج في PR الأعلى.
2. دمج السلسلة بالترتيب.
3. تشغيل smoke على الفرع النهائي.
4. نشر مع rollback معروف.
5. فحص الإنتاج read-only للروابط الحرجة والنموذج دون إرسال بيانات تجريبية غير
   معلّمة.
