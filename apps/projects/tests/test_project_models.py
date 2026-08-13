from datetime import timedelta
from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.crm.models import Contact
from apps.sales.models import Opportunity, Quote

from ..choices import ApprovalStatus, ProjectStageStatus, ProjectStatus
from ..models import Approval, Project, ProjectStage, ProjectUpdate
from ..services import ApprovalResponseError, respond_to_approval


@pytest.fixture
def contact(db):
    return Contact.objects.create(full_name="عميل المشروع", email="project@example.com")


@pytest.fixture
def other_contact(db):
    return Contact.objects.create(full_name="عميل آخر", email="other-project@example.com")


@pytest.fixture
def project(contact):
    return Project.objects.create(contact=contact, name="تطوير المتجر")


@pytest.mark.django_db
def test_project_quote_must_belong_to_same_contact(contact, other_contact):
    opportunity = Opportunity.objects.create(
        contact=other_contact,
        title="فرصة عميل آخر",
        estimated_value=Decimal("1000.00"),
    )
    quote = Quote.objects.create(opportunity=opportunity, contact=other_contact)
    project = Project(contact=contact, quote=quote, name="مشروع غير متطابق")

    with pytest.raises(ValidationError) as exc_info:
        project.full_clean()

    assert "quote" in exc_info.value.message_dict


@pytest.mark.django_db
def test_completed_project_requires_full_progress_and_timestamp(contact):
    project = Project(
        contact=contact,
        name="مشروع مكتمل",
        status=ProjectStatus.COMPLETED,
        progress_percentage=90,
    )

    with pytest.raises(ValidationError) as exc_info:
        project.full_clean()

    assert "progress_percentage" in exc_info.value.message_dict
    assert "completed_at" in exc_info.value.message_dict

    project.progress_percentage = 100
    project.completed_at = timezone.now()
    project.full_clean()


@pytest.mark.django_db
def test_target_completion_cannot_be_before_project_start(contact):
    started_at = timezone.now()
    project = Project(
        contact=contact,
        name="مشروع بموعد خاطئ",
        started_at=started_at,
        target_completion_date=(started_at - timedelta(days=1)).date(),
    )

    with pytest.raises(ValidationError) as exc_info:
        project.full_clean()

    assert "target_completion_date" in exc_info.value.message_dict


@pytest.mark.django_db
def test_completed_stage_requires_completion_timestamp(project):
    stage = ProjectStage(
        project=project,
        name="التصميم",
        status=ProjectStageStatus.COMPLETED,
    )

    with pytest.raises(ValidationError) as exc_info:
        stage.full_clean()

    assert "completed_at" in exc_info.value.message_dict


@pytest.mark.django_db
def test_project_update_stage_must_belong_to_project(contact):
    first = Project.objects.create(contact=contact, name="المشروع الأول")
    second = Project.objects.create(contact=contact, name="المشروع الثاني")
    stage = ProjectStage.objects.create(project=first, name="المرحلة الأولى", sort_order=1)
    update = ProjectUpdate(
        project=second,
        stage=stage,
        title="تحديث خاطئ",
        body="تفاصيل",
    )

    with pytest.raises(ValidationError) as exc_info:
        update.full_clean()

    assert "stage" in exc_info.value.message_dict


@pytest.mark.django_db
def test_approval_response_is_atomic_and_cannot_repeat(project, contact):
    approval = Approval.objects.create(
        project=project,
        title="اعتماد التصميم",
        requested_from_contact=contact,
    )

    responded = respond_to_approval(
        approval_id=approval.id,
        project=project,
        contact=contact,
        decision=ApprovalStatus.APPROVED,
        response_note="معتمد",
    )

    assert responded.status == ApprovalStatus.APPROVED
    assert responded.responded_at is not None

    with pytest.raises(ApprovalResponseError):
        respond_to_approval(
            approval_id=approval.id,
            project=project,
            contact=contact,
            decision=ApprovalStatus.REJECTED,
            response_note="تغيير القرار",
        )
