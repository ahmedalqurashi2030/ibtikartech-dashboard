from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .choices import ApprovalStatus
from .models import Approval


class ApprovalResponseError(Exception):
    """Raised when a customer approval cannot be responded to safely."""


@transaction.atomic
def respond_to_approval(*, approval_id, contact, decision, response_note=""):
    if decision not in {
        ApprovalStatus.APPROVED,
        ApprovalStatus.CHANGES_REQUESTED,
        ApprovalStatus.REJECTED,
    }:
        raise ApprovalResponseError("Invalid approval decision.")

    try:
        approval = Approval.objects.select_for_update().get(
            id=approval_id,
            requested_from_contact=contact,
        )
    except Approval.DoesNotExist as exc:
        raise ApprovalResponseError("Approval not found for this contact.") from exc

    if approval.status != ApprovalStatus.PENDING:
        raise ApprovalResponseError("This approval has already been answered.")

    approval.status = decision
    approval.response_note = (response_note or "").strip()
    approval.responded_at = timezone.now()
    try:
        approval.full_clean()
    except ValidationError as exc:
        raise ApprovalResponseError("Approval response validation failed.") from exc
    approval.save(update_fields=["status", "response_note", "responded_at"])
    return approval
