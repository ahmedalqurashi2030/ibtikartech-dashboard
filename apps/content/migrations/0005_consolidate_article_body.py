from django.db import migrations


def migrate_legacy_article_body(apps, schema_editor):
    ArticlePage = apps.get_model("content", "ArticlePage")

    for article in ArticlePage.objects.all().iterator():
        if not article.body or article.content:
            continue
        article.content = [
            {
                "type": "rich_text",
                "value": str(article.body),
            }
        ]
        article.save(update_fields=["content"])


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_seed_managed_articles"),
    ]

    operations = [
        migrations.RunPython(
            migrate_legacy_article_body,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name="articlepage",
            name="body",
        ),
    ]
