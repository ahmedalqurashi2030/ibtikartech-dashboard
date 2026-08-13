from django import forms


class ServiceInquiryForm(forms.Form):
    full_name = forms.CharField(label="الاسم", max_length=180)
    email = forms.EmailField(label="البريد الإلكتروني")
    phone = forms.CharField(label="رقم الجوال", max_length=32, required=False)
    store_url = forms.URLField(label="رابط المتجر أو الموقع", required=False)
    message = forms.CharField(
        label="ما الذي تحتاجه؟",
        required=False,
        widget=forms.Textarea(attrs={"rows": 5}),
    )

    def clean_email(self):
        return self.cleaned_data["email"].strip().casefold()

    def clean_phone(self):
        return self.cleaned_data.get("phone", "").strip()
