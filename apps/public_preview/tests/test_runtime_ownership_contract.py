"""Regression contracts for the frontend ownership consolidation phases."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def test_known_route_assets_are_declared_by_django_not_injected_by_javascript():
    route_styles = read("templates/public_preview/components/route_styles.html")
    runtime_scripts = read("templates/public_preview/components/runtime_scripts.html")
    page_shell = read("static/public_preview/assets/js/page-shell.js")
    approved_source = read("static/public_preview/assets/js/approved-source.js")

    assert "services-experience.css" in route_styles
    assert "ecommerce-experience-lab.css" in route_styles
    assert "services-experience.js" in runtime_scripts
    assert "ecommerce-category.js" in runtime_scripts

    assert "ensureScript" not in page_shell
    assert "createElement('script')" not in page_shell
    assert "services-experience.js" not in approved_source
    assert "ecommerce-category.js" not in approved_source
    assert "strategy-enhancements.js" not in runtime_scripts


def test_deferred_styles_are_server_declared_without_runtime_filename_inference():
    base = read("templates/public_preview/base.html")
    runtime = read("templates/public_preview/components/runtime.html")
    deferred = read("templates/public_preview/components/deferred_styles.html")

    assert 'public_preview/components/deferred_styles.html' in base
    assert "deferredPairs" not in runtime
    assert "createElement('link')" not in runtime
    assert "requestIdleCallback" not in runtime
    assert "launch-readiness-deferred.css" in deferred
    assert "service-cinema-deferred.css" in deferred


def test_generic_disclosure_owner_does_not_claim_shell_details():
    base = read("templates/public_preview/base.html")
    disclosure = read("static/public_preview/assets/js/disclosure.js")
    shell_runtime = read("static/public_preview/assets/js/ibtikar-shell.js")
    primitives = read("static/public_preview/assets/js/service-primitives.js")

    assert base.count("public_preview/assets/js/disclosure.js") == 1
    assert "details.service-faq-item, details.faq-item" in disclosure
    assert ".ibt-shell-mobile-group" not in disclosure
    assert "button.dataset.ibtFaqReady = 'true'" in disclosure
    assert "button.dataset.svcFaqReady = 'true'" in disclosure
    assert "details.dataset.svcReady = 'true'" in disclosure

    # Legacy owners must have a guard that the canonical runtime can satisfy.
    assert "button.dataset.ibtFaqReady === 'true'" in shell_runtime
    assert "faq.dataset.ibtDisclosureReady === 'true'" in primitives


def test_generic_reveal_owner_has_explicit_legacy_route_boundary():
    base = read("templates/public_preview/base.html")
    reveal = read("static/public_preview/assets/js/reveal.js")
    app = read("static/public_preview/assets/js/app.js")
    approved_source = read("static/public_preview/assets/js/approved-source.js")

    assert 'page_key != "index"' in base
    assert 'page_key != "services"' in base
    assert 'page_key != "tharaa"' in base
    assert "window.__ibtikarRevealRuntime" in reveal
    assert "if (window.__ibtikarRevealRuntime) return;" in app
    assert "revealObserver" not in approved_source
