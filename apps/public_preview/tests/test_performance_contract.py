from pathlib import Path


DOCUMENT_HEAD = Path("templates/public_preview/components/document_head.html")
THARAA_TEMPLATE = Path("templates/public_preview/pages/tharaa.html")


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_document_head_warms_shared_render_critical_dependencies():
    source = _read(DOCUMENT_HEAD)

    for asset in (
        "public_preview/assets/css/ibtikar-shell.css",
        "public_preview/foundation/typography-system.css",
        "public_preview/assets/css/pages/ux-system-v1.css",
    ):
        assert f"href=\"{{% static '{asset}' %}}\" as=\"style\"" in source

    assert "request.path == '/services/'" in source
    assert "16734a5adb27b0f3.woff2" in source


def test_tharaa_parser_does_not_block_on_cinematic_runtimes():
    source = _read(THARAA_TEMPLATE)

    deferred_scripts = (
        "/static/public_preview/assets/vendor/gsap.min.js",
        "/static/public_preview/assets/vendor/ScrollTrigger.min.js",
        "/static/public_preview/assets/js/page-shell.js",
        "/static/public_preview/assets/js/ibtikar-shell.js",
    )
    for script in deferred_scripts:
        assert f'src="{script}" defer' in source
        assert f'src="{script}"></script>' not in source

    assert source.index("gsap.min.js") < source.index("ScrollTrigger.min.js")
