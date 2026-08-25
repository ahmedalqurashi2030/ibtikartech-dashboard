from urllib.parse import quote

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from modelcluster.fields import ParentalManyToManyField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel, ObjectList, TabbedInterface
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.models import Page

from apps.services.models import Service

phone_validator = RegexValidator(
    regex=r"^\+?[1-9]\d{6,14}$",
    message=_("استخدم رقمًا دوليًا صالحًا من 7 إلى 15 رقمًا، ويمكن أن يبدأ بعلامة +."),
)
gtm_validator = RegexValidator(
    regex=r"^GTM-[A-Z0-9]+$",
    message=_("معرّف Google Tag Manager يجب أن يكون مثل GTM-XXXXXXX."),
)
ga4_validator = RegexValidator(
    regex=r"^G-[A-Z0-9]+$",
    message=_("معرّف GA4 يجب أن يكون مثل G-XXXXXXXXXX."),
)
numeric_tracking_id_validator = RegexValidator(
    regex=r"^\d{5,32}$",
    message=_("استخدم معرّفًا رقميًا صالحًا."),
)


def validate_https_url(value):
    if value and not value.lower().startswith("https://"):
        raise ValidationError(_("يجب أن يبدأ الرابط بـ https://"))


def _image_field(help_text):
    return models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text=help_text,
    )


@register_setting(icon="cog")
class SiteSettings(BaseSiteSetting):
    """Editable, site-scoped configuration for the public website shell."""

    select_related = ["logo", "logo_inverse", "favicon", "default_social_image"]

    site_name_ar = models.CharField(
        _("اسم الموقع بالعربية"),
        max_length=120,
        default="ابتكار تك",
    )
    site_name_en = models.CharField(
        _("اسم الموقع بالإنجليزية"),
        max_length=120,
        default="Ibtikar Tech",
    )
    tagline_ar = models.CharField(
        _("الوصف المختصر بالعربية"),
        max_length=180,
        default="للحلول والخدمات الرقمية",
    )
    tagline_en = models.CharField(
        _("الوصف المختصر بالإنجليزية"),
        max_length=180,
        blank=True,
    )
    logo = _image_field(_("الشعار الأساسي. يفضل ملفًا مربعًا أو علامة مختصرة واضحة."))
    logo_inverse = _image_field(_("نسخة اختيارية مناسبة للخلفيات الداكنة."))
    favicon = _image_field(_("أيقونة الموقع. يفضل PNG مربعًا عالي الدقة."))
    default_social_image = _image_field(
        _("الصورة الافتراضية عند مشاركة صفحة لا تملك صورة خاصة.")
    )

    contact_email = models.EmailField(_("البريد العام"), blank=True)
    support_email = models.EmailField(_("بريد الدعم"), blank=True)
    phone_number = models.CharField(
        _("رقم الهاتف"),
        max_length=16,
        blank=True,
        validators=[phone_validator],
        help_text=_("بصيغة دولية مثل +9665XXXXXXXX."),
    )
    whatsapp_number = models.CharField(
        _("رقم واتساب"),
        max_length=16,
        blank=True,
        validators=[phone_validator],
        help_text=_("بصيغة دولية مثل +9665XXXXXXXX."),
    )
    whatsapp_default_message = models.CharField(
        _("رسالة واتساب الافتراضية"),
        max_length=500,
        blank=True,
    )
    address = models.CharField(_("العنوان"), max_length=300, blank=True)
    business_hours = models.CharField(_("ساعات العمل"), max_length=180, blank=True)

    x_url = models.URLField(
        _("X / Twitter"),
        blank=True,
        validators=[validate_https_url],
    )
    instagram_url = models.URLField(
        _("Instagram"),
        blank=True,
        validators=[validate_https_url],
    )
    linkedin_url = models.URLField(
        _("LinkedIn"),
        blank=True,
        validators=[validate_https_url],
    )
    youtube_url = models.URLField(
        _("YouTube"),
        blank=True,
        validators=[validate_https_url],
    )
    tiktok_url = models.URLField(
        _("TikTok"),
        blank=True,
        validators=[validate_https_url],
    )
    snapchat_url = models.URLField(
        _("Snapchat"),
        blank=True,
        validators=[validate_https_url],
    )

    default_seo_title = models.CharField(
        _("عنوان SEO الافتراضي"),
        max_length=70,
        default="ابتكار تك | حلول رقمية للتجارة والأعمال في السعودية",
    )
    default_meta_description = models.CharField(
        _("وصف SEO الافتراضي"),
        max_length=170,
        default=(
            "ابتكار تك تبني وتطوّر المتاجر والمواقع والهوية والقياس والأنظمة "
            "للمشاريع في السعودية والخليج."
        ),
    )
    title_suffix = models.CharField(
        _("لاحقة عنوان الصفحات"),
        max_length=80,
        default="ابتكار تك",
        blank=True,
    )
    x_username = models.CharField(
        _("اسم حساب X"),
        max_length=50,
        blank=True,
        help_text=_("من دون @"),
    )
    google_site_verification = models.CharField(
        _("رمز تحقق Google"),
        max_length=255,
        blank=True,
    )
    bing_site_verification = models.CharField(
        _("رمز تحقق Bing"),
        max_length=255,
        blank=True,
    )
    organization_legal_name = models.CharField(
        _("الاسم القانوني للمنشأة"),
        max_length=180,
        blank=True,
    )
    footer_description = models.CharField(
        _("وصف التذييل"),
        max_length=320,
        default=(
            "نبني علامات وتجارب ومنتجات رقمية مترابطة تساعد المشاريع على "
            "الإطلاق والعمل والنمو ضمن نطاق واضح."
        ),
    )
    copyright_text = models.CharField(
        _("نص حقوق النشر"),
        max_length=180,
        default="جميع الحقوق محفوظة.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    identity_panels = [
        MultiFieldPanel(
            [
                FieldPanel("site_name_ar"),
                FieldPanel("site_name_en"),
                FieldPanel("tagline_ar"),
                FieldPanel("tagline_en"),
            ],
            heading=_("الاسم والوصف"),
        ),
        MultiFieldPanel(
            [
                FieldPanel("logo"),
                FieldPanel("logo_inverse"),
                FieldPanel("favicon"),
            ],
            heading=_("أصول الهوية"),
        ),
        MultiFieldPanel(
            [FieldPanel("footer_description"), FieldPanel("copyright_text")],
            heading=_("التذييل"),
        ),
    ]
    contact_panels = [
        MultiFieldPanel(
            [
                FieldPanel("contact_email"),
                FieldPanel("support_email"),
                FieldPanel("phone_number"),
                FieldPanel("whatsapp_number"),
                FieldPanel("whatsapp_default_message"),
            ],
            heading=_("قنوات التواصل"),
        ),
        MultiFieldPanel(
            [FieldPanel("address"), FieldPanel("business_hours")],
            heading=_("الموقع وساعات العمل"),
        ),
    ]
    social_panels = [
        MultiFieldPanel(
            [
                FieldPanel("x_url"),
                FieldPanel("instagram_url"),
                FieldPanel("linkedin_url"),
                FieldPanel("youtube_url"),
                FieldPanel("tiktok_url"),
                FieldPanel("snapchat_url"),
            ],
            heading=_("روابط الحسابات الرسمية"),
        )
    ]
    seo_panels = [
        MultiFieldPanel(
            [
                FieldPanel("default_seo_title"),
                FieldPanel("default_meta_description"),
                FieldPanel("title_suffix"),
                FieldPanel("default_social_image"),
            ],
            heading=_("القيم الافتراضية"),
        ),
        MultiFieldPanel(
            [
                FieldPanel("organization_legal_name"),
                FieldPanel("x_username"),
                FieldPanel("google_site_verification"),
                FieldPanel("bing_site_verification"),
            ],
            heading=_("المؤسسة والتحقق"),
        ),
    ]
    edit_handler = TabbedInterface(
        [
            ObjectList(identity_panels, heading=_("الهوية")),
            ObjectList(contact_panels, heading=_("التواصل")),
            ObjectList(social_panels, heading=_("التواصل الاجتماعي")),
            ObjectList(seo_panels, heading=_("SEO")),
        ]
    )

    class Meta:
        verbose_name = _("إعدادات الموقع")

    @property
    def whatsapp_url(self):
        if not self.whatsapp_number:
            return ""
        number = self.whatsapp_number.lstrip("+")
        url = f"https://wa.me/{number}"
        if self.whatsapp_default_message:
            url = f"{url}?text={quote(self.whatsapp_default_message)}"
        return url

    @property
    def phone_url(self):
        return f"tel:{self.phone_number}" if self.phone_number else ""


@register_setting(icon="site")
class TrackingSettings(BaseSiteSetting):
    """Operationally sensitive public tracking identifiers, separated by permission."""

    class TrackingMode(models.TextChoices):
        DISABLED = "DISABLED", _("معطل")
        GTM = "GTM", _("Google Tag Manager")
        DIRECT = "DIRECT", _("ربط مباشر")

    tracking_mode = models.CharField(
        _("طريقة التتبع الخارجي"),
        max_length=16,
        choices=TrackingMode.choices,
        default=TrackingMode.DISABLED,
    )
    gtm_container_id = models.CharField(
        _("معرّف Google Tag Manager"),
        max_length=32,
        blank=True,
        validators=[gtm_validator],
    )
    ga4_measurement_id = models.CharField(
        _("معرّف GA4"),
        max_length=32,
        blank=True,
        validators=[ga4_validator],
    )
    meta_pixel_id = models.CharField(
        _("معرّف Meta Pixel"),
        max_length=32,
        blank=True,
        validators=[numeric_tracking_id_validator],
    )
    tiktok_pixel_id = models.CharField(
        _("معرّف TikTok Pixel"),
        max_length=32,
        blank=True,
        validators=[numeric_tracking_id_validator],
    )
    updated_at = models.DateTimeField(auto_now=True)

    panels = [
        FieldPanel("tracking_mode"),
        FieldPanel("gtm_container_id"),
        FieldPanel("ga4_measurement_id"),
        FieldPanel("meta_pixel_id"),
        FieldPanel("tiktok_pixel_id"),
    ]

    class Meta:
        verbose_name = _("القياس والتتبع")

    def clean(self):
        super().clean()
        errors = {}
        direct_ids = (
            self.ga4_measurement_id,
            self.meta_pixel_id,
            self.tiktok_pixel_id,
        )
        if self.tracking_mode == self.TrackingMode.GTM:
            if not self.gtm_container_id:
                errors["gtm_container_id"] = _("أدخل معرّف GTM لتفعيل هذا الوضع.")
            if any(direct_ids):
                errors["tracking_mode"] = _(
                    "وضع GTM لا يجمع مع الربط المباشر؛ امسح المعرّفات المباشرة."
                )
        elif self.tracking_mode == self.TrackingMode.DIRECT:
            if self.gtm_container_id:
                errors["gtm_container_id"] = _(
                    "امسح معرّف GTM عند استخدام الربط المباشر."
                )
            if not any(direct_ids):
                errors["tracking_mode"] = _(
                    "أدخل معرّف أداة واحدة على الأقل للربط المباشر."
                )
        if errors:
            raise ValidationError(errors)


class HomePage(Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    max_count = 1


class SolutionPage(Page):
    eyebrow = models.CharField(max_length=120, blank=True)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="solution_pages",
    )

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("related_services"),
    ]


class PlatformPage(Page):
    platform_name = models.CharField(max_length=120)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="platform_pages",
    )

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("platform_name"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("related_services"),
    ]


class TharaaPage(Page):
    eyebrow = models.CharField(max_length=120, blank=True)
    short_description = models.TextField(blank=True)
    displayed_price = models.CharField(max_length=80, blank=True)
    demo_url = models.URLField(blank=True)
    marketplace_url = models.URLField(blank=True)
    body = RichTextField(blank=True)
    features = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    faq = models.JSONField(default=list, blank=True)
    changelog = models.JSONField(default=list, blank=True)
    support_url = models.URLField(blank=True)
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="tharaa_pages",
    )

    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("short_description"),
        FieldPanel("displayed_price"),
        FieldPanel("demo_url"),
        FieldPanel("marketplace_url"),
        FieldPanel("body"),
        FieldPanel("features"),
        FieldPanel("industries"),
        FieldPanel("faq"),
        FieldPanel("changelog"),
        FieldPanel("support_url"),
        FieldPanel("related_services"),
    ]
    max_count = 1


class ArticlePage(Page):
    excerpt = models.TextField(blank=True)
    published_at = models.DateTimeField(default=timezone.now)
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("excerpt"),
        FieldPanel("published_at"),
        FieldPanel("body"),
    ]


class CaseStudyPage(Page):
    client_name = models.CharField(max_length=180, blank=True)
    summary = models.TextField(blank=True)
    challenge = RichTextField(blank=True)
    solution = RichTextField(blank=True)
    results = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("client_name"),
        FieldPanel("summary"),
        FieldPanel("challenge"),
        FieldPanel("solution"),
        FieldPanel("results"),
    ]


class PortfolioPage(Page):
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("summary"),
        FieldPanel("body"),
    ]


class AboutPage(Page):
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [FieldPanel("body")]
    max_count = 1


class LegalPage(Page):
    class DocumentType(models.TextChoices):
        PRIVACY = "PRIVACY", "Privacy"
        TERMS = "TERMS", "Terms"
        COOKIES = "COOKIES", "Cookies"
        OTHER = "OTHER", "Other"

    document_type = models.CharField(
        max_length=16,
        choices=DocumentType.choices,
        default=DocumentType.OTHER,
    )
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("document_type"),
        FieldPanel("body"),
    ]


class LandingPage(Page):
    eyebrow = models.CharField(max_length=120, blank=True)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    cta_label = models.CharField(max_length=100, blank=True)
    cta_url = models.URLField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("cta_label"),
        FieldPanel("cta_url"),
    ]

