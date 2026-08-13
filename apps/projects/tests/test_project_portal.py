import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from apps.crm.models import Contact

from ..choices import ApprovalStatus, ProjectVisibility
from ..models import Approval, Project, ProjectUpdate


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(
        email="project-viewer@example.com",
        password="test-password-123",
        first_name="خالد",
        last_name="العميل",
    )


@pytest.fixture
def contact(user):
    return Contact.objects.create(
        user=user,
        full_name="خالد العميل",
        email=user.email,
    )


@pytest.fixture
def project(contact):
    return Project.objects.create(
        contact=contact,
        name="مشروع العميل",
        progress_percentage=35,
    )


@pytest.mark.django_db
def test_customer_can_view_own_project_but_not_another_customers(client, user, project):
    other_contact = Contact.objects.create(
        full_name="عميل آخر",
        email="isolated@example.com",
    )
    other_project = Project.objects.create(contact=other_contact, name="مشروع سري")
    client.force_login(user)

    own_response = client.get(
        reverse("customer_portal:project_detail", args=[project.id])
    )
    other_response = client.get(
        reverse("customer_portal:project_detail", args=[other_project.id])
    )

    assert own_response.status_code == 200
    assert other_response.status_code == 404


@pytest.mark.django_db
def test_customer_project_detail_hides_internal_updates(client, user, project):
    ProjectUpdate.objects.create(
        project=project,
        title="تحديث داخلي سري",
        body="لا يجب أن يراه العميل",
        visibility=ProjectVisibility.INTERNAL,
    )
    ProjectUpdate.objects.create(
        project=project,
        title="تحديث للعميل",
        body="هذا التحديث مرئي",
        visibility=ProjectVisibility.CUSTOMER,
    )
    client.force_login(user)

    response = client.get(reverse("customer_portal:project_detail", args=[project.id]))
    content = response.content.decode()

    assert response.status_code == 200
    assert "تحديث للعميل" in content
    assert "تحديث داخلي سري" not in content
    assert "لا يجب أن يراه العميل" not in content


@pytest.mark.django_db
def test_customer_can_respond_to_requested_approval(client, user, contact, project):
    approval = Approval.objects.create(
        project=project,
        title="اعتماد الواجهة",
        requested_from_contact=contact,
    )
    client.force_login(user)
    prefix = f"approval-{approval.id}"
    response = client.post(
        reverse(
            "customer_portal:respond_project_approval",
            args=[project.id, approval.id],
        ),
        {
            f"{prefix}-decision": ApprovalStatus.APPROVED,
            f"{prefix}-response_note": "معتمد",
        },
    )

    assert response.status_code == 302
    approval.refresh_from_db()
    assert approval.status == ApprovalStatus.APPROVED
    assert approval.responded_at is not None


@pytest.mark.django_db
def test_customer_cannot_respond_to_other_customers_approval(client, user, project):
    other_contact = Contact.objects.create(
        full_name="عميل آخر",
        email="approval-other@example.com",
    )
    other_project = Project.objects.create(contact=other_contact, name="مشروع آخر")
    approval = Approval.objects.create(
        project=other_project,
        title="اعتماد خاص بعميل آخر",
        requested_from_contact=other_contact,
    )
    client.force_login(user)
    prefix = f"approval-{approval.id}"

    response = client.post(
        reverse(
            "customer_portal:respond_project_approval",
            args=[other_project.id, approval.id],
        ),
        {
            f"{prefix}-decision": ApprovalStatus.APPROVED,
            f"{prefix}-response_note": "محاولة غير مسموحة",
        },
    )

    assert response.status_code == 404
    approval.refresh_from_db()
    assert approval.status == ApprovalStatus.PENDING
