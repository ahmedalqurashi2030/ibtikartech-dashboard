# Ibtikar Tech — Frontend Consolidation Master Baseline

> Authoritative consolidation ledger for the current frontend refactor workstream. This file combines the Phase 1 ownership audit, Phases 2–4 implementation record, the later Phase 5–8 ownership work, and the QA/contract corrections completed on the same Draft PR branch.

## 0. Repository binding

- **Repository:** `ahmedalqurashi2030/ibtikartech-dashboard`
- **PR:** `#79`
- **PR state at baseline:** Open + Draft + not merged
- **Base branch:** `codex/services-cinematic-integration`
- **Working branch:** `fix/homepage-visual-unification-20260912`
- **Application HEAD captured before this ledger commit:** `6fb9b111ed624840b69819eca432f5bad0aaa746`
- **PR scope at capture time:** 236 commits, 96 changed files relative to the base branch
- **No merge or deployment is authorized by this ledger.**

This is the baseline to consult before any further frontend consolidation. Do not rely on older SHAs or older phase reports without reconciling them against this file and the current branch.

---

# 1. Non-negotiable architectural target

```text
Django / HTML = structure + content + URLs + semantic markup
CSS           = tokens + presentation + layout + responsive visual system
JavaScript    = interaction + state + motion + canvas + ARIA state sync
```

Canonical CSS direction:

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
page-specific composition / art direction
```

Runtime direction:

```text
server-rendered structure
  ↓
usable no-JS document
  ↓
progressive enhancement
```

Known route assets must be declared by Django. JavaScript must not rediscover the route and inject assets Django already knows are required.

---

# 2. Visual Preservation Contract

The remaining work is a **refactor, not a redesign**.

Unless an explicit product/design request says otherwise, consolidation must preserve the currently approved effective result:

- section order;
- Arabic/RTL direction and reading flow;
- desktop/tablet/mobile composition;
- spacing and container widths;
- typography scale and hierarchy;
- colors, gradients, borders, radius and shadows;
- card geometry;
- header, mega menu, mobile menu and footer appearance;
- cinematic scene progression;
- canvas rendering;
- sticky/scroll choreography;
- touch/swipe behavior;
- keyboard behavior;
- reduced-motion fallback;
- data/ARIA/DOM hooks consumed by JavaScript.

If a late override currently produces the approved value, move that **effective value** into the canonical owner before deleting the override. Never delete a rule merely because the selector exists elsewhere.

For every CSS ownership move inspect:

1. selector and scope;
2. source order;
3. specificity;
4. media query;
5. CSS variables;
6. `!important`;
7. effective computed value;
8. JS/DOM hooks affected by the selector.

Do not solve regressions by creating a new `fix`, `final`, `refinement`, `v3`, or blanket `!important` layer.

---

# 3. Completed work — authoritative status

## Phase 1 — Frontend Architecture & Ownership Audit — COMPLETE

The ownership audit identified the main problem correctly: the project already had a viable Django/family/component architecture, but preserved source pages, final/refinement layers, runtime patching and compatibility code were still co-owning the same concerns.

The original detailed audit remains in:

- `docs/ui-ux/frontend-consolidation-execution.md`

Key confirmed debt from that audit still relevant to the remaining phases:

- preserved source CSS contains parallel mini design systems;
- shell rules still exist outside the canonical shell owner;
- critical/deferred layers duplicate effective geometry;
- `approved-source.js` remains a broad compatibility layer;
- Product Page still carries a legacy/adapter dialect;
- metadata/head ownership is not fully drained from local templates/client compatibility;
- refinement/final layers still need absorption.

## Phase 2 — Foundation Consolidation — COMPLETE within approved scope

Implemented:

- `base.html` established as the shared foundation entry point;
- `base.css` no longer imports `tokens.css`;
- the duplicate `base.css` import path through `inner.css` was removed;
- service category/detail families stopped reloading the canonical shell;
- Services stopped reloading canonical tokens/shell locally;
- foundation ownership became explicit rather than discovered through nested CSS imports.

Preserved-source global rules were deliberately not deleted wholesale because their cascade still participates in the current design.

## Phase 3 — Services Server-rendered Structure — COMPLETE

Static Services content/structure moved from runtime JavaScript to Django markup.

Django now owns the static page data/markup that JavaScript previously constructed, including the primary chapter structure and Fast Discovery content/controls.

`services-experience.js` is interaction/state oriented and no longer owns the static service dataset, static route strings, card construction, `innerHTML` content building, or runtime `document.createElement()` card/control creation.

The chapter grid was aligned with the actual five primary chapters.

## Phase 4 — Service Category Cinema Structure — COMPLETE

Static cinema chrome was moved out of runtime construction and into server-rendered category-family markup/component structure.

The runtime keeps the behavior that actually requires JavaScript:

- Canvas drawing;
- scene selection;
- scroll progress;
- active scene/card state;
- mobile/desktop cinematic state;
- reading mode;
- `inert` / `aria-hidden` state;
- resize/visibility scheduling;
- reduced-motion behavior.

No-JS/fallback behavior was hardened so the cinematic chrome does not appear as an orphaned UI before successful enhancement.

The historical Phases 2–4 implementation record remains in:

- `docs/ui-ux/frontend-consolidation-phases-2-4.md`

## Phase 5 — Known Asset Ownership — COMPLETE for known route assets

The refactor removed known page asset discovery/injection from runtime paths that should not own it.

Completed direction:

- Django declares route-known CSS/JS;
- `page-shell.js` is no longer the owner of injecting known enhancement scripts;
- `approved-source.js` no longer owns injecting Services/Ecommerce known CSS/JS;
- server-known assets are represented through centralized route style/runtime components instead of being inferred after page load.

Key current ownership components include:

- `templates/public_preview/components/route_styles.html`
- `templates/public_preview/components/runtime_scripts.html`
- `templates/public_preview/components/route_foundation_styles.html`

Legacy compatibility code can remain only when it is genuinely handling legacy output, not as the normal asset graph.

## Phase 6 — Deferred CSS ownership / runtime inference removal — COMPLETE for the migrated mechanism

The old client-side deferred stylesheet filename inference in `runtime.html` was removed from the normal route asset path.

Django now declares the deferred companions that are known at render time, using the shared deferred stylesheet mechanism rather than runtime filename guessing.

Additional cleanup completed later in the same workstream:

- the hidden `@import` chain in `inner.css` was reduced/removed from the foundation path;
- `platform.css` became an explicit route-foundation dependency for routes that actually consume it;
- the dead/unconsumed `category-signatures.css` path was removed from normal route loading;
- route asset ownership tests were updated so they evaluate central conditional Django asset components instead of assuming every asset literal must live inside each leaf template.

Important: the existence of `*-deferred.css` files is not itself a bug. Remaining work is to ensure they contain only appropriate noncritical paint/polish and do not remain permanent cross-route override layers.

## Phase 7 — Reveal / Motion ownership — PARTIALLY CONSOLIDATED, architecture direction established

Completed:

- `reveal.js` exists as the canonical generic reveal runtime for migrated routes;
- the generic reveal observer was removed/suppressed from `approved-source.js`;
- legacy fallback paths were guarded so the canonical reveal owner can suppress duplicate generic observers;
- declaration order was corrected so the canonical owner is known before later deferred runtimes execute.

Intentionally preserved for later source-runtime drainage:

- Home/Services/Tharaa still contain page/source-specific motion/reveal behavior tied to their cinematic runtimes.

Target remains:

- one generic reveal owner;
- page-specific GSAP/canvas/cinematic motion only where it represents genuine scene behavior, not another generic reveal engine.

## Phase 8 — FAQ / Disclosure ownership — CONSOLIDATED to the canonical disclosure owner, legacy code still to be drained

Completed:

- `disclosure.js` became the sitewide page FAQ/disclosure owner;
- compatibility dataset guards suppress legacy FAQ fallbacks in old runtimes;
- the Service Detail primitive runtime is guarded from adding a second listener to already-owned disclosure elements;
- the canonical disclosure runtime was explicitly prevented from claiming `.ibt-shell-mobile-group` / shell-owned `<details>` structures;
- the old shell/page fallback behaviors can remain only as guarded compatibility code until the later source-runtime cleanup deletes them.

Target remains native `<details>/<summary>` where appropriate, otherwise one dedicated disclosure runtime.

---

# 4. QA / contract corrections completed during the same workstream

These are not the main architectural goal, but they are important safeguards for the refactor.

Completed:

- fixed a Ruff blocker in `metadata.py`;
- updated Django template ownership guards to understand the approved server-rendered cinema structure without opening arbitrary include ownership;
- upgraded route asset verification so central `page_key`-conditioned asset components are evaluated as rendered ownership instead of raw text counts;
- added/updated runtime ownership regression tests for dynamic asset injection, reveal/disclosure ownership, and route-known asset behavior;
- corrected the old Frontend Ownership workflow that previously expected legacy `.html` routes inside `services-experience.js`; it now protects the new interaction-only runtime direction;
- Browser QA moved to a reproducible hosted Chrome environment;
- Browser QA cleanup/exit behavior was hardened;
- Visual UI QA artifacts exist for representative desktop/mobile routes;
- Release Quality QA includes Axe WCAG and Lighthouse evidence;
- Contact metadata/indexability was corrected so the public contact route is no longer intentionally `noindex`;
- duplicate shell loading on Contact was removed;
- route/foundation CSS discovery was made more explicit.

The presence of successful QA does **not** mean the legacy consolidation is finished. QA is a guard against regression while ownership is being reduced.

---

# 5. Current canonical ownership map

| Concern | Canonical owner / direction | Current residual debt |
|---|---|---|
| Global tokens | `tokens.css` | source page `:root` systems and local legacy tokens still need extraction |
| Reset/document defaults | `base.css` | preserved source resets/body defaults remain |
| Typography | `typography-system.css` + critical font minimum | source typography and duplicate font-face declarations remain |
| Shared components/buttons/forms | `components.css` | source/refinement component copies remain |
| Header/Mega/Mobile/Footer | `ibtikar-shell.css` + shell templates + `ibtikar-shell.js` | shell CSS still contains an internal later refinement pass; some source/refinement shell copies remain |
| Generic reveal | `reveal.js` | preserved source runtimes still need drainage |
| FAQ/disclosure | `disclosure.js` / native `<details>` | guarded legacy FAQ code remains in old runtimes |
| Route-known CSS/JS | Django route components | legacy compatibility code still needs retirement |
| Services static structure | Django `services.html` / family markup | source CSS/JS still contains broader legacy responsibilities |
| Services interaction | `services-experience.js` | source Services runtime still needs responsibility reduction |
| Service-category cinema behavior | `service-cinema.js` | verify final static chrome has no residual runtime construction elsewhere |
| Service-detail presentation | `commerce-service-detail.css` direction | Product Page still loads/depends on large legacy `source-product-page.css` dialect |
| Metadata/head | `metadata.py` + `document_head.html` | local page meta/client compatibility remains to drain |
| Critical first view | `critical_styles.html` | file has grown into a shadow design-system layer and must later be reduced |

---

# 6. Work that must NOT be repeated

Do not re-introduce or redo the following solved directions:

1. Do not move Services static card/chapter content back into JavaScript.
2. Do not make `services-experience.js` own route strings or `.html` links again.
3. Do not restore runtime known-asset injection to `approved-source.js`, `page-shell.js`, or `runtime.html`.
4. Do not add a second generic reveal observer beside `reveal.js`.
5. Do not add a second FAQ/disclosure owner beside `disclosure.js` / native disclosure markup.
6. Do not make shell JS own page FAQ behavior.
7. Do not reload canonical shell/tokens locally in page families without a proven exception.
8. Do not add new `final`, `fix`, `refinement-v3`, or `final-final` files.
9. Do not use `!important` as the default solution to ownership/cascade conflicts.
10. Do not replace Django URLs with legacy `.html` internal routes.
11. Do not merge/deploy while this consolidation workstream remains Draft unless explicitly approved.

---

# 7. Remaining architectural debt — priority order

This is the next work queue. Performance tuning is secondary to the ownership cleanup described here unless a change is required to preserve first-view geometry during a refactor.

## P0 — Source Product Page drainage

Primary files:

- `source-product-page.css`
- `commerce-service-detail.css`
- Product Page service-detail templates/runtimes

Required work:

- inventory duplicate reset/tokens/container/buttons/header/nav/forms/dialog/FAQ/detail rules;
- extract any still-used Phosphor/icon-font contract to a dedicated owner if required;
- converge product detail presentation on the canonical service-detail owner;
- preserve product-specific art direction;
- remove legacy copies only after their effective values are moved;
- do not delete the entire source file in one step.

## P1 — Services source CSS drainage

Primary file:

- `source-services.css`

Remove/migrate duplicated global concerns:

- `:root` global tokens;
- reset/body defaults;
- `.container`;
- shared buttons;
- shared shell/navigation;
- shared typography/forms.

Keep only genuine Services composition, cinematic geometry, stage/canvas visuals and route-specific responsive behavior.

## P2 — Home source CSS drainage

Primary file:

- `source-home.css`

Same rule as Services: remove global design-system responsibilities while preserving Home art direction and cinematic composition.

## P3 — Shell internal consolidation

Primary file:

- `ibtikar-shell.css`

Merge the effective later shell refinement values into the original canonical declarations, then delete the duplicate internal override pass. Reduce conflict-driven `!important` usage.

## P4 — Transitional UX system drainage

Primary file:

- `ux-system-v1.css`

Move every rule to its real owner (`tokens`, `base`, `typography`, `components`, `shell`, or page family). Target outcome: drain and delete.

## P5 — `frontend-final.css` absorption

Do not keep a permanent “final pass” architecture. Move valid effective rules into their canonical owners and remove the duplicate final-layer selectors.

## P6 — Launch/refinement layer absorption

Primary debt includes:

- `launch-readiness.css`
- `launch-readiness-deferred.css`
- `section-layout-refinement-v2.css`
- `section-layout-refinement-v2-deferred.css`
- other active `refinement-v1`, `fix`, and historical polish layers

Rule: move effective values to the true owner; do not create another refinement sibling.

## P7 — Critical CSS reduction

Primary file:

- `critical_styles.html`

Keep only true first-paint requirements:

- critical font declarations;
- FOUC prevention;
- first-view geometry;
- LCP/CLS reservation.

Move full component/page styling back to the canonical owner so critical CSS does not become a second copy of page design.

## P8 — JavaScript legacy drainage / `approved-source.js` retirement

Remove or migrate runtime behaviors that still:

- replace server-known text;
- replace server-known hrefs;
- remove static DOM that Django could omit;
- construct static UI;
- repair output that can be correct at render time.

Target: small justified compatibility adapter or complete retirement.

## P9 — Service Detail family convergence

Converge Product Page and generic service detail on one DOM/component vocabulary while preserving intentional product-specific visuals. Remove adapter CSS/JS once all consumers use the canonical family contract.

## P10 — Head / metadata / legacy route cleanup

One server owner for:

- viewport;
- description;
- canonical;
- OG URLs;
- favicon;
- theme color;
- font/LCP preloads.

New internal links use Django URLs. Legacy URL compatibility is inbound-only.

## P11 — Final ownership audit

Search the current branch for:

- duplicate selectors;
- duplicate `@font-face`;
- duplicate `:root` global systems;
- duplicate reset/body/container/button systems;
- duplicate shell ownership;
- duplicate FAQ listeners;
- duplicate generic reveal observers;
- duplicate smooth-scroll providers per page;
- runtime static DOM generation;
- runtime static URL/text rewriting;
- internal legacy `.html` routes;
- dead CSS/JS/files;
- orphan selectors/DOM hooks;
- active refinement/final/fix layers;
- unnecessary conflict-driven `!important`.

Exit criterion: every architectural concern can be written as:

```text
Concern → ONE OWNER
```

---

# 8. Required execution method for all remaining phases

Use a strangler refactor, never a blind rewrite:

```text
inspect current definitions
  ↓
identify actual effective visual result
  ↓
choose canonical owner
  ↓
move/copy the effective value/behavior to the canonical owner
  ↓
preserve DOM/data/ARIA/JS hooks
  ↓
remove one legacy owner
  ↓
review the diff
  ↓
continue
```

Do not judge success by file count or line count. Success means the same approved interface and behavior with fewer owners and less duplication.

If a refactor causes a visual regression, fix the canonical owner. Do not add a new patch layer.

---

# 9. Safety boundaries

Do not during this consolidation:

- rewrite backend business logic;
- change models/migrations because of frontend cleanup;
- reset/clean unrelated worktrees;
- merge the Draft PR;
- deploy;
- remove cinematic behavior to simplify code;
- remove mobile cinematic adaptation;
- change product copy/content unless correcting a proven source-of-truth issue;
- remove accessibility state/keyboard/reduced-motion behavior.

Any future agent should re-read the latest branch HEAD before editing a file. Never rewrite a file from truncated output or an old conversation snapshot.

---

# 10. Current practical next step

The recommended next implementation phase is:

**Source Product Page drainage**, because it is the largest remaining parallel frontend dialect and blocks clean service-detail ownership.

Before touching it:

1. fetch the latest current file versions;
2. inventory all selectors/responsibilities consumed by the current Product Page template;
3. separate shared/global primitives from product-only composition;
4. identify icon-font dependencies;
5. move one responsibility at a time;
6. preserve the effective design exactly;
7. delete legacy copies only after ownership transfer.

After that, continue in the priority order in Section 7.
