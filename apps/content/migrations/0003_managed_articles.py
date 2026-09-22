# Generated for managed article publishing.

import apps.content.article_blocks
import django.db.models.deletion
import django.utils.timezone
import wagtail.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0002_sitesettings_trackingsettings"),
        ("wagtailcore", "0097_baselogentry_uuid_action_timestamp_indexes"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArticleIndexPage",
            fields=[
                (
                    "page_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="wagtailcore.page",
                    ),
                ),
                (
                    "hero_kicker",
                    models.CharField(default="IBTIKAR JOURNAL", max_length=80),
                ),
                (
                    "hero_title",
                    models.CharField(default="معرفة عملية تقود إلى", max_length=180),
                ),
                (
                    "hero_accent",
                    models.CharField(default="قرار رقمي أوضح.", max_length=180),
                ),
                (
                    "hero_lead",
                    models.TextField(
                        default=(
                            "مقالات نكتبها لأصحاب المتاجر والمشاريع في السعودية والخليج. "
                            "نختصر ما تحتاج فهمه قبل الإطلاق أو التطوير، ونحوّل الخبرة التقنية "
                            "والتجارية إلى خطوات قابلة للتطبيق."
                        )
                    ),
                ),
                (
                    "latest_title",
                    models.CharField(
                        default="أفكار مرتبة بحسب القرار الذي أمامك",
                        max_length=180,
                    ),
                ),
                (
                    "latest_description",
                    models.TextField(
                        default=(
                            "محتوى قليل الحشو، واضح النطاق، ويربط كل موضوع "
                            "بخطوة تالية عملية."
                        )
                    ),
                ),
            ],
            options={"verbose_name": "صفحة المقالات"},
            bases=("wagtailcore.page",),
        ),
        migrations.AlterModelOptions(
            name="articlepage",
            options={"verbose_name": "مقال"},
        ),
        migrations.AddField(
            model_name="articlepage",
            name="category",
            field=models.CharField(
                choices=[
                    ("commerce", "المتاجر الإلكترونية"),
                    ("ux", "تجربة المستخدم"),
                    ("strategy", "الاستراتيجية"),
                    ("web", "المواقع الإلكترونية"),
                    ("systems", "الأنظمة والأتمتة"),
                    ("other", "أخرى"),
                ],
                default="other",
                max_length=24,
            ),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="author_name",
            field=models.CharField(default="فريق ابتكار تك", max_length=120),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="reading_label",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="card_meta_label",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="list_title",
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="headline_prefix",
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="headline_accent",
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="visual_label",
            field=models.CharField(blank=True, max_length=60),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="visual_number",
            field=models.CharField(blank=True, max_length=8),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="sort_order",
            field=models.PositiveIntegerField(default=100),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="card_link_label",
            field=models.CharField(default="اقرأ المقال", max_length=80),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="card_style",
            field=models.CharField(
                choices=[
                    ("default", "افتراضي"),
                    ("product", "منتج"),
                    ("strategy", "استراتيجية"),
                ],
                default="default",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="is_featured",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="featured_title",
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="featured_excerpt",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="articlepage",
            name="content",
            field=wagtail.fields.StreamField(
                apps.content.article_blocks.ArticleContentBlock(),
                blank=True,
                use_json_field=True,
            ),
        ),
    ]
