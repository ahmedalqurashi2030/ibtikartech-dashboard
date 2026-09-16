# أوامر التطوير المحلي

نفّذ الأوامر التالية في PowerShell من داخل Visual Studio Code.

## الانتقال إلى المشروع

```powershell
cd "E:\projects\ابتكار تك\ibtikartech-dashboard-main\ibtikartech-dashboard"
```

## إنشاء البيئة الافتراضية

يُنفّذ هذا الأمر مرة واحدة فقط:

```powershell
python --version
python -m venv .venv
```

## تفعيل البيئة الافتراضية

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

بعد التفعيل يجب أن يظهر `(.venv)` في بداية سطر الطرفية.

## تثبيت مكتبات المشروع

المكتبات المباشرة المطلوبة للتشغيل:

- `Django>=5.2,<5.3`
- `wagtail>=7.4,<7.5`
- `django-allauth>=65,<66`
- `psycopg[binary]>=3.2,<4`
- `django-storages[s3]>=1.14.6,<2`
- `gunicorn>=26,<27`

مكتبات التطوير والاختبارات:

- `pytest>=8,<9`
- `pytest-django>=4.11,<5`
- `ruff>=0.12,<1`

يثبّت `pip` تلقائيًا جميع المكتبات الفرعية التي تحتاجها المكتبات السابقة.

```powershell
$env:PIP_DEFAULT_TIMEOUT="180"
$env:PIP_RETRIES="8"

python -m pip install --upgrade pip
python -m pip install "setuptools>=75"
python -m pip install `
    "Django>=5.2,<5.3" `
    "wagtail>=7.4,<7.5" `
    "django-allauth>=65,<66" `
    "psycopg[binary]>=3.2,<4" `
    "django-storages[s3]>=1.14.6,<2" `
    "gunicorn>=26,<27" `
    "pytest>=8,<9" `
    "pytest-django>=4.11,<5" `
    "ruff>=0.12,<1"
python -m pip install --no-build-isolation -e ".[dev]"
```

## تحديد إعدادات التطوير المحلي

```powershell
$env:DJANGO_SETTINGS_MODULE="config.settings.local"
```

## تجهيز قاعدة البيانات

```powershell
python manage.py migrate
```

## إنشاء حساب المدير وتهيئة النظام

غيّر البريد وكلمة المرور قبل التنفيذ:

```powershell
$env:IBTIKAR_ADMIN_EMAIL="admin@example.com"
$env:IBTIKAR_ADMIN_PASSWORD="ضع-كلمة-مرور-قوية-هنا"

python manage.py bootstrap_ibtikar
```

## تشغيل فحوصات المشروع

```powershell
python manage.py check
python -m ruff check apps config tests
python -m pytest
python manage.py makemigrations --check --dry-run
```

## تشغيل خادم التطوير

```powershell
python manage.py runserver
```

المسارات المحلية:

- الموقع العام: <http://127.0.0.1:8000/>
- لوحة التحكم: <http://127.0.0.1:8000/control/>
- بوابة العميل: <http://127.0.0.1:8000/portal/>
- فحص الصحة: <http://127.0.0.1:8000/healthz/>

لإيقاف الخادم اضغط `Ctrl+C`.

## إلغاء تفعيل البيئة

```powershell
deactivate
```

## التشغيل في المرات التالية

بعد اكتمال الإعداد الأول، استخدم في كل مرة:

```powershell
cd "E:\projects\ابتكار تك\ibtikartech-dashboard-main\ibtikartech-dashboard"
.\.venv\Scripts\Activate.ps1
$env:DJANGO_SETTINGS_MODULE="config.settings.local"
python manage.py runserver
```
