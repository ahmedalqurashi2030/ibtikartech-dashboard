from django import forms

from .choices import ApprovalStatus


class ApprovalResponseForm(forms.Form):
    decision = forms.ChoiceField(
        label="القرار",
        choices=(
            (ApprovalStatus.APPROVED, "موافقة"),
            (ApprovalStatus.CHANGES_REQUESTED, "طلب تعديلات"),
            (ApprovalStatus.REJECTED, "رفض"),
        ),
    )
    response_note = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 4}),
        label="ملاحظة الرد",
    )

    def clean(self):
        cleaned_data = super().clean()
        decision = cleaned_data.get("decision")
        response_note = (cleaned_data.get("response_note") or "").strip()
        requires_note = decision in {
            ApprovalStatus.CHANGES_REQUESTED,
            ApprovalStatus.REJECTED,
        }
        if requires_note and not response_note:
            self.add_error(
                "response_note",
                "اكتب ملاحظة عند طلب تعديلات أو رفض الموافقة.",
            )
        cleaned_data["response_note"] = response_note
        return cleaned_data
