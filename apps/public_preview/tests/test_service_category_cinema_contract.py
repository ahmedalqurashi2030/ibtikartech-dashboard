CATEGORY_FAMILY = "templates/public_preview/families/service_category_base.html"
CATEGORY_STYLES = "static/public_preview/assets/css/pages/service-category.css"
CINEMA_BOOTSTRAP = "static/public_preview/assets/css/service-cinema.css"
CINEMA_GEOMETRY = "static/public_preview/assets/css/service-cinema-deferred.css"
CINEMA_RUNTIME = "static/public_preview/assets/js/service-cinema.js"
TOKENS = "static/public_preview/assets/css/tokens.css"
HOMEPAGE_SURFACE = (
    "static/public_preview/assets/css/pages/homepage-surface-refinement-v1-deferred.css"
)
VISUAL_WORKFLOW = ".github/workflows/visual-ui-qa.yml"
CATEGORY_QA = "scripts/service_category_cinematic_qa.cjs"


def _read(path: str) -> str:
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def test_phone_uses_cinematic_runtime_while_reduced_motion_remains_static():
    family = _read(CATEGORY_FAMILY)
    styles = _read(CATEGORY_STYLES)
    geometry = _read(CINEMA_GEOMETRY)
    runtime = _read(CINEMA_RUNTIME)

    assert "staticPhoneFlow" not in family
    assert "window.matchMedia('(max-width: 760px)')" not in family
    assert "var isMobile = window.innerWidth <= 760;" in runtime
    assert "activeIndex = mobileIndex;" in runtime
    assert "@media (max-width: 760px) and (prefers-reduced-motion: no-preference)" in geometry
    assert "--service-cinema-step-travel: 38svh" in geometry
    assert "position: sticky;" in geometry
    assert "@media (prefers-reduced-motion: reduce)" in geometry
    assert "@media (max-width: 760px), (prefers-reduced-motion: reduce)" in styles


def test_service_categories_share_the_homepage_cinematic_grammar():
    tokens = _read(TOKENS)
    geometry = _read(CINEMA_GEOMETRY)
    homepage = _read(HOMEPAGE_SURFACE)

    for token in (
        "--ibt-cinema-bg",
        "--ibt-cinema-panel",
        "--ibt-cinema-panel-border",
        "--ibt-cinema-panel-radius",
        "--ibt-cinema-panel-shadow",
        "--ibt-cinema-panel-blur",
        "--ibt-cinema-copy",
        "--ibt-cinema-index",
    ):
        assert token in tokens
        assert f"var({token}" in geometry

    assert "--ibt-cinema-bg: #050817" in tokens
    assert "--ibt-cinema-panel: rgba(5, 10, 27, .76)" in tokens
    assert "--ibt-cinema-panel-border: rgba(255, 255, 255, .11)" in tokens
    assert "--ibt-cinema-panel-radius: 18px" in tokens
    assert "--ibt-cinema-panel-blur: 16px" in tokens
    assert "background: rgba(5, 10, 27, .76) !important" in homepage
    assert "border: 1px solid rgba(255, 255, 255, .11) !important" in homepage
    assert "backdrop-filter: blur(16px) saturate(1.12)" in homepage

    assert "inset-inline-end: 8px !important" in geometry
    assert ".service-cinema__cue" in geometry
    assert "display: flex;" in geometry
    assert "width: 100% !important" in geometry
    assert "border-radius: 0 !important" in geometry


def test_reading_fallback_still_exposes_all_paths_on_demand():
    family = _read(CATEGORY_FAMILY)
    runtime = _read(CINEMA_RUNTIME)

    assert 'section.classList.contains("is-reading")' in runtime
    assert 'section.classList.remove("is-cinematic-ready")' in runtime
    assert "setVisible(card, true)" in runtime
    assert '>عرض جميع المسارات</button>' in family
    assert "reading.textContent" not in runtime


def test_desktop_and_phone_geometry_have_explicit_deferred_owner():
    bootstrap = _read(CINEMA_BOOTSTRAP)
    geometry = _read(CINEMA_GEOMETRY)
    family = _read(CATEGORY_FAMILY)

    assert "service-cinema bootstrap" in bootstrap
    assert ".service-paths-section{position:relative}" in bootstrap
    assert "service-cinema-deferred.css" in bootstrap
    assert "Service Category Cinematic Geometry" in geometry
    assert "--service-cinema-step-travel: 30svh" in geometry
    assert "--service-cinema-step-travel: 38svh" in geometry
    assert family.count("/static/public_preview/assets/css/service-cinema.css") == 1


def test_visual_workflow_runs_category_cinematic_qa():
    workflow = _read(VISUAL_WORKFLOW)
    qa = _read(CATEGORY_QA)

    assert "scripts/service_category_cinematic_qa.cjs" in workflow
    assert "Verify service category cinema on desktop and mobile" in workflow
    assert "mobile cinematic" in qa
    assert "reduced motion" in qa
    assert "inactive card" in qa
