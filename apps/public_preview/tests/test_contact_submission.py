import pytest
from django.urls import reverse

from apps.crm.models import Contact
from apps.sales.models import Inquiry


def inquiry_payload(**overrides):
    payload = {
        "full_name": "أحمد القحطاني",
        "phone": "0501234567",
        "email": "ahmed@example.com",
        "company": "متجر أحمد",
        "goal": "تطوير متجر قائم",
        "stage": "جاهز للتنفيذ",
        "platform": "سلة",
        "timeline": "خلال شهر",
        "details": "نحتاج تحسين تجربة المتجر وصفحة المنتج.",
        "source": "website-test",
        "service": "",
        "ibt_website": "",
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
def test_contact_post_creates_contact_and_inquiry_without_account(client):
    response = client.post(reverse("public_preview:contact"), inquiry_payload())

    assert response.status_code == 201
    assert response.json()["ok"] is True
    assert response.json()["reference"].startswith("IBT-")
    contact = Contact.objects.get()
    inquiry = Inquiry.objects.get()
    assert contact.user is None
    assert contact.phone == "0501234567"
    assert inquiry.contact == contact
    assert inquiry.source == "website-test"
    assert inquiry.requirements_data["platform"] == "سلة"


@pytest.mark.django_db
def test_contact_post_reuses_existing_contact(client):
    first = client.post(reverse("public_preview:contact"), inquiry_payload())
    second = client.post(
        reverse("public_preview:contact"),
        inquiry_payload(full_name="أحمد المحدّث", details="طلب ثانٍ"),
    )

    assert first.status_code == second.status_code == 201
    assert Contact.objects.count() == 1
    assert Inquiry.objects.count() == 2
    assert Contact.objects.get().full_name == "أحمد المحدّث"


@pytest.mark.django_db
def test_contact_post_rejects_invalid_and_honeypot_submissions(client):
    invalid = client.post(reverse("public_preview:contact"), inquiry_payload(phone="123"))
    spam = client.post(
        reverse("public_preview:contact"), inquiry_payload(ibt_website="bot.example")
    )

    assert invalid.status_code == 400
    assert invalid.json()["ok"] is False
    assert invalid.json()["errors"]["phone"][0]["message"] == "أدخل رقم تواصل صحيحًا."
    assert spam.status_code == 400
    assert Contact.objects.count() == 0
    assert Inquiry.objects.count() == 0


def test_home_service_first_cinematic_order_and_tharaa_direct_purchase(settings):
    home = (settings.BASE_DIR / "templates/public_preview/pages/index.html").read_text(
        encoding="utf-8"
    )
    tharaa = (settings.BASE_DIR / "templates/public_preview/pages/tharaa.html").read_text(
        encoding="utf-8"
    )

    assert home.index('id="services"') < home.index('class="cinematic-story')
    assert "بعد اختيار نقطة البداية" in home
    assert "hero-capabilities" not in home
    assert "hero__trust" not in home
    assert "hero-ecosystem" in home
    assert home.count('class="service-scene-copy"') == 5
    assert "https://salla.com/themes/1609470678" in tharaa
    assert "299 ر.س" in tharaa

def test_unique_conversion_pages_keep_explicit_quote_measurement(settings):
    pages = {
        "index.html": 6,
        "services.html": 2,
        "tharaa.html": 2,
    }
    pages_dir = settings.BASE_DIR / "templates/public_preview/pages"
    for page_name, expected in pages.items():
        source = (pages_dir / page_name).read_text(encoding="utf-8")
        assert source.count('data-analytics="quote_request"') == expected
        assert source.count("data-analytics-label=") >= expected

    contact = (pages_dir / "contact.html").read_text(encoding="utf-8")
    assert 'data-analytics="inquiry_submitted"' not in contact
    assert contact.count('data-success-event="inquiry_submitted"') == 1

