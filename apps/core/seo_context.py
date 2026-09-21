from django.urls import reverse

from .sitemaps import PUBLIC_SITE_ORIGIN

# Breadcrumb trails reflect the user-facing information architecture rather
# than mechanically mirroring URL segments. Keep this map aligned with visible
# breadcrumbs and the internal-linking architecture.
BREADCRUMB_TRAILS = {
    "services:index": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
    ),
    "public_preview:ecommerce": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
    ),
    "public_preview:websites": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المواقع وصفحات الهبوط", "public_preview:websites"),
    ),
    "public_preview:brand-content": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("الهوية والمحتوى", "public_preview:brand-content"),
    ),
    "public_preview:growth": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("الظهور والقياس والنمو", "public_preview:growth"),
    ),
    "public_preview:custom-systems": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("الأنظمة والربط والأتمتة", "public_preview:custom-systems"),
    ),
    "services:store-launch": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("إطلاق متجر إلكتروني", "services:store-launch"),
    ),
    "services:storefront-customization": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("تخصيص واجهة المتجر", "services:storefront-customization"),
    ),
    "services:store-redesign": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("إعادة تصميم متجر قائم", "services:store-redesign"),
    ),
    "services:product-page-optimization": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("تحسين صفحة المنتج", "services:product-page-optimization"),
    ),
    "services:ecommerce-growth": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("الربط والقياس والنمو", "services:ecommerce-growth"),
    ),
    "services:ecommerce-support": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("المتاجر الإلكترونية", "public_preview:ecommerce"),
        ("الدعم والتطوير المستمر", "services:ecommerce-support"),
    ),
    "services:seo": (
        ("الرئيسية", "public_preview:home"),
        ("الحلول والخدمات", "services:index"),
        ("الظهور والقياس والنمو", "public_preview:growth"),
        ("تحسين محركات البحث SEO", "services:seo"),
    ),
    "public_preview:knowledge": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
    ),
    "public_preview:article-store-launch": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("إطلاق متجر إلكتروني", "public_preview:article-store-launch"),
    ),
    "public_preview:article-product-page": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("صفحة المنتج", "public_preview:article-product-page"),
    ),
    "public_preview:article-store-redesign": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("تخصيص الواجهة أم إعادة التصميم", "public_preview:article-store-redesign"),
    ),
    "public_preview:article-ecommerce-cost-saudi": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("تكلفة إنشاء متجر إلكتروني", "public_preview:article-ecommerce-cost-saudi"),
    ),
    "public_preview:article-website-cost-saudi": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("تكلفة موقع شركة", "public_preview:article-website-cost-saudi"),
    ),
    "public_preview:article-automation-first": (
        ("الرئيسية", "public_preview:home"),
        ("المعرفة", "public_preview:knowledge"),
        ("ما الذي يجب أتمتته أولًا", "public_preview:article-automation-first"),
    ),
}


def _absolute_url(route_name: str) -> str:
    return f"{PUBLIC_SITE_ORIGIN}{reverse(route_name)}"


def build_seo_breadcrumbs(request):
    """Return canonical breadcrumb nodes for routes with an approved trail."""
    resolver_match = getattr(request, "resolver_match", None)
    view_name = getattr(resolver_match, "view_name", "") if resolver_match else ""
    trail = BREADCRUMB_TRAILS.get(view_name, ())
    return tuple(
        {"name": name, "url": _absolute_url(route_name)}
        for name, route_name in trail
    )
