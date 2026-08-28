from pathlib import Path

from django.contrib.staticfiles.storage import ManifestStaticFilesStorage


class PublicStaticFilesStorage(ManifestStaticFilesStorage):
    """Collect public static files with web-server-readable permissions."""

    hero_asset_path = Path("public_preview/assets/images/hero")
    file_mode = 0o644
    directory_mode = 0o755

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("file_permissions_mode", self.file_mode)
        kwargs.setdefault("directory_permissions_mode", self.directory_mode)
        super().__init__(*args, **kwargs)

    def post_process(self, paths, **options):
        yield from super().post_process(paths, **options)
        if not options.get("dry_run"):
            self.ensure_public_image_permissions()

    def ensure_public_image_permissions(self):
        """Repair existing hero files that collectstatic leaves unmodified."""

        hero_root = Path(self.location) / self.hero_asset_path
        if not hero_root.exists():
            return

        hero_root.chmod(self.directory_mode)
        for path in hero_root.rglob("*"):
            if path.is_symlink():
                continue
            path.chmod(self.directory_mode if path.is_dir() else self.file_mode)
