from datetime import datetime
import json
from pathlib import Path

from django.db import migrations


def seed_managed_articles(apps, schema_editor):
    # Wagtail page-tree operations require add_child()/save_revision(), so this
    # migration intentionally uses the runtime Page classes after the schema
    # migration has completed. The payload itself is a versioned snapshot.
    from apps.content.models import ArticleIndexPage, ArticlePage
    from wagtail.models import Site

    site = (
        Site.objects.select_related("root_page")
        .filter(is_default_site=True)
        .first()
        or Site.objects.select_related("root_page").first()
    )
    if site is None:
        return

    data_path = Path(__file__).parent / "data" / "articles_v1.json"
    payload = json.loads(data_path.read_text(encoding="utf-8"))

    index_page = ArticleIndexPage.objects.first()
    if index_page is None:
        root_page = site.root_page.specific
        desired_slug = "knowledge"
        if root_page.get_children().filter(slug=desired_slug).exists():
            desired_slug = "knowledge-cms"
        index_page = ArticleIndexPage(
            title="المقالات",
            slug=desired_slug,
            seo_title="مقالات ابتكار تك | أدلة عملية للمتاجر والتجارب الرقمية",
            search_description=(
                "مقالات وأدلة عملية من ابتكار تك حول المتاجر وتجربة المستخدم "
                "والمنتج الرقمي والقياس والقرارات التي تسبق التنفيذ."
            ),
        )
        root_page.add_child(instance=index_page)

    index_page.save_revision().publish()

    for item in payload["articles"]:
        article = (
            ArticlePage.objects.child_of(index_page)
            .filter(slug=item["slug"])
            .first()
        )
        if article is None:
            article = ArticlePage(title=item["title"], slug=item["slug"])
            index_page.add_child(instance=article)

        article.title = item["title"]
        article.seo_title = item["seo_title"]
        article.search_description = item["search_description"]
        article.category = item["category"]
        article.excerpt = item["excerpt"]
        article.published_at = datetime.fromisoformat(item["published_at"])
        article.author_name = "فريق ابتكار تك"
        article.reading_label = item["reading_label"]
        article.card_meta_label = item["card_meta_label"]
        article.list_title = item["list_title"]
        article.headline_prefix = item["headline_prefix"]
        article.headline_accent = item["headline_accent"]
        article.visual_label = item["visual_label"]
        article.visual_number = item["visual_number"]
        article.sort_order = item["sort_order"]
        article.card_link_label = item["card_link_label"]
        article.card_style = item["card_style"]
        article.is_featured = item["is_featured"]
        article.featured_title = item["featured_title"]
        article.featured_excerpt = item["featured_excerpt"]
        article.content = [
            {
                "type": "legacy_html",
                "value": item["legacy_html"],
            }
        ]
        article.save()
        article.save_revision().publish()


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0003_managed_articles"),
    ]

    operations = [
        migrations.RunPython(
            seed_managed_articles,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
