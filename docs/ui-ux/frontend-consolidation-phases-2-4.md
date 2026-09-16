# Ibtikar Tech — Frontend Consolidation Phases 2–4

This document records the stage-gated implementation immediately following the Phase 1 ownership audit.

## Verification policy for these phases

Per the approved execution policy, no full CI, Browser QA, Visual QA, Lighthouse, Axe, or full pytest suite was run during Phases 2–4. Verification here is architectural/static: owner selection, dependency direction, template/runtime contracts, exact diffs, route references, DOM references, fallback behavior, and preservation of existing cinematic drawing/state code. Full runtime/visual/performance verification remains reserved for the final QA phase.

---

## PHASE 2 — Foundation Consolidation

### Implemented

- `templates/public_preview/base.html` is now the canonical entry point for the shared foundation.
- Shared dependency direction is explicit around:
  - `base.css`
  - page composition
  - critical first-view rules
  - `tokens.css`
  - `typography-system.css`
  - `components.css`
  - `ibtikar-shell.css`
  - transitional `ux-system-v1.css`
- `base.css` no longer imports `tokens.css`; token ownership is explicit in the template rather than hidden in CSS.
- `inner.css` no longer imports `base.css`, removing the confirmed duplicate foundation path.
- Service-category and service-detail family templates no longer re-include `ibtikar-shell.css`; they inherit the canonical shell from `base.html`.
- The Services landing template no longer re-includes canonical `tokens.css` or `ibtikar-shell.css`.

### Deliberately not absorbed in this phase

The preserved-source pages still contain legacy global rules and, in some templates, legacy re-inclusions of canonical assets. They are not deleted here because their cascade currently participates in the approved visual result. Their removal belongs to the later Source CSS Extraction / Refinement Consolidation phases, where each source rule can be migrated to its real owner without a blind visual rewrite.

`inner.css` still imports page-family/legacy layers (`platform.css`, `frontend-final.css`, `category-signatures.css`). These are not the foundation itself. Removing that remaining import graph requires migrating the consuming page templates and belongs to the later asset/refinement cleanup, not to the safe foundation cut performed here.

### Phase 2 technical decision

The canonical foundation owner is now established without prematurely stripping preserved-source composition. No new patch/refinement stylesheet was introduced.

---

## PHASE 3 — Services: Server-rendered Structure

### Implemented in Django

The Services landing page now renders the final static structure directly from `templates/public_preview/pages/services.html`:

- five primary cinema chapter controls;
- final chapter labels;
- canonical Django links for the five service families;
- Fast Discovery section;
- Fast Discovery status/control markup;
- all eight service cards;
- card images and alt text;
- titles and descriptions;
- tags;
- canonical Django URLs.

The old runtime content arrays and markup builders were removed from `services-experience.js`.

### JavaScript after the phase

`services-experience.js` is interaction/state only. It now owns:

- active chapter synchronization;
- chapter scrolling;
- active Fast Discovery slide state;
- previous/next navigation;
- scroll synchronization;
- pointer dragging;
- keyboard Arrow/Home/End navigation;
- reduced-motion-aware scrolling.

It no longer owns service titles, descriptions, images, tags, route strings, `innerHTML`, or runtime card/control construction.

### Additional correction

The primary Services cinema has exactly five chapters. Its owner stylesheet was corrected from a six-column desktop grid to five columns so the CSS geometry matches the server-rendered chapter count.

---

## PHASE 4 — Service Cinema Structure

### Implemented in Django

A canonical server-rendered component now owns the static cinema chrome:

`templates/public_preview/components/service_cinema_chrome.html`

It renders:

- reading/bypass control;
- canvas element and canvas layer;
- wash;
- vignette;
- grain;
- route/family index label;
- progress rail;
- numbered rail steps;
- scroll cue.

The service-category family includes this component once for all five category routes.

### JavaScript after the phase

`service-cinema.js` no longer creates the cinema chrome with `document.createElement()` or `innerHTML`. It consumes the server-rendered component and retains only the behavior that genuinely needs runtime state:

- Canvas 2D drawing;
- scene selection from card data;
- scroll progress;
- active card/index state;
- desktop/mobile cinematic transitions;
- `inert` / `aria-hidden` state;
- reading mode;
- visibility/resize scheduling;
- reduced-motion behavior.

The existing drawing functions and cinematic scene engine were intentionally preserved rather than rewritten.

### Fallback contract

The server-rendered chrome is `hidden` by default. The category-family stylesheet exposes it as `display: contents` only after JavaScript removes the `hidden` attribute during successful cinema initialization. Therefore no-JS and reduced-motion paths do not expose orphan cinematic chrome.

A bounded set of eight rail-step placeholders is rendered by Django; the runtime hides surplus steps based on the actual service-card count. If a future category exceeds that bound, the runtime fails closed and leaves the normal server-rendered card experience instead of constructing unknown markup.

---

## Static review evidence

The implementation diff was reviewed against the Phase 1 baseline. Changes are limited to foundation ownership, Services SSR migration, the category cinema component/runtime bridge, and the small owner-CSS correction. No models, migrations, form backend behavior, database schema, merge, deployment, or production branch were changed.

`services-experience.js` was re-read after the migration and contains no static service dataset, no `innerHTML`, no `document.createElement()`, and no legacy `.html` service routes.

`service-cinema.js` was re-read after the migration and contains no `document.createElement()` or `innerHTML`; the existing canvas scene functions and scroll-state engine remain in place.

---

## Known later-phase work — intentionally not pulled forward

- Dynamic known-asset injection in `approved-source.js` / `page-shell.js` / `runtime.html` → Phase 5/6.
- Remaining preserved-source global CSS duplication and page-local canonical asset re-inclusions → Source CSS Extraction phase.
- Reveal / FAQ multi-owner consolidation → Motion / Interaction phases.
- `frontend-final.css`, launch/refinement absorption and remaining `!important` debt → Refinement Consolidation phase.
- Service-detail Product Page adapter consolidation → Service Detail Family phase.
- Metadata/client-side canonical compatibility cleanup → Head/Legacy phase.
- Browser/visual/accessibility/performance evidence → Final QA phase only.

These items are not regressions introduced by Phases 2–4 and were not hidden or patched around during this work.
