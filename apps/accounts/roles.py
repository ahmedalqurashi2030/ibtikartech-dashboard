from django.contrib.auth.models import Group, Permission
from wagtail.models import GroupPagePermission

ROLE_MANAGEMENT = "Ibtikar Management"
ROLE_SALES = "Ibtikar Sales"
ROLE_DELIVERY = "Ibtikar Delivery"
ROLE_SUPPORT = "Ibtikar Support"
ROLE_MARKETING = "Ibtikar Marketing"
ROLE_CONTENT = "Ibtikar Content"

ROLE_NAMES = (
    ROLE_MANAGEMENT,
    ROLE_SALES,
    ROLE_DELIVERY,
    ROLE_SUPPORT,
    ROLE_MARKETING,
    ROLE_CONTENT,
)

CUSTOM_APPS = {
    "accounts",
    "crm",
    "services",
    "sales",
    "customer_portal",
    "projects",
    "support",
    "marketing",
    "analytics",
    "content",
    "core",
}

ROLE_RULES = {
    ROLE_MANAGEMENT: {"apps": CUSTOM_APPS, "actions": {"add", "change", "delete", "view"}},
    ROLE_SALES: {
        "apps": {"crm", "services", "sales"},
        "actions": {"add", "change", "view"},
    },
    ROLE_DELIVERY: {
        "apps": {"crm", "services", "sales", "projects", "support"},
        "actions": {"add", "change", "view"},
    },
    ROLE_SUPPORT: {
        "apps": {"crm", "projects", "support"},
        "actions": {"add", "change", "view"},
    },
    ROLE_MARKETING: {
        "apps": {"crm", "services", "marketing", "analytics"},
        "actions": {"add", "change", "view"},
    },
    ROLE_CONTENT: {
        "apps": {"services"},
        "actions": {"view"},
    },
}

PAGE_EDITOR_ROLES = {ROLE_MANAGEMENT, ROLE_CONTENT}
PAGE_PERMISSION_CODENAMES = {"add_page", "change_page", "publish_page"}


def _permission_action(permission):
    return permission.codename.split("_", 1)[0]


def _permissions_for_rule(rule):
    candidates = Permission.objects.filter(
        content_type__app_label__in=rule["apps"]
    ).select_related("content_type")
    return [
        permission
        for permission in candidates
        if _permission_action(permission) in rule["actions"]
    ]


def provision_default_roles(home_page):
    access_admin = Permission.objects.filter(codename="access_admin").first()
    page_permissions = list(
        Permission.objects.filter(
            content_type__app_label="wagtailcore",
            content_type__model="page",
            codename__in=PAGE_PERMISSION_CODENAMES,
        )
    )

    provisioned = {}
    for role_name in ROLE_NAMES:
        group, _ = Group.objects.get_or_create(name=role_name)
        permissions = _permissions_for_rule(ROLE_RULES[role_name])
        if access_admin is not None:
            permissions.append(access_admin)
        group.permissions.set(permissions)

        existing = GroupPagePermission.objects.filter(group=group, page=home_page)
        if role_name in PAGE_EDITOR_ROLES:
            existing.exclude(permission__in=page_permissions).delete()
            for permission in page_permissions:
                GroupPagePermission.objects.get_or_create(
                    group=group,
                    page=home_page,
                    permission=permission,
                )
        else:
            existing.delete()
        provisioned[role_name] = group

    return provisioned
