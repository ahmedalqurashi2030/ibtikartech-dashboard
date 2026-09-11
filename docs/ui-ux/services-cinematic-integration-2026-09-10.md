# Services cinematic integration — 2026-09-10

## Scope and baseline

Branch: `codex/services-cinematic-integration`.
Baseline: `83f1ddfecb0b0f7478a335030bf79989808ed9df`, matching the local origin/main reference at inspection.
The user-supplied `ibtikar-services-cinematic-mobile-v5 (13).html` was untracked before work and remains an unchanged reference.
No before-change screenshots were captured; visual checks below are post-change checks, not pixel-diff regression.

## Reference mapping

| Reference pattern | Integration |
| --- | --- |
| Per-path canvas scenes | 28 decorative scenes attached by data-scene to the five existing category templates |
| Cinematic storytelling | Existing service-cinema.js lifecycle; readable holds, a single caption, shorter natural-scroll runway |
| Static/mobile story | Sequential cards on small/short viewports and reduced motion; an explicit read-all control on desktop |
| Section headings and surfaces | Existing section-layout-refinement-v2.css, scoped to service categories, details and index |
| Process and deliverables | Shared timeline styling; explicit conditional deliverables for brand, growth and systems |
| Detail pages | Existing six detail templates; matching section rhythm, cards, hero surfaces and readable body text |
| Services index | Existing five families; brand/content is now also available in the goal grid |
| Color | Existing Ibtikar brand accents and semantic surface/text tokens retained |
| Contact | Existing named routes and real inquiry form retained; reference dialog not imported |

The document shell, five-category taxonomy, models, migrations, CRM, named URLs and existing service imagery were preserved. No dependencies were added. No reference base64 images or client-rendered business-content registry were imported. The canvas text is decorative and aria-hidden; service content stays in Django templates.

## Changed files

- static/public_preview/assets/js/service-cinema.js
- static/public_preview/assets/css/pages/service-category.css
- static/public_preview/assets/css/pages/section-layout-refinement-v2.css
- templates/public_preview/pages/services.html
- templates/public_preview/pages/ecommerce.html
- templates/public_preview/pages/websites.html
- templates/public_preview/pages/brand-content.html
- templates/public_preview/pages/growth.html
- templates/public_preview/pages/custom-systems.html
- templates/public_preview/pages/store-launch.html
- templates/public_preview/pages/storefront-customization.html
- templates/public_preview/pages/store-redesign.html
- templates/public_preview/pages/product-page-optimization.html
- templates/public_preview/pages/ecommerce-growth.html
- templates/public_preview/pages/ecommerce-support.html
- apps/public_preview/tests/test_ux_foundation.py
- scripts/service_cinema_qa.cjs
- This report

## Accessibility and performance

- Off-screen canvas work is gated by IntersectionObserver and document visibility.
- Reduced motion changes restore all card content immediately, including when the section is outside the viewport.
- Inactive cinematic cards use inert and aria-hidden; keyboard focus switches the component to normal document flow.
- A read-all button restores all paths and places focus on the section introduction.
- Deep links into individual system paths restore the static story.
- Short windows (under 840px high) and narrow windows (under 1000px wide) start in static mode.
- Detail decision panels render without hidden attributes; the existing tab script enhances them after loading.
- Particle count is bounded and disabled for save-data connections.
- Canvas pixel ratio remains capped at 1.7. No animation timer was added.

## Verification

- `.venv\\Scripts\\python.exe manage.py check`: passed.
- `.venv\\Scripts\\python.exe -m pytest apps/public_preview/tests apps/services/tests -q`: **158 passed**; six existing Django URLField deprecation warnings.
- `.venv\\Scripts\\python.exe manage.py makemigrations --check --dry-run`: no changes.
- `.venv\\Scripts\\python.exe scripts/verify_django_template_contract.py`: **22/22**, three families.
- `.venv\\Scripts\\python.exe scripts/verify_frontend_single_repo_ownership.py`: passed.
- `node --check` for the updated cinema runtime and QA script: passed.
- `git diff --check`: passed.
- Browser: `node --experimental-websocket scripts/service_cinema_qa.cjs` against local Django and Chrome CDP port 9334.
- **60 route/viewport combinations**: twelve routes at 375, 768, 1024 and 1440px wide with 960px height, plus 720x375 landscape.
- No horizontal overflow, missing scene mappings, duplicate H1s or runtime exceptions in this matrix.
- Desktop scene-state checks: one accessible path at each sampled position; hidden cards not focusable.
- Live reduced-motion switch: all paths restored.
- No-JavaScript detail check: all decision panels available.
- Read-all action: all cards visible, introduction focused.
- Visual inspection: ecommerce desktop/mobile and store-launch light-theme hero.

## Remaining limits

The browser command deliberately exits nonzero because it detects one missing local header logo rendition (repeated in desktop/mobile shell):
`/media/images/inA0x6HlS2sMC65JOKfUhyJfP8S66TSFwCRx.2e16d0ba.fill-76x76.png`.
No logo, header or media data was changed in this task. Restore the local media from its legitimate source to clear that check.
All missing-image findings in this run point to that same asset, not to the service images.

The 720px viewport exercises narrow/landscape reflow; it is not a real browser 200% zoom test. Axe, Lighthouse and an exhaustive contrast audit were not run. Production deployment was not performed.
