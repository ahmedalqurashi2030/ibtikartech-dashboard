from pathlib import Path

from django import forms

from apps.projects.models import Project

from .models import SupportTicket


MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024
ALLOWED_ATTACHMENT_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".doc",
    ".docx",
    ".txt",
}


class SupportTicketCreateForm(forms.ModelForm):
    class Meta:
        model = SupportTicket
        fields = ("project", "subject", "description", "priority")
        labels = {
            "project": "المشروع المرتبط",
            "subject": "عنوان المشكلة",
            "description": "وصف المشكلة",
            "priority": "الأولوية",
        }
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

    def clean_attachment(self):
        attachment = self.cleaned_data.get("attachment")
        if not attachment:
            return attachment

        if attachment.size > MAX_ATTACHMENT_SIZE:
            raise forms.ValidationError("حجم المرفق يجب ألا يتجاوز 10MB.")

        extension = Path(attachment.name).suffix.lower()
        if extension not in ALLOWED_ATTACHMENT_EXTENSIONS:
            raise forms.ValidationError("نوع الملف غير مسموح في مرفقات الدعم.")

        return attachment
