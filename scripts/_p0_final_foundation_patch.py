from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


# 1) Homepage: physically remove shell copies already proven retired by the audit.
index_path = "templates/public_preview/pages/index.html"
index = read(index_path)
assert index.count("data-approved-legacy-shell") == 3
assert index.count('id="site-header"') == 1
assert index.count("ibtx-legacy-mobile-menu") == 1
assert index.count('<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>') == 1
assert index.count('<div class="announcement">') == 1
assert index.count('<main id="main-content">') == 1
assert 'class="ibtx-announcement"' in index
assert 'class="quick-dock"' in index
assert 'class="command-palette"' in index

index = index.replace("Ibtikar Tech Homepage V7 — cinematic hero + customer voices \n\n", "", 1)
index = index.replace(
    '<script src="/static/public_preview/assets/js/page-shell.js"></script>\n'
    '<script src="/static/public_preview/assets/js/ibtikar-shell.js"></script>',
    '<script src="/static/public_preview/assets/js/page-shell.js" defer></script>\n'
    '<script src="/static/public_preview/assets/js/ibtikar-shell.js" defer></script>',
    1,
)
index = index.replace('<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>\n', "", 1)
index, announcement_count = re.subn(
    r'<div class="announcement">\n<div class="container announcement__inner">\n.*?</div>\n</div>\n',
    "",
    index,
    count=1,
    flags=re.S,
)
index, header_count = re.subn(
    r'<header data-approved-legacy-shell hidden inert aria-hidden="true" class="site-header ibtx-header" id="site-header">.*?</header>\n',
    "",
    index,
    count=1,
    flags=re.S,
)
index = index.replace(
    '<!-- Legacy mobile menu hook kept hidden so the original page JavaScript never fails. -->\n'
    '<nav class="mobile-menu ibtx-legacy-mobile-menu" aria-hidden="true"></nav>\n\n',
    "",
    1,
)
index, drawer_count = re.subn(
    r'<div data-approved-legacy-shell hidden inert class="ibtx-drawer" aria-hidden="true">.*?</div>\n\n<main id="main-content">',
    '<main id="main-content">',
    index,
    count=1,
    flags=re.S,
)
index, footer_count = re.subn(
    r'<footer data-approved-legacy-shell hidden inert aria-hidden="true" class="ibtx-footer">.*?</footer>\n\n(?=<nav aria-label="إجراءات سريعة" class="quick-dock">)',
    "",
    index,
    count=1,
    flags=re.S,
)
assert (announcement_count, header_count, drawer_count, footer_count) == (1, 1, 1, 1)
for marker in (
    "data-approved-legacy-shell",
    'id="site-header"',
    "ibtx-legacy-mobile-menu",
    'class="mobile-menu',
    '<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>',
    '<div class="announcement">',
    'class="ibtx-footer"',
    'class="ibtx-drawer"',
):
    assert marker not in index, marker
assert index.count('<main id="main-content">') == 1
assert 'class="ibtx-announcement"' in index
assert 'class="quick-dock"' in index
assert 'class="command-palette"' in index
write(index_path, index)


# 2) Homepage runtime: remove only selectors/handlers for DOM that no longer exists.
home_path = "static/public_preview/assets/js/source-home.js"
home = read(home_path)
assert home.count("getElementById('site-header')") == 2
home, first_shell_count = re.subn(
    r"  const body = document\.body;\n"
    r"  const header = document\.getElementById\('site-header'\);\n"
    r"  const menuToggle = document\.querySelector\('\.menu-toggle'\);\n"
    r"  const mobileMenu = document\.querySelector\('\.mobile-menu'\);\n"
    r"  const themeToggle = document\.querySelector\('\.theme-toggle'\);\n"
    r"  const navLinks = \[\.\.\.document\.querySelectorAll\('\.desktop-nav a'\)\];\n"
    r"  const allMobileLinks = \[\.\.\.document\.querySelectorAll\('\.mobile-menu a'\)\];\n\n"
    r"  const updateHeader = \(\) => header\?\.classList\.toggle\('scrolled', window\.scrollY > 14\);\n"
    r"  updateHeader\(\);\n"
    r"  window\.addEventListener\('scroll', updateHeader, \{ passive: true \}\);\n\n"
    r"  const closeMenu = \(\) => \{.*?"
    r"  themeToggle\?\.addEventListener\('click', \(\) => \{.*?  \}\);\n\n"
    r"(?=  document\.querySelectorAll\('\.accordion-item button'\))",
    "",
    home,
    count=1,
    flags=re.S,
)
assert first_shell_count == 1
home, section_nav_count = re.subn(
    r"\n  const sections = \[\.\.\.document\.querySelectorAll\('main section\[id\]'\)\];.*?\n\n(?=  const newsletterForm)",
    "\n",
    home,
    count=1,
    flags=re.S,
)
assert section_nav_count == 1
assert home.count("  const header = document.getElementById('site-header');\n") == 1
home = home.replace("  const header = document.getElementById('site-header');\n", "", 1)
home, cinematic_header_count = re.subn(
    r"\n  // Header hides while moving down and returns while moving up\..*?\n\n(?=  // Subtle ambient color changes connect the main beats\.)",
    "\n",
    home,
    count=1,
    flags=re.S,
)
assert cinematic_header_count == 1
for marker in (
    "getElementById('site-header')",
    "querySelector('.menu-toggle')",
    "querySelector('.mobile-menu')",
    "querySelector('.theme-toggle')",
    "querySelectorAll('.desktop-nav a')",
    "querySelectorAll('.mobile-menu a')",
    "const closeMenu =",
    "localStorage.getItem('ibtikar-theme')",
    "header?.classList.add('cinematic-hidden')",
    "header?.classList.remove('cinematic-hidden')",
):
    assert marker not in home, marker
for marker in (
    "document.querySelectorAll('.accordion-item button')",
    "const revealItems",
    "const newsletterForm",
    "document.querySelector('.command-trigger')",
    "function openBrief()",
    "const hero = document.querySelector('.hero')",
):
    assert marker in home, marker
write(home_path, home)


# 3) The homepage source is clean, so the parse-time sanitizer is no longer needed.
head_path = "templates/public_preview/components/document_head.html"
head = read(head_path)
assert "[data-approved-legacy-shell], .ibtx-legacy-mobile-menu" in head
new_head = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>
  // Apply enhancement and the persisted theme before page CSS is evaluated.
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js-ready');
  try {
    const savedTheme = localStorage.getItem('ibtikar-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch (_) {}
</script>'''
write(head_path, new_head)


# 4) Remove the second homepage legacy normalizer from page-shell.js.
page_shell_path = "static/public_preview/assets/js/page-shell.js"
page_shell = read(page_shell_path)
page_shell, normalizer_count = re.subn(
    r"\n  const normalizeHomepageLegacyShell = \(\) => \{.*?\n  \};\n\n(?=  const normalizeProductionMetadata)",
    "\n",
    page_shell,
    count=1,
    flags=re.S,
)
assert normalizer_count == 1
old_calls = """  normalizeProductionMetadata();
  normalizeHomepageLegacyShell();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizeHomepageLegacyShell, { once: true });
  }
"""
assert page_shell.count(old_calls) == 1
page_shell = page_shell.replace(old_calls, "  normalizeProductionMetadata();\n", 1)
assert "normalizeHomepageLegacyShell" not in page_shell
assert "body.source-home > .announcement" not in page_shell
write(page_shell_path, page_shell)


# 5) One global skip target on every public page.
for page in (
    "templates/public_preview/pages/services.html",
    "templates/public_preview/pages/tharaa.html",
):
    text = read(page)
    assert text.count('<main id="main">') == 1
    text = text.replace('<main id="main">', '<main id="main-content">', 1)
    assert '<main id="main">' not in text
    write(page, text)


# 6) Expose the shared Dark/Light runtime from the shared header.
header_path = "templates/public_preview/components/header.html"
header = read(header_path)
assert header.count("data-ibt-theme-toggle") == 0
needle = '''    <div class="ibt-shell-actions">
      <a class="ibt-shell-cta" href="{% url 'public_preview:contact' %}#quote">ابدأ مشروعك</a>'''
replacement = '''    <div class="ibt-shell-actions">
      <button class="ibt-shell-icon-btn" type="button" data-ibt-theme-toggle aria-label="تفعيل الوضع الفاتح" aria-pressed="true"><span data-ibt-theme-icon aria-hidden="true">☀</span></button>
      <a class="ibt-shell-cta" href="{% url 'public_preview:contact' %}#quote">ابدأ مشروعك</a>'''
assert header.count(needle) == 1
header = header.replace(needle, replacement, 1)
assert header.count("data-ibt-theme-toggle") == 1
write(header_path, header)

shell_path = "static/public_preview/assets/js/ibtikar-shell.js"
shell = read(shell_path)
theme_re = re.compile(
    r"  managedThemeButtons\.forEach\(\(button\) => \{.*?\n  \}\);\n\n  /\* Shared mobile drawer",
    re.S,
)
assert theme_re.search(shell), "managed theme block missing"
new_theme = '''  const applySavedTheme = () => {
    try {
      const saved = localStorage.getItem('ibtikar-theme');
      if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
    } catch {}
  };
  const syncThemeControls = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    managedThemeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
      const icon = button.querySelector('[data-ibt-theme-icon]');
      if (icon) icon.textContent = dark ? '☀' : '☾';
    });
  };
  applySavedTheme();
  syncThemeControls();
  managedThemeButtons.forEach((button) => {
    button.addEventListener('click',() => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ibtikar-theme',next); } catch {}
      syncThemeControls();
    });
  });
  window.addEventListener('storage',(event) => {
    if (event.key !== 'ibtikar-theme') return;
    applySavedTheme();
    syncThemeControls();
  });

  /* Shared mobile drawer'''
shell = theme_re.sub(new_theme, shell, count=1)
assert "syncThemeControls" in shell
assert "localStorage.setItem('ibtikar-theme',next)" in shell
write(shell_path, shell)


# 7) Run Browser/Interaction QA on the production self-hosted runner without sudo.
workflow_path = ".github/workflows/django-clean-url-browser-qa.yml"
workflow = read(workflow_path)
assert workflow.count("runs-on: ubuntu-latest") == 1
workflow = workflow.replace(
    "    runs-on: ubuntu-latest\n",
    "    runs-on: [self-hosted, production, ibtikartech]\n",
    1,
)
setup_node = '''      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "24"
'''
assert workflow.count(setup_node) == 1
setup_chrome = setup_node + '''
      - name: Setup Chrome for self-hosted functional QA
        id: setup-chrome
        uses: browser-actions/setup-chrome@v2
        with:
          chrome-version: stable
          no-sudo: true
'''
workflow = workflow.replace(setup_node, setup_chrome, 1)
base_env = "          BASE_URL: http://127.0.0.1:8000\n"
assert workflow.count(base_env) == 2
workflow = workflow.replace(
    base_env,
    base_env + "          CHROME_PATH: ${{ steps.setup-chrome.outputs.chrome-path }}\n",
)
assert "install-dependencies: true" not in workflow
write(workflow_path, workflow)


# 8) Expand browser sweep to cover RTL, shared shell, main target and cross-page fragments.
browser_path = "scripts/browser_qa_clean_urls.cjs"
browser = read(browser_path)
return_needle = '''      headerVisible: visible(document.querySelector('.ibt-shell-header')),
      footerVisible: visible(document.querySelector('.ibt-shell-footer')),
      scrollWidth: document.documentElement.scrollWidth,'''
return_replacement = '''      headerVisible: visible(document.querySelector('.ibt-shell-header')),
      footerVisible: visible(document.querySelector('.ibt-shell-footer')),
      htmlDir: document.documentElement.getAttribute('dir') || '',
      themeToggleVisible: visible(document.querySelector('[data-ibt-theme-toggle]')),
      mainContentCount: document.querySelectorAll('#main-content').length,
      legacyShellCount: document.querySelectorAll('[data-approved-legacy-shell], .ibtx-legacy-mobile-menu, #site-header').length,
      scrollWidth: document.documentElement.scrollWidth,'''
assert browser.count(return_needle) == 1
browser = browser.replace(return_needle, return_replacement, 1)
validate_needle = '''  if (!metrics.headerVisible) failures.push(`${prefix}: shared header is not visible`);
  if (!metrics.footerVisible) failures.push(`${prefix}: shared footer is not visible`);
  if (!metrics.keyboardMoved) failures.push(`${prefix}: keyboard Tab did not move across controls`);'''
validate_replacement = '''  if (!metrics.headerVisible) failures.push(`${prefix}: shared header is not visible`);
  if (!metrics.footerVisible) failures.push(`${prefix}: shared footer is not visible`);
  if (metrics.htmlDir !== 'rtl') failures.push(`${prefix}: document dir is ${metrics.htmlDir || 'missing'}, expected rtl`);
  if (!metrics.themeToggleVisible) failures.push(`${prefix}: shared theme toggle is not visible`);
  if (metrics.mainContentCount !== 1) failures.push(`${prefix}: expected one #main-content, found ${metrics.mainContentCount}`);
  if (metrics.legacyShellCount) failures.push(`${prefix}: retired shell nodes are still rendered (${metrics.legacyShellCount})`);
  if (!metrics.keyboardMoved) failures.push(`${prefix}: keyboard Tab did not move across controls`);'''
assert browser.count(validate_needle) == 1
browser = browser.replace(validate_needle, validate_replacement, 1)
link_collect = '''  for (const href of metrics.internalHrefs) {
    const pathname = href.split('#')[0].split('?')[0];
    if (pathname) internalLinks.add(pathname);
  }'''
assert browser.count(link_collect) == 1
browser = browser.replace(
    link_collect,
    '''  for (const href of metrics.internalHrefs) {
    if (href) internalLinks.add(href);
  }''',
    1,
)
browser, verify_count = re.subn(
    r"async function verifyInternalLinks\(internalLinks, failures\) \{.*?\n\}\n\n(?=\(async \(\) => \{)",
    r'''async function verifyInternalLinks(internalLinks, failures) {
  const ignoredPrefixes = ['/static/', '/media/', '/django-admin/', '/control/'];
  for (const href of [...internalLinks].sort()) {
    const url = new URL(href, baseUrl);
    const pathname = url.pathname;
    if (ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) continue;
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.status >= 400) {
        failures.push(`internal link ${href} returned ${response.status}`);
        continue;
      }
      if (/\.html(?:[?#]|$)/i.test(response.url)) {
        failures.push(`internal link ${href} ended on legacy .html URL ${response.url}`);
      }
      if (url.hash) {
        const target = decodeURIComponent(url.hash.slice(1));
        const html = await response.text();
        const hasTarget = html.includes(`id="${target}"`) || html.includes(`id='${target}'`);
        if (!hasTarget) failures.push(`internal link ${href} points to missing #${target}`);
      }
    } catch (error) {
      failures.push(`internal link ${href} failed: ${error.message}`);
    }
  }
}

''',
    browser,
    count=1,
    flags=re.S,
)
assert verify_count == 1
write(browser_path, browser)


# 9) Deep interaction QA: Dark/Light, RTL and prefers-reduced-motion.
interaction_path = "scripts/interaction_qa_clean_urls.cjs"
interaction = read(interaction_path)
assert "async function testThemeRtlAndReducedMotion" not in interaction
insert_before = "async function testContactSteps(client) {"
assert interaction.count(insert_before) == 1
theme_test = r'''async function testThemeRtlAndReducedMotion(client) {
  await client.send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
  await navigate(client, '/', DESKTOP);
  let state = await evaluate(client, `(() => {
    const button = document.querySelector('[data-ibt-theme-toggle]');
    const style = button ? getComputedStyle(button) : null;
    const rect = button?.getBoundingClientRect();
    return {
      dir: document.documentElement.getAttribute('dir') || '',
      theme: document.documentElement.dataset.theme || '',
      buttonVisible: Boolean(button && style?.display !== 'none' && style?.visibility !== 'hidden' && rect?.width > 0 && rect?.height > 0),
      pressed: button?.getAttribute('aria-pressed') || '',
      label: button?.getAttribute('aria-label') || '',
    };
  })()`);
  assert(state.dir === 'rtl' && state.buttonVisible && ['dark','light'].includes(state.theme),
    `Theme/RTL initial state failed: ${JSON.stringify(state)}`);
  const before = state.theme;
  await focus(client, '[data-ibt-theme-toggle]');
  await key(client, 'Enter');
  await wait(100);
  state = await evaluate(client, `(() => ({
    theme: document.documentElement.dataset.theme || '',
    saved: localStorage.getItem('ibtikar-theme') || '',
    pressed: document.querySelector('[data-ibt-theme-toggle]')?.getAttribute('aria-pressed') || '',
    label: document.querySelector('[data-ibt-theme-toggle]')?.getAttribute('aria-label') || '',
  }))()`);
  assert(state.theme !== before && state.saved === state.theme,
    `Theme toggle/persistence failed: ${JSON.stringify(state)}`);

  await client.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await navigate(client, '/', DESKTOP, 80);
  const reduced = await evaluate(client, `(() => {
    const header = document.querySelector('.ibt-shell-header');
    return {
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transitionDuration: header ? getComputedStyle(header).transitionDuration : '',
    };
  })()`);
  assert(reduced.matches && /^0(?:s|ms)(?:,\s*0(?:s|ms))*$/.test(reduced.transitionDuration),
    `Reduced-motion shell contract failed: ${JSON.stringify(reduced)}`);
  await client.send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
  console.log('✓ shared theme / RTL / reduced-motion interaction');
}

'''
interaction = interaction.replace(insert_before, theme_test + insert_before, 1)
tests_needle = "      ['mobile menu', testMobileMenu],\n      ['FAQ', testFaq],"
assert interaction.count(tests_needle) == 1
interaction = interaction.replace(
    tests_needle,
    "      ['mobile menu', testMobileMenu],\n      ['theme / RTL / reduced motion', testThemeRtlAndReducedMotion],\n      ['FAQ', testFaq],",
    1,
)
write(interaction_path, interaction)


# 10) Permanent regression guards.
tests_path = "apps/public_preview/tests/test_ux_foundation.py"
tests = read(tests_path)
assert "def test_all_public_pages_use_one_shared_shell_and_valid_navigation_contract():" not in tests
tests += r'''


def test_all_public_pages_use_one_shared_shell_and_valid_navigation_contract():
    import re
    from collections import Counter
    from pathlib import Path

    pages = sorted(Path("templates/public_preview/pages").glob("*.html"))
    assert len(pages) == 22
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
        source = _read_source(str(page))
        assert '{% extends "public_preview/base.html" %}' in source, page.name
        assert source.count('id="main-content"') == 1, page.name
        assert 'id="main"' not in source, page.name
        for legacy in legacy_markers:
            assert legacy not in source, f"{page.name}: {legacy}"
        assert not html_ref.findall(source), page.name
        ids = id_ref.findall(source)
        counts = Counter(ids)
        assert not [key for key, value in counts.items() if value > 1], page.name
        missing = {anchor for anchor in anchor_ref.findall(source) if anchor and anchor not in counts}
        assert not missing, f"{page.name}: {sorted(missing)}"


def test_shared_shell_owns_theme_rtl_focus_and_reduced_motion_contract():
    header = _read_source("templates/public_preview/components/header.html")
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
'''
write(tests_path, tests)


# Final static self-check before the workflow commits anything.
pages = sorted(Path("templates/public_preview/pages").glob("*.html"))
assert len(pages) == 22
for page in pages:
    source = page.read_text(encoding="utf-8")
    assert source.count('id="main-content"') == 1, page.name
    assert "data-approved-legacy-shell" not in source, page.name
    assert "ibtx-legacy-mobile-menu" not in source, page.name
    assert 'id="site-header"' not in source, page.name
print("Final foundation patch applied and statically verified.")
