from django import forms

from apps.projects.models import Project

from .models import SupportTicket


class SupportTicketCreateForm(forms.ModelForm):
    class Meta:
        model = SupportTicket
        fields = ("project", "subject", "description", "priority")
        widgets = {
            "description": forms.Textarea(attrs={"rows": 6}),
        }

    def __init__(self, *args, contact, **kwargs):
        super().__init__(*args, **kwargs)
        self.contact = contact
        self.fields["project"].queryset = Project.objects.filter(
            contact=contact
        ).order_by("-updated_at")
        self.fields["project"].required = False

    def save(self, commit=True):
        ticket = super().save(commit=False)
        ticket.contact = self.contact
        if commit:
            ticket.full_clean()
            ticket.save()
        return ticket


class CustomerTicketMessageForm(forms.Form):
    body = forms.CharField(
        label="الرسالة",
        widget=forms.Textarea(attrs={"rows": 5}),
    )
    attachment = forms.FileField(label="مرفق", required=False)
