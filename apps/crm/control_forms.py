from django import forms
from django.utils import timezone

from .models import ActivityEvent, ConsentRecord


class ConsentRecordCreateForm(forms.ModelForm):
    class Meta:
        model = ConsentRecord
        fields = (
            "contact",
            "channel",
            "purpose",
            "status",
            "source",
            "policy_version",
            "granted_at",
            "withdrawn_at",
            "ip_address",
            "user_agent",
        )
        widgets = {
            "granted_at": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "withdrawn_at": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "user_agent": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.is_bound:
            self.initial.setdefault("granted_at", timezone.localtime())


class ActivityEventCreateForm(forms.ModelForm):
    class Meta:
        model = ActivityEvent
        fields = (
            "contact",
            "event_type",
            "reference_type",
            "reference_id",
            "title",
            "description",
            "metadata",
        )
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "metadata": forms.Textarea(attrs={"rows": 5}),
        }
