from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from apps.accounts.roles import ROLE_NAMES


class Command(BaseCommand):
    help = "Assign one baseline Ibtikar staff role to an existing user account."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--role", required=True, choices=ROLE_NAMES)

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            raise CommandError("User account not found. Create the account first.")

        group = user.groups.model.objects.filter(name=options["role"]).first()
        if group is None:
            raise CommandError(
                "Ibtikar roles have not been provisioned. Run bootstrap_ibtikar first."
            )

        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])
        user.groups.add(group)
        self.stdout.write(
            self.style.SUCCESS(f"Assigned {options['role']} to {user.email}.")
        )
