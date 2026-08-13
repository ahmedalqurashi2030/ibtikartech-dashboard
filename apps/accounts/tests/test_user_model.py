import pytest
from django.contrib.auth import get_user_model

pytestmark = pytest.mark.django_db


def test_user_uses_email_as_identity():
    user = get_user_model().objects.create_user(
        email="Owner@Example.COM",
        password="test-password-123",
    )
    assert user.username is None
    assert user.email == "owner@example.com"
