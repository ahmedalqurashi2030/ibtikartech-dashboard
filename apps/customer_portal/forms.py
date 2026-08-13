from django import forms

from apps.crm.models import Contact, Store

from .models import CustomerPreference


class ContactProfileForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ("full_name", "phone", "preferred_language")
        widgets = {
            "full_name": forms.TextInput(attrs={"autocomplete": "name"}),
            "phone": forms.TextInput(attrs={"autocomplete": "tel", "inputmode": "tel"}),
        }


class CustomerPreferenceForm(forms.ModelForm):
    class Meta:
        model = CustomerPreference
        fields = ("default_store", "language", "timezone")
        widgets = {
            "timezone": forms.TextInput(attrs={"autocomplete": "off"}),
        }

    def __init__(self, *args, contact, **kwargs):
        super().__init__(*args, **kwargs)
        self.contact = contact
        self.fields["default_store"].queryset = Store.objects.filter(
            primary_contact=contact,
            status=Store.Status.ACTIVE,
        ).order_by("name")
