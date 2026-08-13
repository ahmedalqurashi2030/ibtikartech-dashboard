from django.db import models
from django.utils import timezone
from modelcluster.fields import ParentalManyToManyField
from wagtail.admin.panels import FieldPanel
from wagtail.fields import RichTextField
from wagtail.models import Page

from apps.services.models import Service


class HomePage(Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    max_count = 1


class SolutionPage(Page):
    eyebrow = models.CharField(max_length=120, blank=True)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="solution_pages",
    )

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("related_services"),
    ]


class PlatformPage(Page):
    platform_name = models.CharField(max_length=120)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="platform_pages",
    )

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("platform_name"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("related_services"),
    ]


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
    related_services = ParentalManyToManyField(
        Service,
        blank=True,
        related_name="tharaa_pages",
    )

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
        FieldPanel("related_services"),
    ]
    max_count = 1


class ArticlePage(Page):
    excerpt = models.TextField(blank=True)
    published_at = models.DateTimeField(default=timezone.now)
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("excerpt"),
        FieldPanel("published_at"),
        FieldPanel("body"),
    ]


class CaseStudyPage(Page):
    client_name = models.CharField(max_length=180, blank=True)
    summary = models.TextField(blank=True)
    challenge = RichTextField(blank=True)
    solution = RichTextField(blank=True)
    results = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("client_name"),
        FieldPanel("summary"),
        FieldPanel("challenge"),
        FieldPanel("solution"),
        FieldPanel("results"),
    ]


class PortfolioPage(Page):
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("summary"),
        FieldPanel("body"),
    ]


class AboutPage(Page):
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [FieldPanel("body")]
    max_count = 1


class LegalPage(Page):
    class DocumentType(models.TextChoices):
        PRIVACY = "PRIVACY", "Privacy"
        TERMS = "TERMS", "Terms"
        COOKIES = "COOKIES", "Cookies"
        OTHER = "OTHER", "Other"

    document_type = models.CharField(
        max_length=16,
        choices=DocumentType.choices,
        default=DocumentType.OTHER,
    )
    body = RichTextField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("document_type"),
        FieldPanel("body"),
    ]


class LandingPage(Page):
    eyebrow = models.CharField(max_length=120, blank=True)
    summary = models.TextField(blank=True)
    body = RichTextField(blank=True)
    cta_label = models.CharField(max_length=100, blank=True)
    cta_url = models.URLField(blank=True)

    template = "content/standard_page.html"
    content_panels = Page.content_panels + [
        FieldPanel("eyebrow"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("cta_label"),
        FieldPanel("cta_url"),
    ]
