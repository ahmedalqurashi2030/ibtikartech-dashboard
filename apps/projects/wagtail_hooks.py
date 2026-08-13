from wagtail import hooks
from wagtail.admin.viewsets.base import ViewSetGroup
from wagtail.admin.viewsets.model import ModelViewSet

from .models import Approval, Project, ProjectFile, ProjectStage, ProjectUpdate


class ProjectViewSet(ModelViewSet):
    model = Project
    icon = "folder"
    menu_label = "المشاريع"
    list_display = (
        "project_number",
        "name",
        "contact",
        "status",
        "progress_percentage",
        "manager",
        "target_completion_date",
    )
    list_filter = ("status", "manager", "target_completion_date")
    search_fields = (
        "project_number",
        "name",
        "contact__full_name",
        "contact__email",
        "quote__quote_number",
    )
    search_backend_name = None
    ordering = ("-updated_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "quote",
        "contact",
        "organization",
        "store",
        "name",
        "description",
        "status",
        "progress_percentage",
        "manager",
        "started_at",
        "target_completion_date",
        "completed_at",
    )


class ProjectStageViewSet(ModelViewSet):
    model = ProjectStage
    icon = "list-ul"
    menu_label = "مراحل المشاريع"
    list_display = ("name", "project", "status", "sort_order", "started_at", "completed_at")
    list_filter = ("status", "project")
    search_fields = ("name", "description", "project__project_number", "project__name")
    search_backend_name = None
    ordering = ("project", "sort_order")
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "project",
        "name",
        "description",
        "status",
        "sort_order",
        "started_at",
        "completed_at",
    )


class ProjectUpdateViewSet(ModelViewSet):
    model = ProjectUpdate
    icon = "comment"
    menu_label = "تحديثات المشاريع"
    list_display = ("title", "project", "stage", "visibility", "author", "created_at")
    list_filter = ("visibility", "project", "stage", "author")
    search_fields = ("title", "body", "project__project_number", "project__name")
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = ("project", "stage", "author", "title", "body", "visibility")


class ProjectFileViewSet(ModelViewSet):
    model = ProjectFile
    icon = "doc-full"
    menu_label = "ملفات المشاريع"
    list_display = ("name", "project", "category", "visibility", "uploaded_by", "created_at")
    list_filter = ("category", "visibility", "project", "uploaded_by")
    search_fields = ("name", "file_type", "project__project_number", "project__name")
    search_backend_name = None
    ordering = ("-created_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "project",
        "uploaded_by",
        "file",
        "name",
        "file_type",
        "visibility",
        "category",
    )


class ApprovalViewSet(ModelViewSet):
    model = Approval
    icon = "tick"
    menu_label = "الموافقات"
    list_display = (
        "title",
        "project",
        "requested_from_contact",
        "status",
        "requested_at",
        "responded_at",
    )
    list_filter = ("status", "project", "requested_by")
    search_fields = (
        "title",
        "description",
        "response_note",
        "project__project_number",
        "requested_from_contact__full_name",
    )
    search_backend_name = None
    ordering = ("-requested_at",)
    copy_view_enabled = False
    inspect_view_enabled = True
    form_fields = (
        "project",
        "title",
        "description",
        "requested_by",
        "requested_from_contact",
        "status",
        "responded_at",
        "response_note",
    )


class ProjectsViewSetGroup(ViewSetGroup):
    menu_label = "تنفيذ المشاريع"
    menu_icon = "folder"
    menu_order = 300
    items = (
        ProjectViewSet,
        ProjectStageViewSet,
        ProjectUpdateViewSet,
        ProjectFileViewSet,
        ApprovalViewSet,
    )


@hooks.register("register_admin_viewset")
def register_project_viewsets():
    return ProjectsViewSetGroup()
