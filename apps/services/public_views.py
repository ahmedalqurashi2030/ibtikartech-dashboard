from django.shortcuts import render


def _render_service_page(request, template_name: str, page_key: str):
    return render(
        request,
        f"public_preview/pages/{template_name}",
        {
            "page_key": page_key,
            # Internal compatibility metadata only; never used as a public URL.
            "source_page_name": template_name,
        },
    )


def services(request):
    return _render_service_page(request, "services.html", "services")


def store_launch(request):
    return _render_service_page(request, "store-launch.html", "store-launch")


def storefront_customization(request):
    return _render_service_page(
        request,
        "storefront-customization.html",
        "storefront-customization",
    )


def store_redesign(request):
    return _render_service_page(request, "store-redesign.html", "store-redesign")


def product_page_optimization(request):
    return _render_service_page(
        request,
        "product-page-optimization.html",
        "product-page-optimization",
    )


def ecommerce_growth(request):
    return _render_service_page(request, "ecommerce-growth.html", "ecommerce-growth")


def ecommerce_support(request):
    return _render_service_page(request, "ecommerce-support.html", "ecommerce-support")
