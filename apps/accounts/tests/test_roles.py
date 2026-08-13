import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from wagtail.models import GroupPagePermission

from apps.content.models import HomePage

from ..roles import ROLE_CONTENT, ROLE_NAMES, ROLE_SALES


@pytest.fixture
def bootstrapped(db):
    call_command(
        "bootstrap_ibtikar",
        email="owner-roles@example.com",
        password="Strong-test-password-123!",
        hostname="roles.test",
    )
    return HomePage.objects.get()


@pytest.mark.django_db
def test_bootstrap_provisions_baseline_roles(bootstrapped):
    group_model = get_user_model()._meta.get_field("groups").remote_field.model
    role_names = set(
        group_model.objects.filter(name__in=ROLE_NAMES).values_list("name", flat=True)
    )
    assert role_names == set(ROLE_NAMES)


@pytest.mark.django_db
def test_content_role_has_page_editing_permissions(bootstrapped):
    group_model = get_user_model()._meta.get_field("groups").remote_field.model
    content_group = group_model.objects.get(name=ROLE_CONTENT)
    codenames = set(
        GroupPagePermission.objects.filter(
            group=content_group,
            page=bootstrapped,
        ).values_list("permission__codename", flat=True)
    )
    assert {"add_page", "change_page", "publish_page"} <= codenames


@pytest.mark.django_db
def test_assign_role_marks_user_as_staff(bootstrapped):
    user = get_user_model().objects.create_user(
        email="sales-person@example.com",
        password="test-password-123",
    )
    call_command(
        "assign_ibtikar_role",
        email=user.email,
        role=ROLE_SALES,
    )
    user.refresh_from_db()

    assert user.is_staff is True
    assert user.groups.filter(name=ROLE_SALES).exists()

    client_url = reverse("wagtailadmin_home")
    assert client_url == "/control/"
