import json

from django.core.serializers.json import DjangoJSONEncoder
from django.db.models.fields.files import FieldFile
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver

from .audit import get_audit_context
from .models import AuditLog

AUDITED_APP_LABELS = {
    "accounts",
    "crm",
    "services",
    "sales",
    "projects",
    "support",
    "marketing",
}
SENSITIVE_FIELDS = {"password"}


def _is_audited(sender):
    return sender._meta.app_label in AUDITED_APP_LABELS


def _json_value(value):
    if isinstance(value, FieldFile):
        value = value.name
    try:
        return json.loads(json.dumps(value, cls=DjangoJSONEncoder))
    except (TypeError, ValueError):
        return str(value)


def _snapshot(instance):
    data = {}
    for field in instance._meta.concrete_fields:
        if field.name in SENSITIVE_FIELDS:
            continue
        data[field.name] = _json_value(getattr(instance, field.attname))
    return data


def _write_audit(instance, action, before_data, after_data):
    actor_id, ip_address = get_audit_context()
    if (
        instance._meta.label_lower == "accounts.user"
        and actor_id is not None
        and str(actor_id) == str(instance.pk)
        and action == "DELETE"
    ):
        actor_id = None

    AuditLog.objects.create(
        actor_user_id=actor_id,
        action=action,
        object_type=instance._meta.label,
        object_id=str(instance.pk),
        before_data=before_data,
        after_data=after_data,
        ip_address=ip_address,
    )


@receiver(pre_save, dispatch_uid="ibtikar_audit_pre_save")
def audit_pre_save(sender, instance, raw=False, **kwargs):
    if raw or not _is_audited(sender):
        return
    if instance.pk and sender._default_manager.filter(pk=instance.pk).exists():
        previous = sender._default_manager.get(pk=instance.pk)
        instance._ibtikar_audit_before = _snapshot(previous)
    else:
        instance._ibtikar_audit_before = {}


@receiver(post_save, dispatch_uid="ibtikar_audit_post_save")
def audit_post_save(sender, instance, created=False, raw=False, **kwargs):
    if raw or not _is_audited(sender):
        return
    before_data = getattr(instance, "_ibtikar_audit_before", {})
    after_data = _snapshot(instance)
    if not created and before_data == after_data:
        return
    _write_audit(
        instance,
        "CREATE" if created else "UPDATE",
        before_data,
        after_data,
    )


@receiver(pre_delete, dispatch_uid="ibtikar_audit_pre_delete")
def audit_pre_delete(sender, instance, **kwargs):
    if not _is_audited(sender):
        return
    instance._ibtikar_audit_before_delete = _snapshot(instance)


@receiver(post_delete, dispatch_uid="ibtikar_audit_post_delete")
def audit_post_delete(sender, instance, **kwargs):
    if not _is_audited(sender):
        return
    _write_audit(
        instance,
        "DELETE",
        getattr(instance, "_ibtikar_audit_before_delete", {}),
        {},
    )
