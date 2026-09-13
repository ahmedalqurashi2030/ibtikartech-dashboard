CATEGORY_FAMILY = "templates/public_preview/families/service_category_base.html"
CATEGORY_STYLES = "static/public_preview/assets/css/pages/service-category.css"
CINEMA_GEOMETRY = "static/public_preview/assets/css/service-cinema.css"
CINEMA_RUNTIME = "static/public_preview/assets/js/service-cinema.js"
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
    assert "var isMobile = window.innerWidth < 1000;" in runtime
    assert "@media (max-width: 760px) and (prefers-reduced-motion: no-preference)" in geometry
    assert "--service-cinema-step-travel: 38svh" in geometry
    assert "position: sticky;" in geometry
    assert "@media (prefers-reduced-motion: reduce)" in geometry
    assert "@media (max-width: 760px), (prefers-reduced-motion: reduce)" in styles


def test_reading_fallback_still_exposes_all_paths_on_demand():
    runtime = _read(CINEMA_RUNTIME)

    assert 'section.classList.contains("is-reading")' in runtime
    assert 'section.classList.remove("is-cinematic-ready")' in runtime
    assert "setVisible(card, true)" in runtime
    assert 'reading.textContent = "عرض جميع المسارات"' in runtime


def test_desktop_and_phone_geometry_have_explicit_travel_owners():
    geometry = _read(CINEMA_GEOMETRY)
    family = _read(CATEGORY_FAMILY)

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
