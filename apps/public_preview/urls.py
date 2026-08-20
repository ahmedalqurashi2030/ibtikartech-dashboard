from django.urls import path

from . import views

app_name = "public_preview"

urlpatterns = [
    path("", views.home, name="home"),
    path("ecommerce/", views.ecommerce, name="ecommerce"),
    path("websites/", views.websites, name="websites"),
    path("brand-content/", views.brand_content, name="brand-content"),
    path("growth/", views.growth, name="growth"),
    path("custom-systems/", views.custom_systems, name="custom-systems"),
    path("tharaa/", views.tharaa, name="tharaa"),
    path("portfolio/", views.portfolio, name="portfolio"),
    path("knowledge/", views.knowledge, name="knowledge"),
    path(
        "knowledge/product-page/",
        views.article_product_page,
        name="article-product-page",
    ),
    path(
        "knowledge/store-launch/",
        views.article_store_launch,
        name="article-store-launch",
    ),
    path(
        "knowledge/store-redesign/",
        views.article_store_redesign,
        name="article-store-redesign",
    ),
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
    path("404/", views.not_found_preview, name="not-found-preview"),
    # Legacy inbound URLs are redirects only. They never render a *.html URL.
    path(
        "index.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:home"},
    ),
    path(
        "ecommerce.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:ecommerce"},
    ),
    path(
        "websites.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:websites"},
    ),
    path(
        "brand-content.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:brand-content"},
    ),
    path(
        "growth.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:growth"},
    ),
    path(
        "custom-systems.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:custom-systems"},
    ),
    path(
        "tharaa.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:tharaa"},
    ),
    path(
        "portfolio.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:portfolio"},
    ),
    path(
        "knowledge.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:knowledge"},
    ),
    path(
        "article-product-page.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:article-product-page"},
    ),
    path(
        "article-store-launch.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:article-store-launch"},
    ),
    path(
        "article-store-redesign.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:article-store-redesign"},
    ),
    path(
        "about.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:about"},
    ),
    path(
        "contact.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:contact"},
    ),
    path(
        "404.html",
        views.legacy_page_redirect,
        {"route_name": "public_preview:not-found-preview"},
    ),
    path(
        "services.html",
        views.legacy_page_redirect,
        {"route_name": "services:index"},
    ),
    path(
        "store-launch.html",
        views.legacy_page_redirect,
        {"route_name": "services:store-launch"},
    ),
    path(
        "storefront-customization.html",
        views.legacy_page_redirect,
        {"route_name": "services:storefront-customization"},
    ),
    path(
        "store-redesign.html",
        views.legacy_page_redirect,
        {"route_name": "services:store-redesign"},
    ),
    path(
        "product-page-optimization.html",
        views.legacy_page_redirect,
        {"route_name": "services:product-page-optimization"},
    ),
    path(
        "ecommerce-growth.html",
        views.legacy_page_redirect,
        {"route_name": "services:ecommerce-growth"},
    ),
    path(
        "ecommerce-support.html",
        views.legacy_page_redirect,
        {"route_name": "services:ecommerce-support"},
    ),
]
