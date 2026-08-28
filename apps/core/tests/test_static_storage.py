import stat

from apps.core.storage import PublicStaticFilesStorage


def _mode(path):
    return stat.S_IMODE(path.stat().st_mode)


def test_public_static_storage_repairs_existing_hero_permissions(tmp_path):
    hero_root = (
        tmp_path / "public_preview" / "assets" / "images" / "hero"
    )
    hero_root.mkdir(parents=True)
    hero_root.chmod(0o700)

    image_path = hero_root / "hero.webp"
    image_path.write_bytes(b"RIFFtestWEBP")
    image_path.chmod(0o600)

    storage = PublicStaticFilesStorage(location=tmp_path)
    storage.ensure_public_image_permissions()

    assert _mode(hero_root) == 0o755
    assert _mode(image_path) == 0o644
