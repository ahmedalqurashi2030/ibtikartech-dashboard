# Ibtikar Tech — Frontend Consolidation Execution Log

> Stage-gated refactor log. A phase is not allowed to start until the previous phase is explicitly approved.

## Audit baseline

- **Phase:** 1 — Frontend Architecture & Ownership Audit
- **Audited branch:** `fix/homepage-visual-unification-20260912`
- **Audited application SHA:** `fa18c81e49f2c3c6f721156402dde6f6ec45dd7c`
- **PR:** #79 (Draft)
- **Scope:** public Django/Wagtail frontend only
- **Full QA suites executed in this phase:** **No** — intentionally deferred to the final verification phase.
- **Safety:** no application CSS/JS/template/backend behavior changed during Phase 1.

---

# 1. Architectural target

The consolidation target is:

```text
Django templates = structure + content + URLs
CSS              = presentation + layout + responsive visual system
JavaScript       = interaction + state + motion + canvas only
```

Canonical dependency direction:

```text
tokens.css
  ↓
base.css
  ↓
typography-system.css
  ↓
components.css
  ↓
ibtikar-shell.css
  ↓
page-family CSS
  ↓
page-specific composition (only when genuinely necessary)
```

Runtime principle:

```text
server-rendered structure
  ↓
usable no-JS document
  ↓
progressive JavaScript enhancement
```

Known page assets must be declared by Django at render time. JavaScript must not rediscover the page and inject CSS/JS that Django already knows is needed.

---

# 2. Canonical ownership map

| Concern | Current effective owners | Confirmed conflict | Target owner |
|---|---|---|---|
| Brand/design tokens | `tokens.css`, source-home/services/tharaa `:root`, some page/refinement custom props | Multiple parallel token systems | `tokens.css` for global tokens; locally scoped custom properties only for page-family accents |
| Reset/document defaults | `base.css`, source-home.css, source-services.css, source-tharaa.css, approved-source bridge | Same reset/body/link/media primitives repeated | `base.css` |
| Container/read width | `base.css`, source CSS `.container`, `ux-system-v1.css` `.ibtx-container`, service family shells | Multiple geometry dialects | `base.css` primitives; family shell only for true family-specific max-width |
| Keyboard focus | `base.css`, `components.css`, `approved-source.css`, service-primitives.css, shell | Repeated focus contracts and offsets | `base.css` global focus; component-specific focus only where visual context requires it |
| Typography | `typography-system.css`, source CSS, critical styles, `ux-system-v1.css`, service-detail refinement | Canonical owner exists but compatibility overrides remain broad and `!important`-heavy | `typography-system.css` + narrowly scoped family exceptions |
| Buttons/actions | `components.css`, source-home/services/tharaa CSS, service/detail refinements, critical mobile action pair | Multiple complete button systems | `components.css`; page CSS may only compose/place buttons |
| Cards | `components.css`, inner.css, frontend-final.css, source CSS, refinements | Base geometry/hover repeated by page layers | `components.css` for shared language; family CSS for composition only |
| Forms | `components.css`, base.css, page source/refinement CSS | Shared control geometry can be overridden in multiple layers | `components.css` + `base.css` minimum interaction geometry |
| CTA | `components.css`, service-primitives.css, service-detail-refinement, source CSS, critical styles | Shared CTA geometry/behavior duplicated | `components.css` + family composition variant |
| Header / Mega / Mobile / Footer CSS | `ibtikar-shell.css`, `frontend-final.css`, source CSS, approved-source integration | Shell claims exclusivity but is redefined elsewhere | `ibtikar-shell.css` only |
| Shell JS | `ibtikar-shell.js`, `app.js`, page/source JS | Header/menu behavior can be owned by more than one runtime | `ibtikar-shell.js` only for shell behavior |
| FAQ behavior | `ibtikar-shell.js`, `app.js`, `approved-source.js`, `source-services.js`, `service-primitives.js` | Several click/toggle/ARIA owners | native `<details>` where possible, otherwise one dedicated disclosure/accordion runtime |
| Reveal behavior | `base.css`, `app.js`, `approved-source.js`, `source-home.js`, `source-services.js`, GSAP entrances, head visibility override | `.in`, `.is-visible`, `.visible`, GSAP opacity and inline override coexist | one reveal contract/runtime; cinematic GSAP only for deliberate scene animation |
| Route ownership | Django `manifest.py` / `{% url %}`, plus `page-shell.js` client route map | JS duplicates server route knowledge | Django URLs/manifest; temporary compatibility normalizer only for truly legacy inbound/output content |
| Metadata/head | `metadata.py` + `document_head.html`, plus child page meta blocks and `page-shell.js` canonical/OG mutation | Same metadata can be emitted/mutated by server and client | Django `document_head.html` + route-owned metadata context |
| Known page asset graph | Django templates + `approved-source.js` injection + `page-shell.js` `ensureScript()` + `runtime.html` deferred CSS injection | Four mechanisms can participate in loading known assets | Django template/family blocks |
| Homepage | template + source-home + approved-source + multiple home/refinement/deferred layers | Source design system and canonical design system coexist | homepage family composition + focused home runtime |
| Services landing | template + source-services + source-services.js + services-experience.js + approved-source + refinements | SSR markup is rewritten/rebuilt after load | Django-rendered final structure + interaction-only Services JS |
| Service-category cinema | category template cards + service-cinema.js-created chrome + cinema CSS/deferred CSS | JS creates fixed structural chrome | Django cinema partial + JS state/canvas only |
| Service-detail family | service_detail_base + commerce CSS/JS + primitives + refinement + product-page adapter | Product page still keeps a parallel source/adapter dialect | one service-detail family contract with small page-specific variants |
| Tharaa | template + source-tharaa CSS/JS + approved-source bridge + global systems + refinement | Source page contains another full foundation/shell/component system | dedicated Tharaa composition after extracting global concerns |

---

# 3. Confirmed P1 architectural conflicts

## P1-01 — Global foundation is not loaded from one explicit source

`base.html` loads typography, components and the transitional UX layer, but it does not directly load `tokens.css`, `base.css` or `ibtikar-shell.css`. Different page families discover these through different paths.

### Root cause
The project migrated from preserved standalone source pages to a shared Django shell incrementally, so old page bundles still provide parts of the foundation.

### Required later fix
Make the canonical global stack explicit and consistent before page-family CSS:

```text
tokens → base → typography → components → shell
```

---

## P1-02 — Three source pages still contain parallel design systems

`source-home.css`, `source-services.css`, and `source-tharaa.css` each define substantial copies of:

- `:root` tokens
- reset/document rules
- body and container
- buttons
- header/navigation/mobile menu
- headings/typography
- section primitives

### Root cause
They are preserved standalone source files from before canonical component/foundation ownership existed.

### Required later fix
Do **not** delete them wholesale. Use strangler extraction: move/replace global concerns with canonical owners, verify references, then leave only page composition/cinematic art direction.

---

## P1-03 — CSS `@import` hides the dependency graph and duplicates `frontend-final.css`

`inner.css` imports:

```text
base.css
platform.css
frontend-final.css
category-signatures.css
```

while service-category and service-detail family templates also link `frontend-final.css` directly.

### Root cause
The inner-page bundle predates explicit family asset ownership.

### Required later fix
Move public CSS dependency declaration into Django templates/family blocks and remove hidden `@import` chains gradually.

---

## P1-04 — `frontend-final.css` still owns shared Shell styling

The file contains a section explicitly named **Shared shell final pass** and defines navigation, brand, CTA, mega-menu and footer rules even though `ibtikar-shell.css` is documented and tested as the canonical shell owner.

### Root cause
A visual polish layer remained active after shell consolidation.

### Required later fix
Move valid effective shell rules into `ibtikar-shell.css`, then remove shell selectors from `frontend-final.css`.

### Contract gap
Current ownership tests prevent `ux-system-v1.css` from reclaiming Shell, but do not prevent `frontend-final.css` or preserved source CSS from doing so.

---

## P1-05 — `ibtikar-shell.css` itself contains base rules plus a second effective override pass

The same file first defines the canonical shell and later contains **Canonical effective shell refinements**, redefining several of the same selectors with stronger specificity/`!important`.

### Required later fix
Once external shell owners are removed, merge the effective values into the original declarations and delete the second override pass.

---

## P1-06 — Critical and deferred CSS duplicate the same page geometry

`critical_styles.html` contains first-view geometry for homepage ecosystem, services hero and Tharaa decision panel. `conversion-funnel-deferred.css` repeats those same selectors/geometry, while other deferred refinement files contain extensive page composition.

### Root cause
Performance stabilization was implemented by copying effective first-view rules into a parallel critical layer while keeping the historical layer intact.

### Risk
Two or more sources must remain synchronized; late geometry is also a potential CLS source.

### Required later fix
Critical CSS should only reserve/paint true first-view essentials. Effective component/page geometry should have one canonical owner.

---

## P1-07 — Runtime deferred stylesheet discovery is client-side even though Django knows the assets

`runtime.html` scans loaded stylesheet URLs, maps names such as `launch-readiness.css` to `launch-readiness-deferred.css`, constructs a new `<link>`, and appends it after load/idle.

A server-rendered `components/deferred_stylesheet.html` already exists.

### Required later fix
Declare deferred page/family assets explicitly from Django. Remove filename inference and runtime `<link>` creation for known assets.

---

## P1-08 — `approved-source.js` has become frontend middleware

It currently performs several unrelated roles:

- canvas compatibility monkey-patch
- image/alt/external-link repair
- DOM deletion for Tharaa
- reveal observer
- announcement DOM construction
- FAQ ARIA synchronization via `MutationObserver`
- tabs/swatches behavior
- static Ecommerce link/content rewriting
- dynamic Services CSS/JS injection
- dynamic Ecommerce CSS/JS injection

### Required later fix
Move structural/content/asset responsibilities to Django or their real component owner. Keep only narrowly justified compatibility code until it can be removed.

---

## P1-09 — `page-shell.js` duplicates routing, metadata and asset ownership

It currently:

- keeps a second `.html → clean URL` route map in JavaScript
- observes the whole document for legacy links created later
- mutates canonical/OG metadata
- creates an invisible fake `#libraryTrack` for a retired Tharaa animation
- dynamically injects several known JS enhancement bundles through `ensureScript()`

### Root cause
It is containing preserved-source output that is not yet server-clean.

### Required later fix
Modern output must use Django `{% url %}` and server metadata directly. Keep only the smallest temporary compatibility adapter for genuinely legacy content until source migrations are complete.

---

## P1-10 — Services final content/structure is partially built and rewritten in JavaScript

`services-experience.js` contains page content/data and legacy route strings and creates/replaces:

- Cinema chapters
- Fast Discovery cards
- controls
- counters/status UI
- headings/descriptions
- links

using `document.createElement`, `innerHTML`, text replacement and DOM deletion.

### Required later fix
Render all static content/structure and Django URLs in `services.html`/partials. JS should retain only state, scrolling, drag/swipe, keyboard, active index and cinematic behavior.

---

## P1-11 — Service-category cinema builds fixed scene chrome in JavaScript

`service-cinema.js` creates fixed structural elements at runtime:

- canvas layer wrapper
- wash/vignette/grain
- top index
- rail
- steps
- scroll cue

### Required later fix
Render this fixed chrome in a Django partial. Keep canvas drawing, progress calculation, active scene and accessibility state in JS.

---

## P1-12 — Reveal/motion ownership is duplicated across multiple runtimes

Confirmed owners include:

- `base.css` accepts `.is-visible` and `.in`
- `app.js` adds `.is-visible` and `.in`
- `approved-source.js` adds `.in`
- `source-services.js` adds `.in`
- `source-home.js` adds `.visible`
- GSAP also controls opacity/transform for selected hero/cinematic elements
- `document_head.html` forces selected above-fold elements visible with inline `!important`

### Risk
Timing conflicts, LCP delay workarounds, inconsistent no-JS/reduced-motion behavior and unnecessary observers.

### Required later fix
One generic reveal contract/runtime. Cinematic GSAP remains only for deliberate scene-specific motion.

---

## P1-13 — FAQ/disclosure behavior has multiple owners

Confirmed behavior exists in:

- `ibtikar-shell.js`
- `app.js`
- `approved-source.js`
- `source-services.js`
- `service-primitives.js` for service-detail `<details>`

Dataset guards reduce some double execution, but ownership is still fragmented.

### Required later fix
Prefer native `<details>/<summary>` where suitable. Otherwise use one dedicated accordion/disclosure component. Shell must not own page FAQ behavior.

---

## P1-14 — Service-detail family still carries a Product Page adapter dialect

`product-page-optimization.html` extends the shared family, but replaces the family style stack and remains excluded from shared service-primitives consumption. `service-detail-refinement-v1.css` maintains parallel selector trees for modern `.service-detail-page` and `body[data-page="product-page-optimization"]` legacy/adapted structures, with heavy `!important` use.

### Required later fix
Converge Product Page on the same canonical service-detail DOM/component vocabulary, retaining only truly product-specific visual composition.

---

## P1-15 — Metadata has a canonical owner but templates still duplicate it

`metadata.py` + `document_head.html` provide route-owned descriptions/viewport/canonical, but Homepage, Services, Tharaa and family templates still emit additional description and/or viewport tags. `page-shell.js` can also create/mutate canonical/OG URL metadata.

### Required later fix
One server owner for each metadata concern; page templates provide values, not duplicate tags.

---

## P1-16 — Asset ownership contract and rendered behavior disagree for Ecommerce refinement

`asset_contract.py` lists all service-category pages as consumers of `service-category-refinement-v1.css`, while `service_category_base.html` explicitly excludes Ecommerce from loading it.

### Required later fix
Make the contract represent the intentional rendered ownership instead of describing a broader consumer set.

---

# 4. Confirmed P2 cleanup debt

These are important, but should not distract from P1 ownership consolidation:

1. `service-primitives.js` contains repeated selectors such as `.service-page-nav a` twice, `.page-cta, .page-cta`, and `.service-commerce-actions` twice — clear copy/paste debt.
2. `ibtikar-shell.js` creates the mobile backdrop at runtime even though it is fixed shell structure and can be server-rendered beside the drawer.
3. `approved-source.css` repeats foundation concerns such as focus-visible, tap-highlight, touch-target and text-wrap contracts; retain only approved-source compatibility that cannot yet move to canonical owners.
4. `ux-system-v1.css` is intentionally transitional and globally loaded while containing Home/Services/Strategy/Inner-page rules. It should eventually be emptied into proper owners and removed.
5. Several files named `final`, `launch-readiness`, `refinement-v1/v2`, and `fix` are active owners rather than historical artifacts; they must be absorbed deliberately instead of receiving new sibling patch layers.
6. `service-primitives.css` sets global `html` scroll behavior and global `[id]` scroll margin despite being a service-detail asset; those concerns belong in base/family-scoped rules.
7. Shell CSS currently contains Home-specific integration rules. The final Shell owner should not need knowledge of cinematic Home content except unavoidable header positioning contracts.

---

# 5. Existing contracts: what is already good

The project already has useful architectural safeguards that should be preserved and extended rather than replaced:

- `template_contract.py` explicitly defines page-family inheritance.
- `asset_contract.py` explicitly records route-scoped asset consumers.
- `test_design_system_foundation.py` protects key token/base/component invariants.
- `test_shared_component_contract.py` protects canonical shared components from being reclaimed by `ux-system-v1.css`.
- `test_css_ownership_contract.py` protects Shell from `ux-system-v1.css` and protects family shell loading.
- clean Django routes are centrally represented by `manifest.py`.
- canonical route metadata exists in `metadata.py`.

The problem is not absence of architecture; it is that migration compatibility layers still sit beside the intended architecture.

---

# 6. Contract gaps to close during consolidation

Future ownership guards should additionally prevent:

- global shell selectors in `frontend-final.css` and unrelated page layers
- global `.btn` system recreation in preserved source files after migration
- public CSS `@import` chains after the explicit foundation migration
- known page CSS/JS injection via `document.createElement('link'/'script')`
- static page content generated from JS when Django can render it
- more than one generic Reveal owner
- more than one generic FAQ owner
- new legacy `.html` URLs in modern templates/runtime data
- route metadata duplication in page templates
- new `final-fix`, `refinement-v3`, or similar patch layers

These guards should be added when the corresponding ownership migration is actually implemented, not prematurely while legacy owners are still intentionally active.

---

# 7. Files that must NOT be deleted yet

The following are debt-bearing but still active owners and must survive until their responsibilities have been migrated:

- `source-home.css` / `source-home.js`
- `source-services.css` / `source-services.js`
- `source-tharaa.css` / `source-tharaa.js`
- `approved-source.css` / `approved-source.js`
- `frontend-final.css`
- `launch-readiness*.css`
- `section-layout-refinement-v2*.css`
- `conversion-funnel*.css`
- `ux-system-v1.css`
- `service-detail-refinement-v1.css`
- `page-shell.js`
- runtime deferred-style loader

Rule: **migrate owner → verify references/diff → remove legacy owner**, never delete first.

---

# 8. Phase ordering implications

The safest next stage is Foundation Consolidation, but it must be intentionally limited to shared foundation ownership. It should not simultaneously rewrite Services, cinema, or all source CSS.

Expected later sequence:

```text
Foundation ownership
→ Services SSR structure
→ Cinema fixed structure
→ remove dynamic known-asset injection
→ critical/deferred CSS ownership
→ Reveal/motion consolidation
→ disclosure/FAQ consolidation
→ source CSS extraction
→ refinement-layer absorption
→ service-detail family unification
→ head/metadata/legacy cleanup
→ final code consolidation
→ final QA only at the end
```

---

# 9. Phase 1 completion state

## Confirmed

- Canonical architecture already exists in partial form.
- No rewrite is required.
- The correct strategy is a staged strangler refactor.
- The largest risk is **duplicate ownership**, not missing styling.
- JavaScript reduction opportunity is substantial and specific: Services static UI, cinema chrome, known asset injection, shell backdrop, legacy content/URL repairs.
- Existing visual/cinematic page composition can be preserved while moving responsibility to cleaner owners.

## Phase 1 application changes

**None.** Only this audit/execution document is added.

## Full QA

**Not run by design.** Comprehensive CI/Browser/Visual/Axe/Lighthouse validation is reserved for the final verification phase after architecture consolidation is complete.

## Gate

**PHASE 1 — TECHNICAL AUDIT COMPLETE.**

Do not start Phase 2 until explicit user approval.
