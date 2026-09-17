from apps.core.seo_context import build_seo_breadcrumbs

from .site_config import build_runtime_config, resolve_site_config


def site_configuration(request):
    site_config = resolve_site_config(request)
    return {
        "site_config": site_config,
        "runtime_config": build_runtime_config(request, site_config),
        "seo_breadcrumbs": build_seo_breadcrumbs(request),
    }
