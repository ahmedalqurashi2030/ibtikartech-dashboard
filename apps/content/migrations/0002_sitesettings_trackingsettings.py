# Generated for the site-scoped public configuration foundation.

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0001_initial"),
        ("wagtailimages", "0027_image_description"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("site_name_ar", models.CharField(default="ابتكار تك", max_length=120, verbose_name="اسم الموقع بالعربية")),
                ("site_name_en", models.CharField(default="Ibtikar Tech", max_length=120, verbose_name="اسم الموقع بالإنجليزية")),
                ("tagline_ar", models.CharField(default="للحلول والخدمات الرقمية", max_length=180, verbose_name="الوصف المختصر بالعربية")),
                ("tagline_en", models.CharField(blank=True, max_length=180, verbose_name="الوصف المختصر بالإنجليزية")),
                ("contact_email", models.EmailField(blank=True, max_length=254, verbose_name="البريد العام")),
                ("support_email", models.EmailField(blank=True, max_length=254, verbose_name="بريد الدعم")),
                ("phone_number", models.CharField(blank=True, help_text="بصيغة دولية مثل +9665XXXXXXXX.", max_length=16, validators=[django.core.validators.RegexValidator(message="استخدم رقمًا دوليًا صالحًا من 7 إلى 15 رقمًا، ويمكن أن يبدأ بعلامة +.", regex="^\\+?[1-9]\\d{6,14}$")], verbose_name="رقم الهاتف")),
                ("whatsapp_number", models.CharField(blank=True, help_text="بصيغة دولية مثل +9665XXXXXXXX.", max_length=16, validators=[django.core.validators.RegexValidator(message="استخدم رقمًا دوليًا صالحًا من 7 إلى 15 رقمًا، ويمكن أن يبدأ بعلامة +.", regex="^\\+?[1-9]\\d{6,14}$")], verbose_name="رقم واتساب")),
                ("whatsapp_default_message", models.CharField(blank=True, max_length=500, verbose_name="رسالة واتساب الافتراضية")),
                ("address", models.CharField(blank=True, max_length=300, verbose_name="العنوان")),
                ("business_hours", models.CharField(blank=True, max_length=180, verbose_name="ساعات العمل")),
                ("x_url", models.URLField(blank=True, verbose_name="X / Twitter")),
                ("instagram_url", models.URLField(blank=True, verbose_name="Instagram")),
                ("linkedin_url", models.URLField(blank=True, verbose_name="LinkedIn")),
                ("youtube_url", models.URLField(blank=True, verbose_name="YouTube")),
                ("tiktok_url", models.URLField(blank=True, verbose_name="TikTok")),
                ("snapchat_url", models.URLField(blank=True, verbose_name="Snapchat")),
                ("default_seo_title", models.CharField(default="ابتكار تك | حلول رقمية للتجارة والأعمال في السعودية", max_length=70, verbose_name="عنوان SEO الافتراضي")),
                ("default_meta_description", models.CharField(default="ابتكار تك تبني وتطوّر المتاجر والمواقع والهوية والقياس والأنظمة للمشاريع في السعودية والخليج.", max_length=170, verbose_name="وصف SEO الافتراضي")),
                ("title_suffix", models.CharField(blank=True, default="ابتكار تك", max_length=80, verbose_name="لاحقة عنوان الصفحات")),
                ("x_username", models.CharField(blank=True, help_text="من دون @", max_length=50, verbose_name="اسم حساب X")),
                ("google_site_verification", models.CharField(blank=True, max_length=255, verbose_name="رمز تحقق Google")),
                ("bing_site_verification", models.CharField(blank=True, max_length=255, verbose_name="رمز تحقق Bing")),
                ("organization_legal_name", models.CharField(blank=True, max_length=180, verbose_name="الاسم القانوني للمنشأة")),
                ("footer_description", models.CharField(default="نبني علامات وتجارب ومنتجات رقمية مترابطة تساعد المشاريع على الإطلاق والعمل والنمو ضمن نطاق واضح.", max_length=320, verbose_name="وصف التذييل")),
                ("copyright_text", models.CharField(default="جميع الحقوق محفوظة.", max_length=180, verbose_name="نص حقوق النشر")),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("default_social_image", models.ForeignKey(blank=True, help_text="الصورة الافتراضية عند مشاركة صفحة لا تملك صورة خاصة.", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to="wagtailimages.image")),
                ("favicon", models.ForeignKey(blank=True, help_text="أيقونة الموقع. يفضل PNG مربعًا عالي الدقة.", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to="wagtailimages.image")),
                ("logo", models.ForeignKey(blank=True, help_text="الشعار الأساسي. يفضل ملفًا مربعًا أو علامة مختصرة واضحة.", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to="wagtailimages.image")),
                ("logo_inverse", models.ForeignKey(blank=True, help_text="نسخة اختيارية مناسبة للخلفيات الداكنة.", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to="wagtailimages.image")),
                ("site", models.OneToOneField(db_index=True, editable=False, on_delete=django.db.models.deletion.CASCADE, to="wagtailcore.site")),
            ],
            options={"verbose_name": "إعدادات الموقع"},
        ),
        migrations.CreateModel(
            name="TrackingSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("tracking_mode", models.CharField(choices=[("DISABLED", "معطل"), ("GTM", "Google Tag Manager"), ("DIRECT", "ربط مباشر")], default="DISABLED", max_length=16, verbose_name="طريقة التتبع الخارجي")),
                ("gtm_container_id", models.CharField(blank=True, max_length=32, validators=[django.core.validators.RegexValidator(message="معرّف Google Tag Manager يجب أن يكون مثل GTM-XXXXXXX.", regex="^GTM-[A-Z0-9]+$")], verbose_name="معرّف Google Tag Manager")),
                ("ga4_measurement_id", models.CharField(blank=True, max_length=32, validators=[django.core.validators.RegexValidator(message="معرّف GA4 يجب أن يكون مثل G-XXXXXXXXXX.", regex="^G-[A-Z0-9]+$")], verbose_name="معرّف GA4")),
                ("meta_pixel_id", models.CharField(blank=True, max_length=32, validators=[django.core.validators.RegexValidator(message="استخدم معرّفًا رقميًا صالحًا.", regex="^\\d{5,32}$")], verbose_name="معرّف Meta Pixel")),
                ("tiktok_pixel_id", models.CharField(blank=True, max_length=32, validators=[django.core.validators.RegexValidator(message="استخدم معرّفًا رقميًا صالحًا.", regex="^\\d{5,32}$")], verbose_name="معرّف TikTok Pixel")),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("site", models.OneToOneField(db_index=True, editable=False, on_delete=django.db.models.deletion.CASCADE, to="wagtailcore.site")),
            ],
            options={"verbose_name": "القياس والتتبع"},
        ),
    ]
