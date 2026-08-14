import pytest


@pytest.mark.django_db
def test_public_homepage_renders(client):
    response = client.get("/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_health_check_renders(client):
    response = client.get("/healthz/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_control_requires_authentication(client):
    response = client.get("/control/")
    assert response.status_code in {301, 302}
    assert "/control/login/" in response["Location"]


@pytest.mark.django_db
def test_control_login_page_renders(client):
    response = client.get("/control/login/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_django_admin_login_page_renders(client):
    response = client.get("/django-admin/login/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_customer_login_page_renders(client):
    response = client.get("/accounts/login/")
    assert response.status_code == 200
