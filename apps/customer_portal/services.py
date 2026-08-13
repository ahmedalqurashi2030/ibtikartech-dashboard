from django.db import transaction

from apps.crm.models import Contact


class ContactResolutionError(Exception):
    """Raised when an authenticated account cannot be linked safely to one CRM contact."""


@transaction.atomic
def get_or_link_contact_for_user(user):
    if not user.is_authenticated:
        raise ContactResolutionError("Authentication is required.")

    try:
        return user.crm_contact
    except Contact.DoesNotExist:
        pass

    email = (user.email or "").strip().casefold()
    if not email:
        raise ContactResolutionError("The account has no email address.")

    matches = list(
        Contact.objects.select_for_update()
        .filter(email__iexact=email, status=Contact.Status.ACTIVE)
        .select_related("user")[:3]
    )

    if len(matches) > 1:
        raise ContactResolutionError(
            "More than one CRM contact matches this account email. Manual review is required."
        )

    if len(matches) == 1:
        contact = matches[0]
        if contact.user_id and contact.user_id != user.id:
            raise ContactResolutionError(
                "The matching CRM contact is already linked to another account."
            )
        if contact.user_id is None:
            contact.user = user
            contact.save(update_fields=["user", "updated_at"])
        return contact

    full_name = user.get_full_name().strip() or email.split("@", 1)[0]
    return Contact.objects.create(
        user=user,
        full_name=full_name,
        email=email,
        first_source="ACCOUNT",
    )
