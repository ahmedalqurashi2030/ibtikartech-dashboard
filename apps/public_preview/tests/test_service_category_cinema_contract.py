from pathlib import Path


CATEGORY_FAMILY = Path("templates/public_preview/families/service_category_base.html")
CATEGORY_STYLES = Path("static/public_preview/assets/css/pages/service-category.css")
CINEMA_GEOMETRY = Path("static/public_preview/assets/css/service-cinema.css")
CINEMA_RUNTIME = Path("static/public_preview/assets/js/service-cinema.js")
VISUAL_WORKFLOW = Path(".github/workflows/visual-ui-qa.yml")
CATEGORY_QA = Path("scripts/service_category_cinematic_qa.cjs")


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_phone_static_breakpoint_is_shared_by_css_and_runtime_policy():
    family = _read(CATEGORY_FAMILY)
    styles = _read(CATEGORY_STYLES)

    assert "@media (max-width: 760px), (prefers-reduced-motion: reduce)" in styles
    assert "window.matchMedia('(max-width: 760px)')" in family
    assert "section.dataset.staticPhoneFlow = 'true'" in family
    assert "section.classList.add('is-reading')" in family
    assert "section.classList.remove('is-reading')" in family


def test_phone_static_flow_reuses_the_cinema_reading_fallback():
    runtime = _read(CINEMA_RUNTIME)
    family = _read(CATEGORY_FAMILY)

    assert 'section.classList.contains("is-reading")' in runtime
    assert 'section.classList.remove("is-cinematic-ready")' in runtime
    assert "setVisible(card, true)" in runtime
    assert "window.dispatchEvent(new Event('resize'))" in family


def test_desktop_geometry_has_one_explicit_owner():
    geometry = _read(CINEMA_GEOMETRY)
    family = _read(CATEGORY_FAMILY)

    assert "Service Category Cinematic Geometry" in geometry
    assert "--service-cinema-step-travel: 30svh" in geometry
    assert family.count("/static/public_preview/assets/css/service-cinema.css") == 1


def test_visual_workflow_runs_category_state_qa():
    workflow = _read(VISUAL_WORKFLOW)
    qa = _read(CATEGORY_QA)

    assert "scripts/service_category_cinematic_qa.cjs" in workflow
    assert "Verify service category cinema and static phone flow" in workflow
    assert "mobile static" in qa
    assert "reduced-motion" in qa
    assert "inactive card" in qa
