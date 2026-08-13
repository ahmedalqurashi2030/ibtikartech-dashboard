from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from ..forms import MAX_ATTACHMENT_SIZE, CustomerTicketMessageForm


@pytest.mark.django_db
def test_support_attachment_rejects_disallowed_extension():
    form = CustomerTicketMessageForm(
        data={"body": "مرفق غير مسموح"},
        files={
            "attachment": SimpleUploadedFile(
                "script.exe",
                b"not-an-executable",
                content_type="application/octet-stream",
            )
        },
    )

    assert not form.is_valid()
    assert "attachment" in form.errors


@pytest.mark.django_db
def test_support_attachment_rejects_file_over_10mb():
    oversized = BytesIO(b"0" * (MAX_ATTACHMENT_SIZE + 1))
    attachment = SimpleUploadedFile(
        "large.pdf",
        oversized.read(),
        content_type="application/pdf",
    )
    form = CustomerTicketMessageForm(
        data={"body": "ملف كبير"},
        files={"attachment": attachment},
    )

    assert not form.is_valid()
    assert "attachment" in form.errors


@pytest.mark.django_db
def test_support_attachment_accepts_small_pdf():
    form = CustomerTicketMessageForm(
        data={"body": "ملف صحيح"},
        files={
            "attachment": SimpleUploadedFile(
                "guide.pdf",
                b"small-pdf",
                content_type="application/pdf",
            )
        },
    )

    assert form.is_valid()
