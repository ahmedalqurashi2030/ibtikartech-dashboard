def _read(relative_path):
    with open(relative_path, encoding="utf-8") as source_file:
        return source_file.read()


def test_home_solutions_services_cinema_is_server_rendered_and_has_five_scenes():
    template = _read("templates/public_preview/pages/index.html")

    assert 'aria-label="الحلول والخدمات الرقمية في ابتكار تك"' in template
    assert 'class="services-cinema" id="services"' in template
    assert "SOLUTIONS &amp; SERVICES / 01—05" in template
    assert template.count('class="service-scene-copy"') == 5
    assert 'id="servicesCanvas"' in template
    assert 'id="servicesProgress"' in template


def test_home_solutions_services_keeps_one_cinematic_stage_on_mobile():
    styles = _read("static/public_preview/assets/css/pages/source-home.css")
    runtime = _read("static/public_preview/assets/js/home-experience-v2.js")

    assert ".services-cinema{height:520svh;min-height:3600px" in styles
    assert ".services-cinema__stage{display:block;position:sticky;top:0;height:100svh" in styles
    assert ".services-mobile-deck{display:none}" in styles
    assert ".services-cinema__stage{display:none}.services-mobile-deck{display:block}" not in styles
    assert "enhanceServicesSlider();" not in runtime


def test_home_solutions_services_reduced_motion_stays_scoped_and_readable():
    styles = _read("static/public_preview/assets/css/pages/source-home.css")

    assert "html.no-immersive-motion .services-cinema__stage{display:block" in styles
    assert "html.no-immersive-motion .services-mobile-deck{display:none}" in styles
    assert "@media(prefers-reduced-motion:reduce)" in styles
    assert ".services-cinema{height:100svh;min-height:680px" in styles
    assert ".services-cinema__stage{display:block;position:relative;height:100svh" in styles


def test_home_solutions_services_mobile_rules_do_not_use_generic_section_selectors():
    styles = _read("static/public_preview/assets/css/pages/source-home.css")
    mobile_start = styles.index("@media(max-width:820px){")
    mobile_end = styles.index("@media(max-width:520px){", mobile_start)
    mobile_rules = styles[mobile_start:mobile_end]

    assert ".services-cinema" in mobile_rules
    assert " section{" not in mobile_rules
    assert " main{" not in mobile_rules
    assert " body{" not in mobile_rules
