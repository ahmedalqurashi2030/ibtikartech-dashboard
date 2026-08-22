from django import forms


class PublicInquiryForm(forms.Form):
    full_name = forms.CharField(max_length=180)
    phone = forms.CharField(max_length=32)
    email = forms.EmailField(required=False)
    company = forms.CharField(max_length=180, required=False)
    goal = forms.CharField(max_length=120)
    stage = forms.CharField(max_length=120)
    platform = forms.CharField(max_length=80, required=False)
    timeline = forms.CharField(max_length=80, required=False)
    details = forms.CharField(max_length=5000, widget=forms.Textarea)
    service = forms.SlugField(max_length=140, required=False)
    source = forms.CharField(max_length=120, required=False)
    ibt_website = forms.CharField(required=False)

    def clean_phone(self):
        phone = "".join(ch for ch in self.cleaned_data["phone"] if ch.isdigit() or ch == "+")
        if len(phone.replace("+", "")) < 8:
            raise forms.ValidationError("أدخل رقم تواصل صحيحًا.")
        return phone

    def clean_ibt_website(self):
        value = self.cleaned_data.get("ibt_website", "")
        if value:
            raise forms.ValidationError("تعذر إرسال الطلب.")
        return value
