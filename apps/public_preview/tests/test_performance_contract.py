BASE_TEMPLATE = "templates/public_preview/base.html"
DOCUMENT_HEAD = "templates/public_preview/components/document_head.html"
ROUTE_FOUNDATION_STYLES = "templates/public_preview/components/route_foundation_styles.html"
INNER_STYLES = "static/public_preview/assets/css/pages/inner.css"
THARAA_TEMPLATE = "templates/public_preview/pages/tharaa.html"


def _read(path):
    with open(path, encoding="utf-8") as source_file:
        return source_file.read()


def test_document_head_warms_shared_render_critical_dependencies():
    source = _read(DOCUMENT_HEAD)

    for asset in (
        "public_preview/assets/css/ibtikar-shell.css",
        "public_preview/foundation/typography-system.css",
        "public_preview/assets/css/components.css",
        "public_preview/assets/css/pages/ux-system-v1.css",
    ):
        assert f"href=\"{{% static '{asset}' %}}\" as=\"style\"" in source

    assert "request.path == '/services/'" in source
    for font in (
        "6010e7fd0dce5d52.woff2",
        "04c730b4292731cc.woff2",
    ):
        assert font in source
    assert "16734a5adb27b0f3.woff2" not in source


def test_route_foundation_css_is_explicit_and_inner_has_no_nested_import_graph():
    base = _read(BASE_TEMPLATE)
    foundation = _read(ROUTE_FOUNDATION_STYLES)
    inner = _read(INNER_STYLES)
    head = _read(DOCUMENT_HEAD)

    assert "@import" not in inner
    assert "category-signatures.css" not in inner
    assert "category-signatures.css" not in head
    assert "platform.css" in foundation
    assert 'data-route-foundation-style="platform"' in foundation
    assert 'include "public_preview/components/route_foundation_styles.html"' in base
    assert base.index("route_foundation_styles.html") < base.index("{% block head %}")


def test_document_head_comments_cannot_leak_as_visible_page_text():
    source = _read(DOCUMENT_HEAD)

    assert "inner.css/articles.css discover" not in source
    assert "remaining foundations through @import" not in source


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
