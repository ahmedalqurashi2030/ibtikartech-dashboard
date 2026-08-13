import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from wagtail.models import Site

from apps.content.models import HomePage, TharaaPage


@pytest.mark.django_db
def test_bootstrap_command_creates_admin_and_minimum_site_tree():
    call_command(
        "bootstrap_ibtikar",
        email="owner@example.com",
        password="Strong-test-password-123!",
        hostname="example.test",
    )

    user = get_user_model().objects.get(email="owner@example.com")
    assert user.is_superuser is True
    assert user.is_staff is True
    assert HomePage.objects.count() == 1
    assert TharaaPage.objects.count() == 1
    assert Site.objects.get(is_default_site=True).root_page.specific == HomePage.objects.get()


@pytest.mark.django_db
def test_bootstrap_command_is_idempotent():
    kwargs = {
        "email": "owner@example.com",
        "password": "Strong-test-password-123!",
        "hostname": "example.test",
    }
    call_command("bootstrap_ibtikar", **kwargs)
    call_command("bootstrap_ibtikar", **kwargs)

    assert get_user_model().objects.filter(email="owner@example.com").count() == 1
    assert HomePage.objects.count() == 1
    assert TharaaPage.objects.count() == 1
