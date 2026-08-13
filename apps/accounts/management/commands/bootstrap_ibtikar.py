import os
import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from wagtail.models import Page, Site

from apps.accounts.roles import provision_default_roles
from apps.content.models import HomePage, TharaaPage


class Command(BaseCommand):
    help = "Bootstrap Ibtikar Tech admin access and the minimum Wagtail site tree."

    def add_arguments(self, parser):
        parser.add_argument("--email", default=os.getenv("IBTIKAR_ADMIN_EMAIL", ""))
        parser.add_argument("--password", default=os.getenv("IBTIKAR_ADMIN_PASSWORD", ""))
        parser.add_argument(
            "--hostname",
            default=os.getenv("IBTIKAR_SITE_HOSTNAME", "localhost"),
        )

    @transaction.atomic
    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        password = options["password"]
        hostname = options["hostname"].strip() or "localhost"
        if not email:
            raise CommandError(
                "Admin email is required. Pass --email or set IBTIKAR_ADMIN_EMAIL."
            )

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        generated_password = ""

        if user is None:
            if not password:
                generated_password = secrets.token_urlsafe(24)
                password = generated_password
            user = User.objects.create_superuser(email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Created superuser: {email}"))
        else:
            changed_fields = []
            if not user.is_staff:
                user.is_staff = True
                changed_fields.append("is_staff")
            if not user.is_superuser:
                user.is_superuser = True
                changed_fields.append("is_superuser")
            if not user.is_active:
                user.is_active = True
                changed_fields.append("is_active")
            if password:
                user.set_password(password)
                changed_fields.append("password")
            if changed_fields:
                user.save(update_fields=changed_fields)
                self.stdout.write(self.style.SUCCESS(f"Updated superuser: {email}"))
            else:
                self.stdout.write(f"Superuser already ready: {email}")

        root = Page.get_first_root_node()
        if root is None:
            raise CommandError("Wagtail root page is missing. Run migrations first.")

        home = HomePage.objects.first()
        if home is None:
            home = HomePage(title="ابتكار تك", slug="ibtikar-tech", intro="")
            root.add_child(instance=home)
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Created Ibtikar Tech HomePage."))

        Site.objects.exclude(root_page=home).filter(is_default_site=True).update(
            is_default_site=False
        )
        site = Site.objects.filter(is_default_site=True).first()
        if site is None:
            site = Site.objects.filter(hostname=hostname).first()
        if site is None:
            site = Site()
        site.hostname = hostname
        site.port = 80
        site.site_name = "Ibtikar Tech"
        site.root_page = home
        site.is_default_site = True
        site.save()

        tharaa = TharaaPage.objects.first()
        if tharaa is None:
            tharaa = TharaaPage(
                title="ثيم ثراء",
                slug="tharaa",
                eyebrow="ثيم ثراء — Tharaa Theme",
                short_description="ثيم احترافي لمتاجر سلة، مقدم من ابتكار تك.",
                demo_url="https://demostore.salla.sa/ar/dev-seclp1tvcdzbl4ri",
                marketplace_url="https://salla.com/themes/1609470678",
            )
            home.add_child(instance=tharaa)
            tharaa.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Created Tharaa marketing page."))

        roles = provision_default_roles(home)
        self.stdout.write(self.style.SUCCESS(f"Provisioned {len(roles)} staff roles."))
        self.stdout.write(self.style.SUCCESS("Ibtikar Tech bootstrap completed."))
        self.stdout.write(f"Control panel: http://{hostname}/control/")
        if generated_password:
            self.stdout.write(
                self.style.WARNING(
                    "Generated one-time local admin password: " + generated_password
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    "Store it securely now; it is not written to the repository."
                )
            )
