# Bounded service category cinema

The five service category pages share one cinematic viewport: at most 720px on desktop and 660px below 1000px, always within the available viewport height. The scroll runway is separate from the visible frame. The previous 620px minimum was removed to accommodate short screens.

Mobile now loads the same scroll-driven scene runtime. Captions use a responsive panel with internal overflow for short screens; the full reading view remains available. Reduced-motion visitors retain static content. Duplicate cinematic introductions and the local section navigation were removed from the five category templates.

Changed implementation files:
- static/public_preview/assets/css/pages/service-category.css
- static/public_preview/assets/css/pages/services-reference.css
- static/public_preview/assets/js/service-cinema.js
- templates/public_preview/families/service_category_base.html
- templates/public_preview/pages/{ecommerce,websites,brand-content,growth,custom-systems}.html
- apps/public_preview/tests/{test_preview_routes,test_ux_foundation}.py

Verification: Django system check; public preview pytest suite (168 passed initially, one outdated navigation assertion corrected; both affected test modules then passed all 96 tests). Browser matrix and exact results: CINEMATIC_VIEWPORT_BROWSER_RESULTS.json. Reproduce with node --experimental-websocket scripts/bounded_cinema_qa.cjs against a running local server and CDP browser. This verifies Chromium emulated viewports, not physical iOS or Android devices.
