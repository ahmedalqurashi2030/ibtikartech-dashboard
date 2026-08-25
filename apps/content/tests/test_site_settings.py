import pytest
from django.core.exceptions import ValidationError
from django.test import RequestFactory, override_settings
from wagtail.models import Site

from apps.content.context_processors import site_configuration
from apps.content.models import SiteSettings, TrackingSettings
from apps.content.site_config import resolve_site_config


@pytest.mark.django_db
def test_site_settings_are_scoped_to_wagtail_site_and_resolved_once_per_request():
    request = RequestFactory().get("/", HTTP_HOST="localhost")
    site = Site.find_for_request(request)
    configured = SiteSettings.for_site(site)
    configured.site_name_ar = "ابتكار تك الجديدة"
    configured.whatsapp_number = "+966500000000"
    configured.whatsapp_default_message = "مرحبًا"
    configured.save()

    first = resolve_site_config(request)
    second = resolve_site_config(request)

    assert first.brand.name == "ابتكار تك الجديدة"
    assert first.contact.whatsapp_url.startswith("https://wa.me/966500000000")
    assert "%D9%85" in first.contact.whatsapp_url
    assert SiteSettings.for_request(request) is SiteSettings.for_request(request)
    assert second.brand.name == first.brand.name


@pytest.mark.django_db
def test_site_settings_reject_insecure_public_social_urls():
    site = Site.objects.get(is_default_site=True)
    configured = SiteSettings(site=site, instagram_url="http://instagram.com/ibtikar")

    with pytest.raises(ValidationError):
        configured.full_clean()


@pytest.mark.django_db
def test_gtm_mode_rejects_direct_tracking_ids():
    site = Site.objects.get(is_default_site=True)
    configured = TrackingSettings(
        site=site,
        tracking_mode=TrackingSettings.TrackingMode.GTM,
        gtm_container_id="GTM-ABC123",
        ga4_measurement_id="G-ABC123",
    )

    with pytest.raises(ValidationError):
        configured.full_clean()


@pytest.mark.django_db
@override_settings(ENABLE_EXTERNAL_TRACKING=False)
def test_runtime_config_uses_named_routes_and_disables_external_tracking_by_environment():
    request = RequestFactory().get("/", HTTP_HOST="localhost")
    context = site_configuration(request)

    assert context["runtime_config"]["forms"]["endpoint"] == "/contact/"
    assert context["runtime_config"]["analytics"]["collectEndpoint"] == (
        "/analytics/events/collect/"
    )
    assert context["runtime_config"]["tracking"]["mode"] == "DISABLED"
    assert context["runtime_config"]["tracking"]["externalEnabled"] is False


@pytest.mark.django_db
@override_settings(ENABLE_EXTERNAL_TRACKING=True)
def test_gtm_public_identifier_is_exposed_only_in_gtm_mode():
    request = RequestFactory().get("/", HTTP_HOST="localhost")
    site = Site.find_for_request(request)
    configured = TrackingSettings.for_site(site)
    configured.tracking_mode = TrackingSettings.TrackingMode.GTM
    configured.gtm_container_id = "GTM-ABC123"
    configured.save()

    context = site_configuration(request)
    tracking = context["runtime_config"]["tracking"]

    assert tracking["mode"] == "GTM"
    assert tracking["gtmContainerId"] == "GTM-ABC123"
    assert tracking["ga4MeasurementId"] == ""
