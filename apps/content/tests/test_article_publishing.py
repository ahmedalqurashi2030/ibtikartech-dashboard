import pytest
from django.test import RequestFactory
from django.urls import reverse

from apps.core.sitemaps import public_indexable_paths

from ..models import ArticleIndexPage, ArticlePage


@pytest.mark.django_db
def test_seeded_articles_are_owned_by_wagtail_and_keep_current_content(client):
    index_page = ArticleIndexPage.objects.get()
    articles = ArticlePage.objects.live().public().child_of(index_page)

    assert articles.count() == 6
    assert ArticlePage.can_create_at(index_page)

    store_launch = articles.get(slug="store-launch")
    assert store_launch.category == ArticlePage.Category.COMMERCE
    assert store_launch.is_featured is True
    assert store_launch.content[0].block_type == "legacy_html"
    assert "أربعة محاور لا يكتمل الإطلاق دونها" in str(
        store_launch.content[0].value
    )

    response = client.get(reverse("public_preview:article-store-launch"))
    assert response.status_code == 200
    html = response.content.decode()
    assert "دليل إطلاق متجر إلكتروني من الفكرة إلى" in html
    assert "أربعة محاور لا يكتمل الإطلاق دونها" in html


@pytest.mark.django_db
def test_published_article_created_under_index_gets_public_route_and_sitemap(client):
    index_page = ArticleIndexPage.objects.get()
    article = ArticlePage(
        title="دليل تجريبي للنشر",
        slug="publishing-smoke-test",
        category=ArticlePage.Category.STRATEGY,
        excerpt="مقال تجريبي للتحقق من مسار النشر.",
        reading_label="3 دقائق قراءة",
        visual_number="07",
        content=[
            {
                "type": "heading",
                "value": {"title": "قسم تجريبي", "anchor": "sample"},
            },
            {
                "type": "rich_text",
                "value": "<p>محتوى قابل للتحرير من لوحة التحكم.</p>",
            },
        ],
    )
    index_page.add_child(instance=article)
    article.save_revision().publish()

    path = reverse(
        "public_preview:article-detail",
        kwargs={"slug": "publishing-smoke-test"},
    )
    response = client.get(path)

    assert response.status_code == 200
    html = response.content.decode()
    assert "دليل تجريبي للنشر" in html
    assert "محتوى قابل للتحرير من لوحة التحكم." in html
    assert path in public_indexable_paths()


@pytest.mark.django_db
def test_unpublished_article_is_not_public_or_in_sitemap(client):
    index_page = ArticleIndexPage.objects.get()
    article = ArticlePage(
        title="مسودة غير منشورة",
        slug="draft-only",
        category=ArticlePage.Category.OTHER,
        excerpt="مسودة",
        live=False,
        content=[
            {
                "type": "rich_text",
                "value": "<p>هذه المسودة لا يجب أن تظهر للعامة.</p>",
            }
        ],
    )
    index_page.add_child(instance=article)
    article.save_revision()

    path = reverse("public_preview:article-detail", kwargs={"slug": "draft-only"})
    assert client.get(path).status_code == 404
    assert path not in public_indexable_paths()


@pytest.mark.django_db
def test_article_content_has_one_editorial_source_and_internal_wagtail_urls_canonicalize():
    index_page = ArticleIndexPage.objects.get()
    article = ArticlePage.objects.live().public().child_of(index_page).get(slug="store-launch")

    assert "body" not in {field.name for field in ArticlePage._meta.get_fields()}
    assert article.content

    factory = RequestFactory()

    index_response = index_page.serve(factory.get("/internal-knowledge/"))
    assert index_response.status_code == 301
    assert index_response["Location"] == reverse("public_preview:knowledge")

    article_response = article.serve(factory.get("/internal-knowledge/store-launch/"))
    assert article_response.status_code == 301
    assert article_response["Location"] == reverse(
        "public_preview:article-detail",
        kwargs={"slug": "store-launch"},
    )
