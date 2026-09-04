import os
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

    # Windows exposes only the writable bit through chmod; executable bits are
    # synthesized for directories and regular files keep the platform mask.
    expected_directory_mode = 0o777 if os.name == "nt" else 0o755
    expected_file_mode = 0o666 if os.name == "nt" else 0o644

    assert _mode(hero_root) == expected_directory_mode
    assert _mode(image_path) == expected_file_mode
