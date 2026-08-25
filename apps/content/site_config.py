from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit

from django.conf import settings as django_settings
from django.urls import reverse

from .models import SiteSettings, TrackingSettings


@dataclass(frozen=True)
class BrandConfig:
    name: str
    name_ar: str
    name_en: str
    tagline: str
    logo: object | None
    logo_inverse: object | None
    favicon: object | None
    default_social_image: object | None
    default_social_image_url: str


@dataclass(frozen=True)
class ContactConfig:
    email: str
    support_email: str
    phone: str
    phone_url: str
    whatsapp: str
    whatsapp_url: str
    address: str
    business_hours: str


@dataclass(frozen=True)
class SeoConfig:
    default_title: str
    default_description: str
    title_suffix: str
    canonical_url: str
    site_root_url: str
    x_username: str
    google_site_verification: str
    bing_site_verification: str
    organization_name: str


@dataclass(frozen=True)
class TrackingConfig:
    mode: str
    external_enabled: bool
    gtm_container_id: str
    ga4_measurement_id: str
    meta_pixel_id: str
    tiktok_pixel_id: str


@dataclass(frozen=True)
class SiteConfig:
    brand: BrandConfig
    contact: ContactConfig
    social_links: tuple[dict[str, str], ...]
    seo: SeoConfig
    tracking: TrackingConfig
    footer_description: str
    copyright_text: str


def _absolute_request_path(request):
    parts = urlsplit(request.build_absolute_uri(request.path))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def _site_root_url(request):
    parts = urlsplit(request.build_absolute_uri("/"))
    return urlunsplit((parts.scheme, parts.netloc, "/", "", ""))


def _absolute_media_url(request, image):
    if image is None:
        return ""
    url = image.file.url
    parts = urlsplit(url)
    return url if parts.scheme and parts.netloc else request.build_absolute_uri(url)


def _social_links(site_settings):
    configured = (
        ("x", "X", site_settings.x_url),
        ("instagram", "Instagram", site_settings.instagram_url),
        ("linkedin", "LinkedIn", site_settings.linkedin_url),
        ("youtube", "YouTube", site_settings.youtube_url),
        ("tiktok", "TikTok", site_settings.tiktok_url),
        ("snapchat", "Snapchat", site_settings.snapchat_url),
    )
    return tuple(
        {"key": key, "label": label, "url": url}
        for key, label, url in configured
        if url
    )


def resolve_site_config(request):
    site_settings = SiteSettings.for_request(request)
    tracking_settings = TrackingSettings.for_request(request)
    language = (getattr(request, "LANGUAGE_CODE", "") or "ar").split("-")[0]

    name = (
        site_settings.site_name_en
        if language == "en" and site_settings.site_name_en
        else site_settings.site_name_ar
    )
    tagline = (
        site_settings.tagline_en
        if language == "en" and site_settings.tagline_en
        else site_settings.tagline_ar
    )
    external_enabled = bool(
        django_settings.ENABLE_EXTERNAL_TRACKING
        and tracking_settings.tracking_mode
        != TrackingSettings.TrackingMode.DISABLED
    )
    effective_mode = (
        tracking_settings.tracking_mode
        if external_enabled
        else TrackingSettings.TrackingMode.DISABLED
    )

    return SiteConfig(
        brand=BrandConfig(
            name=name or "ابتكار تك",
            name_ar=site_settings.site_name_ar or "ابتكار تك",
            name_en=site_settings.site_name_en or "Ibtikar Tech",
            tagline=tagline or site_settings.tagline_ar,
            logo=site_settings.logo,
            logo_inverse=site_settings.logo_inverse,
            favicon=site_settings.favicon,
            default_social_image=site_settings.default_social_image,
            default_social_image_url=_absolute_media_url(
                request,
                site_settings.default_social_image,
            ),
        ),
        contact=ContactConfig(
            email=site_settings.contact_email,
            support_email=site_settings.support_email,
            phone=site_settings.phone_number,
            phone_url=site_settings.phone_url,
            whatsapp=site_settings.whatsapp_number,
            whatsapp_url=site_settings.whatsapp_url,
            address=site_settings.address,
            business_hours=site_settings.business_hours,
        ),
        social_links=_social_links(site_settings),
        seo=SeoConfig(
            default_title=site_settings.default_seo_title or name,
            default_description=site_settings.default_meta_description,
            title_suffix=site_settings.title_suffix,
            canonical_url=_absolute_request_path(request),
            site_root_url=_site_root_url(request),
            x_username=site_settings.x_username.lstrip("@"),
            google_site_verification=site_settings.google_site_verification,
            bing_site_verification=site_settings.bing_site_verification,
            organization_name=site_settings.organization_legal_name or name,
        ),
        tracking=TrackingConfig(
            mode=effective_mode,
            external_enabled=external_enabled,
            gtm_container_id=(
                tracking_settings.gtm_container_id
                if effective_mode == TrackingSettings.TrackingMode.GTM
                else ""
            ),
            ga4_measurement_id=(
                tracking_settings.ga4_measurement_id
                if effective_mode == TrackingSettings.TrackingMode.DIRECT
                else ""
            ),
            meta_pixel_id=(
                tracking_settings.meta_pixel_id
                if effective_mode == TrackingSettings.TrackingMode.DIRECT
                else ""
            ),
            tiktok_pixel_id=(
                tracking_settings.tiktok_pixel_id
                if effective_mode == TrackingSettings.TrackingMode.DIRECT
                else ""
            ),
        ),
        footer_description=site_settings.footer_description,
        copyright_text=site_settings.copyright_text,
    )


def build_runtime_config(request, site_config):
    return {
        "forms": {
            "endpoint": reverse("public_preview:contact"),
            "honeypotField": "ibt_website",
        },
        "analytics": {
            "collectEndpoint": reverse("analytics:collect_event"),
        },
        "tracking": {
            "mode": site_config.tracking.mode,
            "externalEnabled": site_config.tracking.external_enabled,
            "consentRequired": True,
            "gtmContainerId": site_config.tracking.gtm_container_id,
            "ga4MeasurementId": site_config.tracking.ga4_measurement_id,
            "metaPixelId": site_config.tracking.meta_pixel_id,
            "tiktokPixelId": site_config.tracking.tiktok_pixel_id,
        },
        "events": {
            "ctaClick": "cta_click",
            "whatsappClick": "whatsapp_click",
            "phoneClick": "phone_click",
            "emailClick": "email_click",
            "serviceView": "service_view",
            "productView": "product_view",
            "demoClick": "demo_click",
            "formStart": "form_start",
            "formSubmit": "form_submit",
            "inquirySubmitted": "inquiry_submitted",
            "formError": "form_error",
            "quoteRequest": "quote_request",
            "portfolioView": "portfolio_view",
        },
    }
