from django.db import models
from wagtail.admin.panels import FieldPanel
from wagtail.fields import RichTextField
from wagtail.models import Page


class HomePage(Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("intro"),
    ]

    max_count = 1


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
    ]

    max_count = 1
