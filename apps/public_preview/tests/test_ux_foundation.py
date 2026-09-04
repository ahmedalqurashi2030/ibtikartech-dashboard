BASE_TEMPLATE = "templates/public_preview/base.html"
DOCUMENT_HEAD = "templates/public_preview/components/document_head.html"
SERVICES_TEMPLATE = "templates/public_preview/pages/services.html"
THARAA_TEMPLATE = "templates/public_preview/pages/tharaa.html"
TYPOGRAPHY_SYSTEM = "static/public_preview/foundation/typography-system.css"
SHELL_STYLES = "static/public_preview/assets/css/ibtikar-shell.css"
SHELL_RUNTIME = "static/public_preview/assets/js/ibtikar-shell.js"
UX_SYSTEM = "static/public_preview/assets/css/pages/ux-system-v1.css"
RELATED_RUNTIME = "static/public_preview/assets/js/service-related-cards.js"
SERVICE_PRIMITIVES_STYLES = "static/public_preview/assets/css/service-primitives.css"
SERVICE_PRIMITIVES_RUNTIME = "static/public_preview/assets/js/service-primitives.js"
SERVICE_DETAIL_FAMILY = "templates/public_preview/families/service_detail_base.html"
STORE_LAUNCH_TEMPLATE = "templates/public_preview/pages/store-launch.html"
STOREFRONT_TEMPLATE = "templates/public_preview/pages/storefront-customization.html"
PRODUCT_PAGE_TEMPLATE = "templates/public_preview/pages/product-page-optimization.html"
PRODUCT_PAGE_RUNTIME = "static/public_preview/assets/js/source-product-page.js"
PRODUCT_PAGE_A11Y = "static/public_preview/assets/css/pages/product-page-accessibility.css"
SERVICES_RUNTIME = "static/public_preview/assets/js/source-services.js"
SERVICES_EXPERIENCE = "static/public_preview/assets/js/services-experience.js"
THARAA_RUNTIME = "static/public_preview/assets/js/source-tharaa.js"
HOME_SOURCE_RUNTIME = "static/public_preview/assets/js/source-home.js"
INTERACTION_QA = "scripts/interaction_qa_clean_urls.cjs"
BROWSER_QA = "scripts/browser_qa_clean_urls.cjs"


def _read_source(path):
    with open(path, encoding="utf-8") as source_file:
        return source_file.read()


def _read_bytes(path):
    with open(path, "rb") as source_file:
        return source_file.read()


def _block_payload(source, block_name):
    from apps.public_preview.template_contract import block_tag

    opener = block_tag(block_name)
    start = source.find(opener)
    if start < 0:
        return None
    body_start = start + len(opener)
    end = source.find("{% endblock %}", body_start)
    if end < 0:
        raise AssertionError(f"Unclosed template block: {block_name}")
    return source[body_start:end]


def _effective_family_asset_count(page_source, family_source, parent, asset):
    from pathlib import Path

    from apps.public_preview.asset_contract import FAMILY_ASSET_EXTENSION_BLOCKS

    block_name = FAMILY_ASSET_EXTENSION_BLOCKS.get(parent, {}).get(
        Path(asset).suffix
    )
    if block_name:
        override = _block_payload(page_source, block_name)
        if override is not None:
            return override.count(asset)
        return family_source.count(asset)
    return page_source.count(asset) + family_source.count(asset)


def test_public_base_loads_one_stable_typography_system():
    source = _read_source(BASE_TEMPLATE)

    assert source.count("typography-system.css") == 1
    assert "public_preview/foundation/typography-system.css" in source
    assert "public_preview/assets/css/pages/typography-system.css" not in source
    assert "public_preview/dashboard/typography-system.css" not in source
    assert "typography-scale-refinement-v1.css" not in source
    assert "typography-scale-refinement-v2.css" not in source


def test_canonical_typography_system_keeps_required_responsive_roles():
    source = _read_source(TYPOGRAPHY_SYSTEM)

    required_roles = (
        "--ibt-type-hero",
        "--ibt-type-section",
        "--ibt-type-section-compact",
        "--ibt-type-card",
        "--ibt-type-lead",
        "--ibt-type-copy",
    )
    for role in required_roles:
        assert role in source

    assert "@media (max-width: 1024px)" in source
    assert "@media (max-width: 820px)" in source
    assert "@media (max-width: 560px)" in source
    assert "@media (max-width: 520px)" in source


def test_public_shell_has_one_canonical_approved_cascade():
    source = _read_source(SHELL_STYLES)

    assert "P0 shell consolidation" in source
    assert "V11 refined combined solutions/services header" not in source
    assert "APPROVED VISUAL RECOVERY" not in source
    assert "\n  top: 12px;" not in source
    assert "@media (max-width: 1180px)" in source
    assert 'html[data-theme="dark"] .ibt-shell-mega' in source
    assert ".ibt-shell-menu-toggle::before" in source
    assert "radial-gradient(circle at 5px 5px" in source
    assert "body.source-home #home.hero" in source
    assert "body.source-home .cinematic-story__brand" in source
    assert "@media (prefers-reduced-motion: reduce)" in source


def test_ux_system_does_not_override_launch_typography_tokens():
    source = _read_source(UX_SYSTEM)

    assert "--ibt-ux-section:" not in source
    assert "--ibt-ux-section-mobile:" not in source


def test_document_head_restores_theme_without_legacy_shell_mutation():
    head_source = _read_source(DOCUMENT_HEAD)
    home_runtime = _read_source(HOME_SOURCE_RUNTIME)

    assert "classList.remove('no-js')" in head_source
    assert "classList.add('js-ready')" in head_source
    assert "localStorage.getItem('ibtikar-theme')" in head_source
    assert "[data-approved-legacy-shell], .ibtx-legacy-mobile-menu" not in head_source
    assert "MutationObserver" not in head_source
    assert "localStorage.getItem('ibtikar-theme')" not in home_runtime


def test_route_scoped_assets_are_opted_in_once_by_approved_consumers():
    from pathlib import Path

    from apps.public_preview.asset_contract import ROUTE_SCOPED_ASSET_CONSUMERS
    from apps.public_preview.template_contract import (
        BASE_TEMPLATE_PARENT,
        FAMILY_REQUIRED_BLOCKS,
        page_parent,
    )

    base_source = _read_source(BASE_TEMPLATE)
    pages = sorted(Path("templates/public_preview/pages").glob("*.html"))
    family_sources = {
        parent: _read_source(str(Path("templates") / parent))
        for parent in FAMILY_REQUIRED_BLOCKS
    }

    for asset, expected_consumers in ROUTE_SCOPED_ASSET_CONSUMERS.items():
        assert asset not in base_source, asset
        actual_consumers = set()

        for page in pages:
            page_source = _read_source(str(page))
            parent = page_parent(page.name)
            if parent == BASE_TEMPLATE_PARENT:
                effective_count = page_source.count(asset)
            else:
                effective_count = _effective_family_asset_count(
                    page_source,
                    family_sources[parent],
                    parent,
                    asset,
                )

            assert effective_count in (0, 1), (page.name, asset, effective_count)
            if effective_count == 1:
                actual_consumers.add(page.name)

        assert actual_consumers == set(expected_consumers), asset



def test_conversion_events_are_bound_to_actions_and_success():
    contact = _read_source("templates/public_preview/pages/contact.html")
    home = _read_source("templates/public_preview/pages/index.html")
    services = _read_source("templates/public_preview/pages/services.html")
    tharaa = _read_source("templates/public_preview/pages/tharaa.html")
    app_runtime = _read_source("static/public_preview/assets/js/app.js")
    analytics_runtime = _read_source(
        "static/public_preview/assets/js/modules/analytics.js"
    )

    assert 'data-analytics="inquiry_submitted"' not in contact
    assert contact.count('data-success-event="inquiry_submitted"') == 1
    assert contact.count('data-analytics="quote_request"') == 0
    assert home.count('data-analytics="quote_request"') == 6
    assert services.count('data-analytics="quote_request"') == 2
    assert tharaa.count('data-analytics="quote_request"') == 2

    assert "form.dataset.successEvent" in app_runtime
    assert "form.dataset.analytics ||" not in app_runtime
    assert "if (submitting) return;" in app_runtime
    assert "form.setAttribute('aria-busy', 'true')" in app_runtime
    assert "applyServerErrors(error.fieldErrors)" in app_runtime
    assert "ibtikar:focus-field" in app_runtime

    actionable_selector = (
        "\"a[data-analytics], button[data-analytics], "
        "[role='button'][data-analytics]\""
    )
    assert actionable_selector in analytics_runtime
    assert 'closest("[data-analytics]")' not in analytics_runtime


def test_service_categories_track_hero_and_final_quote_actions():
    category_templates = (
        "websites.html",
        "ecommerce.html",
        "brand-content.html",
        "growth.html",
        "custom-systems.html",
    )

    for template_name in category_templates:
        source = _read_source(f"templates/public_preview/pages/{template_name}")
        assert source.count('data-analytics="quote_request"') >= 2, template_name
        assert "source=" in source, template_name


def test_related_services_runtime_keeps_one_guarded_behavior_owner():
    shell_source = _read_source(SHELL_RUNTIME)
    related_source = _read_source(RELATED_RUNTIME)

    assert "relatedTracks" not in shell_source
    assert "ibt-related-track" not in shell_source
    assert "Product-like related-service sliders" not in shell_source

    assert "const relatedSelectors" in related_source
    assert "document.querySelector(relatedSelectors)" in related_source
    assert "categoryPages" not in related_source
    assert "body.dataset.page" not in related_source


def test_service_primitives_keep_one_accessible_behavior_owner():
    family_source = _read_source(SERVICE_DETAIL_FAMILY)
    primitive_source = _read_source(SERVICE_PRIMITIVES_RUNTIME)
    commerce_source = _read_source(
        "static/public_preview/assets/js/commerce-service-detail.js"
    )
    primitive_styles = _read_source(SERVICE_PRIMITIVES_STYLES)

    assert family_source.count("service-primitives.css") == 1
    assert family_source.count("service-primitives.js") == 1
    assert "data-service-decision-tab" not in primitive_source
    assert "data-service-decision-tab" in commerce_source
    assert "prefers-reduced-motion: reduce" in primitive_styles
    assert "toggleAttribute('inert', !visible)" in primitive_source
    assert "aria-current" in primitive_source


def test_migrated_service_hotspots_are_named_and_control_content():
    for template_path in (STORE_LAUNCH_TEMPLATE, STOREFRONT_TEMPLATE):
        source = _read_source(template_path)
        hotspot_lines = [
            line
            for line in source.splitlines()
            if 'class="service-hotspot"' in line
        ]
        info_lines = [
            line
            for line in source.splitlines()
            if 'class="service-hotspot-info"' in line
        ]

        assert hotspot_lines
        assert len(hotspot_lines) == len(info_lines)
        assert all('type="button"' in line for line in hotspot_lines)
        assert all('aria-controls="' in line for line in hotspot_lines)
        assert all(' id="' in line and ' hidden' in line for line in info_lines)


def test_store_launch_inherits_service_family_assets():
    source = _read_source(STORE_LAUNCH_TEMPLATE)

    assert _block_payload(source, "service_styles") is None


def test_product_page_interactions_preserve_accessible_state():
    source = _read_source(PRODUCT_PAGE_TEMPLATE)
    runtime = _read_source(PRODUCT_PAGE_RUNTIME)
    styles = _read_source(PRODUCT_PAGE_A11Y)

    assert source.count("tokens.css") == 1
    assert source.count('id="product-hotspot-info"') == 1
    assert source.count('class="hotspot"') == 4
    assert source.count('type="button" class="hotspot"') == 4
    assert 'aria-labelledby="product-hotspot-title"' in source
    assert 'class="sticky-service-cta" aria-hidden="true" inert' in source
    assert "innerHTML" not in runtime
    assert "textContent" in runtime
    assert "toggleAttribute('inert', !shouldShow)" in runtime
    assert "product-sticky-cta-visible" in runtime
    assert "min-width: 44px" in styles
    assert "prefers-reduced-motion: reduce" in styles


def test_services_animation_vendors_are_deferred_in_dependency_order():
    source = _read_source(SERVICES_TEMPLATE)
    gsap = '<script src="/static/public_preview/assets/vendor/gsap.min.js" defer></script>'
    scroll_trigger = (
        '<script src="/static/public_preview/assets/vendor/ScrollTrigger.min.js" defer></script>'
    )

    assert source.count(gsap) == 1
    assert source.count(scroll_trigger) == 1
    assert source.find(gsap) < source.find(scroll_trigger)
    assert '<script src="/static/public_preview/assets/vendor/gsap.min.js"></script>' not in source
    assert (
        '<script src="/static/public_preview/assets/vendor/ScrollTrigger.min.js"></script>'
        not in source
    )


def test_services_page_has_no_retired_shell_or_runtime_hooks():
    template_source = _read_source(SERVICES_TEMPLATE)
    runtime_source = _read_source(SERVICES_RUNTIME)

    assert "data-approved-legacy-shell" not in template_source
    assert '<header class="header" id="header">' not in template_source
    assert 'id="menuBtn"' not in template_source
    assert 'id="mobileMenu"' not in template_source
    assert '<a class="skip" href="#main">' not in template_source
    assert '<footer data-approved-legacy-shell' not in template_source

    assert "getElementById('header')" not in runtime_source
    assert "getElementById('menuBtn')" not in runtime_source
    assert "getElementById('mobileMenu')" not in runtime_source
    assert "lastY" not in runtime_source
    assert "getElementById('progressBar')" in runtime_source


def test_tharaa_page_has_no_retired_shell_or_runtime_hooks():
    template_source = _read_source(THARAA_TEMPLATE)
    runtime_source = _read_source(THARAA_RUNTIME)

    for marker in (
        "data-approved-legacy-shell",
        'id="siteHeader"',
        'id="menuBtn"',
        'id="mobileMenu"',
        'id="themeToggle"',
        '<a class="skip" href="#main">',
        '<footer data-approved-legacy-shell',
    ):
        assert marker not in template_source

    assert '<div class="progress"><span id="pageProgress"></span></div>' in template_source
    assert 'class="sticky-cta"' in template_source
    assert 'id="previewModal"' in template_source
    assert 'id="heroCanvas"' in template_source

    for marker in (
        "q('#siteHeader')",
        "q('#menuBtn')",
        "q('#mobileMenu')",
        "q('#themeToggle')",
        "mobileMenu.classList",
        "menuBtn.setAttribute",
        "header.classList.toggle",
        "classList.remove('menu-open')",
    ):
        assert marker not in runtime_source

    assert "q('#pageProgress')" in runtime_source
    assert "updateProgress" in runtime_source
    assert "q('#previewModal')" in runtime_source
    assert "q('#heroCanvas')" in runtime_source
    assert "qa('#studioSwatches button')" in runtime_source
    assert "q('.faq-answer',item)" in runtime_source
    assert "q('#libraryTrack')" in runtime_source


def test_public_hero_images_are_shared_files_not_inline_base64():
    groups = (
        (
            "static/public_preview/assets/images/hero/ibtikar-services-ecosystem-v1.jpg",
            "/static/public_preview/assets/images/hero/ibtikar-services-ecosystem-v1.jpg",
            (
                "templates/public_preview/pages/growth.html",
                "templates/public_preview/pages/custom-systems.html",
                "templates/public_preview/pages/services.html",
            ),
            "jpeg",
        ),
        (
            "static/public_preview/assets/images/hero/ibtikar-ecommerce-journey-v1.jpg",
            "/static/public_preview/assets/images/hero/ibtikar-ecommerce-journey-v1.jpg",
            (
                "templates/public_preview/pages/ecommerce-growth.html",
                "templates/public_preview/pages/storefront-customization.html",
                "templates/public_preview/pages/ecommerce.html",
                "templates/public_preview/pages/ecommerce-support.html",
                "templates/public_preview/pages/product-page-optimization.html",
                "templates/public_preview/pages/store-launch.html",
                "templates/public_preview/pages/store-redesign.html",
            ),
            "jpeg",
        ),
        (
            "static/public_preview/assets/images/hero/ibtikar-connected-ecosystem-v1.webp",
            "/static/public_preview/assets/images/hero/ibtikar-connected-ecosystem-v1.webp",
            ("templates/public_preview/pages/index.html",),
            "webp",
        ),
    )

    template_count = 0
    for asset_path, public_path, template_paths, image_type in groups:
        asset = _read_bytes(asset_path)
        assert asset
        if image_type == "jpeg":
            assert asset.startswith(b"\xff\xd8")
        else:
            assert asset.startswith(b"RIFF")
            assert asset[8:12] == b"WEBP"

        for template_path in template_paths:
            source = _read_source(template_path)
            assert ";base64," not in source
            assert source.count(public_path) == 1
            template_count += 1

    assert template_count == 11


def test_services_runtime_uses_dom_count_and_guards_optional_canvas():
    source = _read_source(SERVICES_RUNTIME)

    assert "String(items.length).padStart(2, '0')" in source
    assert "!canvas || typeof canvas.getContext !== 'function'" in source
    assert " / 06" not in source


def test_services_experience_matches_current_five_family_taxonomy():
    source = _read_source(SERVICES_EXPERIENCE)

    expected_order = (
        "mode:'store', index:'01'",
        "mode:'site', index:'02'",
        "mode:'brand', index:'03'",
        "mode:'growth', index:'04'",
        "mode:'app', index:'05'",
    )
    positions = [source.find(marker) for marker in expected_order]
    assert all(position >= 0 for position in positions)
    assert positions == sorted(positions)
    assert "PRIMARY_FAMILIES.length" in source
    assert "custom-systems.html#apps" in source
    assert "custom-systems.html#automation" in source
    assert "ستة محاور" not in source
    assert "mode:'auto', index:'06'" not in source


def test_browser_qa_validates_semantic_services_count_not_legacy_six():
    source = _read_source(BROWSER_QA)

    assert "servicesStageText" in source
    assert "String(metrics.servicesStageText || '').split('/')" in source
    assert "metrics.servicesAxes < 5" in source
    assert "stageTotal !== metrics.servicesAxes" in source
    assert "metrics.servicesAxes !== 6" not in source


def test_deep_interaction_qa_uses_live_contact_submission_contract():
    source = _read_source(INTERACTION_QA)

    assert "live local-test submission + reference" in source
    assert "وصل طلبك إلى الفريق" in source
    assert "رقم المرجع:" in source
    assert "ibtikar:lastBrief" not in source
    assert "Contact local draft failed" not in source



def test_all_public_pages_use_one_shared_shell_and_valid_navigation_contract():
    import re
    from collections import Counter
    from pathlib import Path

    from apps.public_preview.template_contract import (
        BASE_TEMPLATE_PARENT,
        FAMILY_REQUIRED_BLOCKS,
        extends_tag,
        page_parent,
    )

    pages = sorted(Path("templates/public_preview/pages").glob("*.html"))
    assert len(pages) == 22
    family_sources = {
        parent: _read_source(str(Path("templates") / parent))
        for parent in FAMILY_REQUIRED_BLOCKS
    }
    legacy_markers = (
        "data-approved-legacy-shell",
        'id="site-header"',
        "ibtx-legacy-mobile-menu",
        'class="mobile-menu',
        '<a class="skip-link"',
        '<a class="skip"',
        'class="site-footer',
        'class="ibtx-footer"',
    )
    html_ref = re.compile(r'\b(?:href|action)=["\']([^"\']+\.html(?:[?#][^"\']*)?)["\']', re.I)
    id_ref = re.compile(r'\bid=["\']([^"\']+)["\']')
    anchor_ref = re.compile(r'\bhref=["\']#([^"\']+)["\']')

    for page in pages:
        page_source = _read_source(str(page))
        parent = page_parent(page.name)
        assert extends_tag(parent) in page_source, page.name

        source = page_source
        if parent != BASE_TEMPLATE_PARENT:
            source = family_sources[parent] + "\n" + page_source

        assert source.count('id="main-content"') == 1, page.name
        assert 'id="main"' not in source, page.name
        for legacy in legacy_markers:
            assert legacy not in source, f"{page.name}: {legacy}"
        assert not html_ref.findall(source), page.name
        ids = id_ref.findall(source)
        counts = Counter(ids)
        assert not [key for key, value in counts.items() if value > 1], page.name
        missing = {
            anchor
            for anchor in anchor_ref.findall(source)
            if anchor and anchor not in counts
        }
        assert not missing, f"{page.name}: {sorted(missing)}"

def test_shared_shell_owns_theme_rtl_focus_and_reduced_motion_contract():
    header = _read_source("templates/public_preview/components/header.html")
    mobile_menu = _read_source("templates/public_preview/components/mobile_menu.html")
    head = _read_source("templates/public_preview/components/document_head.html")
    shell = _read_source(SHELL_RUNTIME)
    styles = _read_source(SHELL_STYLES)
    browser_workflow = _read_source(".github/workflows/django-clean-url-browser-qa.yml")
    browser_qa = _read_source(BROWSER_QA)
    interaction_qa = _read_source(INTERACTION_QA)
    home_runtime = _read_source(HOME_SOURCE_RUNTIME)
    page_shell = _read_source("static/public_preview/assets/js/page-shell.js")

    assert header.count("data-ibt-theme-toggle") == 1
    assert "data-ibt-theme-icon" in header
    assert "localStorage.getItem('ibtikar-theme')" in head
    assert "syncThemeControls" in shell
    assert "localStorage.setItem('ibtikar-theme',next)" in shell
    assert ":focus-visible" in styles
    assert "@media (prefers-reduced-motion: reduce)" in styles
    assert header.count("data-ibt-mega-menu") == 2
    assert header.count("aria-hidden=\"true\" inert data-ibt-mega-menu") == 2
    assert "link.setAttribute('aria-haspopup'" not in shell
    assert "'ArrowUp'" in shell
    assert "focusMegaItem(toggle,event.key === 'ArrowUp' ? 'last' : 'first')" in shell
    assert 'aria-hidden="true" inert' in mobile_menu
    assert mobile_menu.count("data-ibt-menu-close") == 1
    assert "document.createElement('div')" in shell
    assert "ibt-mobile-backdrop" in styles
    assert ".ibt-mobile-menu-close" in styles
    assert ".ibt-shell-mobile-menu summary:focus-visible" in styles

    assert "runs-on: [self-hosted, production, ibtikartech]" in browser_workflow
    assert "browser-actions/setup-chrome@v2" in browser_workflow
    assert "no-sudo: true" in browser_workflow
    assert "install-dependencies: true" not in browser_workflow
    assert "themeToggleVisible" in browser_qa
    assert "mainContentCount" in browser_qa
    assert "legacyShellCount" in browser_qa
    assert "points to missing #" in browser_qa
    assert "testThemeRtlAndReducedMotion" in interaction_qa
    assert "prefers-reduced-motion" in interaction_qa

    for marker in (
        "getElementById('site-header')",
        "querySelector('.menu-toggle')",
        "querySelector('.mobile-menu')",
        "querySelector('.theme-toggle')",
        "querySelectorAll('.desktop-nav a')",
        "querySelectorAll('.mobile-menu a')",
        "const closeMenu =",
        "header?.classList.add('cinematic-hidden')",
        "header?.classList.remove('cinematic-hidden')",
    ):
        assert marker not in home_runtime

    assert "normalizeHomepageLegacyShell" not in page_shell
    assert "[data-approved-legacy-shell], .ibtx-legacy-mobile-menu" not in head



def test_public_shell_reads_only_resolved_site_configuration():
    header = _read_source("templates/public_preview/components/header.html")
    footer = _read_source("templates/public_preview/components/footer.html")
    runtime = _read_source("templates/public_preview/components/runtime.html")
    static_config = _read_source("static/public_preview/assets/js/site-config.js")

    assert "{{ site_config.brand.name }}" in header
    assert "{{ site_config.brand.name }}" in footer
    assert "site_config.contact.whatsapp_url" in footer
    assert "site_config.social_links" in footer
    assert 'json_script:"ibtikar-runtime-config"' in runtime
    assert "window.IBTIKAR_CONFIG = window.IBTIKAR_CONFIG ||" in static_config


def test_service_category_mobile_and_reduced_motion_keep_all_paths_sequential():
    category_styles = _read_source(
        "static/public_preview/assets/css/pages/service-category.css"
    )
    ecommerce_styles = _read_source(
        "static/public_preview/assets/css/pages/ecommerce-category.css"
    )
    cinema_runtime = _read_source("static/public_preview/assets/js/service-cinema.js")

    assert "min-height: 44px" in category_styles
    assert "font-size: var(--ibt-text-xs, 12px)" in category_styles
    assert 'matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)")' in cinema_runtime
    assert "if (media.matches) return;" in cinema_runtime
    assert "scroll-snap-type: x mandatory" not in category_styles
    assert "scroll-snap-type:x mandatory" not in ecommerce_styles
    assert ".commerce-category-nav a{flex:none;min-height:44px" in ecommerce_styles


def test_category_decision_faqs_and_related_routes_are_complete():
    category_templates = (
        "templates/public_preview/pages/websites.html",
        "templates/public_preview/pages/brand-content.html",
        "templates/public_preview/pages/growth.html",
        "templates/public_preview/pages/custom-systems.html",
    )

    for template in category_templates:
        source = _read_source(template)
        assert 'href="#faq"' in source, template
        assert 'id="faq"' in source, template
        assert source.count("<details class=\"service-category-faq__item reveal\">") >= 4
        assert 'id="related"' in source, template

    ecommerce = _read_source("templates/public_preview/pages/ecommerce.html")
    assert 'href="#related"' in ecommerce
    assert 'id="related"' in ecommerce
    assert "service-related-cards.css" in ecommerce
    assert "service-related-cards.js" in ecommerce


def test_services_page_uses_semantic_icons_and_connected_faq_controls():
    template = _read_source(SERVICES_TEMPLATE)
    runtime = _read_source(SERVICES_RUNTIME)

    assert template.count('<div class="goal-icon" aria-hidden="true"><svg') == 4
    for glyph in (">↗<", ">◎<", ">⌁<", ">⚙<"):
        assert glyph not in template
    assert template.count('type="button" aria-expanded="false" aria-controls="services-faq-') == 5
    assert template.count('class="faq-answer" id="services-faq-') == 5
    assert "candidateAnswer.hidden = true" in runtime
    assert "answer.hidden = !open" in runtime
    assert "requestAnimationFrame(() =>" in runtime
    assert "canvasObserver.observe(canvas)" in runtime


def test_service_style_overrides_preserve_the_shared_shell_and_hero_roles():
    ecommerce = _read_source("templates/public_preview/pages/ecommerce.html")
    product = _read_source(PRODUCT_PAGE_TEMPLATE)
    typography = _read_source(TYPOGRAPHY_SYSTEM)

    for source in (ecommerce, product):
        assert source.count("pages/inner.css") == 1
        assert source.count("css/ibtikar-shell.css") == 1

    assert typography.count(".svc-hero-copy,") >= 2


def test_shared_mobile_controls_keep_minimum_touch_targets():
    shell = _read_source(SHELL_STYLES)
    related = _read_source(
        "static/public_preview/assets/css/pages/service-related-cards.css"
    )

    assert shell.count("min-height: 44px;") >= 2
    assert "width: 38px;\n    height: 38px;\n    min-height: 38px;" not in shell
    assert related.count("width: 44px;") >= 2
    assert "width: 40px;\n    height: 40px;" not in related


def test_platform_pilots_share_accessible_touch_and_preview_contracts():
    base = _read_source(BASE_TEMPLATE)
    tokens = _read_source("static/public_preview/assets/css/tokens.css")
    shell = _read_source(SHELL_STYLES)
    layout = _read_source(
        "static/public_preview/assets/css/pages/section-layout-refinement-v2.css"
    )
    tharaa_runtime = _read_source(THARAA_RUNTIME)
    home = _read_source("templates/public_preview/pages/index.html")
    page_shell = _read_source("static/public_preview/assets/js/page-shell.js")
    home_runtime = _read_source("static/public_preview/assets/js/home-enhancements.js")
    strategy_runtime = _read_source(
        "static/public_preview/assets/js/strategy-enhancements.js"
    )

    assert "page_refinements" in base
    assert "ux-system-v1.css" in base
    assert "service-category-refinement-v1.css" in base
    assert "strategy-enhancements.css" in base
    assert "--ibt-target-min: 44px" in tokens
    assert "min-height: var(--ibt-target-min);" in shell
    assert "width: 40px !important;\n    height: 40px !important;" not in layout
    assert 'class="ibtx-store-demo-action" aria-hidden="true"' in home
    assert "studioSwatchLabels" in tharaa_runtime
    assert "tab.setAttribute('role','tab')" in tharaa_runtime
    assert "tab.setAttribute('aria-controls','v4StudioScreen')" in tharaa_runtime
    assert "['ArrowRight','ArrowLeft','Home','End']" in tharaa_runtime
    assert "ensureStylesheet" not in page_shell
    assert "function ensureCss()" not in home_runtime
    assert "function ensureCss()" not in strategy_runtime
