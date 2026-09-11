# Ibtikar Tech — Master UX/UI & Frontend Architecture Audit

## 0. Audit Metadata

| Property | Value |
|----------|-------|
| **Audit Date** | 2026-09-11 |
| **Repository Root** | `/mnt/e/projects/ابتكار تك/ibtikartech-dashboard-main/ibtikartech-dashboard` |
| **Git Branch** | Current working branch (detached from origin/main at baseline `83f1ddfecb0b0f7478a335030bf79989808ed9df`) |
| **Working-Tree State** | Dirty — 56 modified files from prior Codex/Kilo/OpenCode work (cinematic integration branch) |
| **Approved Cinematic Reference** | `ibtikar-services-cinematic-mobile-v5 (13).html` at repository root (1.2 MB, untracked, unchanged) |
| **Audit Scope** | Entire public-facing platform: public_preview (static templates), DB-driven services, Wagtail CMS pages, customer portal, support portal, control panel operational views |
| **Areas Excluded** | Internal admin/Wagtail UI (standard Django/Wagtail admin), dev container config, CI/CD workflows, test infrastructure, VM preferences file, legacy merchant images HTML |
| **Browser/Visual Inspection** | NOT performed in this audit — relied on code inspection, template contracts, and existing QA script results (service_cinema_qa.cjs: 60 route/viewport combinations tested) |
| **Tools/Checks Used** | `git status/diff`, code exploration (glob/grep/read), template contract verification (`verify_django_template_contract.py`), frontend ownership verification (`verify_frontend_single_repo_ownership.py`), pytest (158 tests passed), Django check/makemigrations, Node syntax checks |

---

## 1. Executive Assessment

### Overall UX/UI Maturity
**Moderate-High.** The platform has a well-structured modular monolith with clear page families, a token-based design system, and sophisticated cinematic storytelling on key pages. However, the system has accumulated significant CSS/JS duplication through iterative refinement layers (`-v1`, `-refinement`, `-completion`, `-final` files) and lacks canonical shared components for repeated patterns (FAQ, Process, CTA, Section Heading, Cards, Trust/Proof).

### Overall Frontend Architecture Condition
**Fragmented but functional.** Three distinct rendering paths coexist:
1. **Static preview templates** (`public_preview/base.html` family) — marketing/demo pages
2. **DB-driven service catalog** (`layouts/public_base.html` family) — production service pages
3. **Wagtail CMS pages** (`content/standard_page.html` family) — content-managed pages

Each path has partial CSS/JS overlap but separate ownership, causing duplication and inconsistency.

### Biggest Systemic Weaknesses
| Weakness | Evidence |
|----------|----------|
| **CSS patch-layer proliferation** | 40+ page-scoped CSS files with `-refinement`, `-completion`, `-final`, `-v1` suffixes; `!important` chains; override-on-override |
| **No canonical shared components** | FAQ implemented 4+ times (service-category.css, inner.css, articles.css, service-detail); Process/Journey 3+ times; CTA 5+ variants |
| **CSS ownership ambiguity** | Global components (buttons, cards, forms) redefined in page-family and page-specific CSS |
| **JS duplication** | FAQ accordion logic in `app.js`, `ibtikar-shell.js`, `commerce-service-detail.js`, `articles.js`; carousel logic in `service-related-cards.js`, `source-home.js`, `source-services.js` |
| **Cinematic system isolation** | `service-cinema.js` (category), `source-home.js`, `source-services.js`, `source-tharaa.js`, `tharaa-preview.js` — similar patterns, no shared primitives |
| **Template contract drift** | `public_preview/base.html` vs `layouts/public_base.html` vs `layouts/portal_base.html` — different header/footer/component includes |

### Biggest Strengths Worth Preserving
| Strength | Evidence |
|----------|----------|
| **Design token foundation** | `tokens.css` comprehensive (colors, spacing, typography, shadows, z-index, motion tokens) |
| **Cinematic storytelling capability** | `service-cinema.js` + reference HTML demonstrate sophisticated scroll-driven narrative |
| **Service catalog domain model** | Clean `ServiceCategory → Service` with price types, deliverables, process, gallery, actions |
| **CRM-first contact resolution** | Guest/authenticated inquiry flow with contact linking, consent audit trail |
| **Template contract verification** | Automated `verify_django_template_contract.py` (22/22 passing) |
| **Wagtail integration** | Clean separation: business models independent of page tree; ModelViewSets for catalog admin |
| **RTL-first approach** | `dir="rtl"` on html, logical properties in CSS, Arabic typography scale |

### Main Causes of Inconsistency
1. **Iterative refinement without consolidation** — Each feature added new CSS/JS files rather than extending shared primitives
2. **Parallel template families** — Three base templates with divergent component includes
3. **Page-scoped CSS loading** — Family templates load page-specific CSS via `page_refinements` block, encouraging page-level overrides
4. **No component registry** — No single source of truth for "how does a button/card/FAQ look and behave"

### Highest-Priority Opportunities
1. **Consolidate CSS into token → foundation → primitive → component → shared-section → page layers** (eliminate patch files)
2. **Extract canonical shared components**: FAQ, Process/Journey, Section Heading, CTA, Card, Button, Trust/Proof, Related Content
3. **Unify cinematic/motion system** into shared primitives + page composition
4. **Merge template families** or establish clear contracts between them
5. **Establish component ownership** with single CSS/JS/template owners per pattern

---

## 2. Product Surface Map

| Page Family | Routes | Rendering Source | Base Template | Data Source | Production Status | Notes |
|-------------|--------|------------------|---------------|-------------|-------------------|-------|
| **Home** | `/` | `public_preview.views.home` | `public_preview/base.html` | Static + Wagtail `HomePage` (optional) | Live (preview) | Cinematic 6-scene hero; services orbit; portfolio; testimonials; FAQ; CTA |
| **Services Index (Preview)** | `/services/` | `services.public_views.services` | `public_preview/base.html` | Static template | Live (preview) | Goal-based selector; interactive service lab; decision panels |
| **Services Index (DB)** | `/services/` | `services.views.service_index` | `layouts/public_base.html` | `ServiceCategory` + `Service` models | Production | Category grid with service cards; Wagtail-managed |
| **Service Category Pages** | `/ecommerce/`, `/websites/`, `/brand-content/`, `/growth/`, `/custom-systems/` | `public_preview.views.{category}` | `service_category_base.html` | Static templates | Live (preview) | Cinematic paths section; commerce health lab (ecommerce); platforms; FAQ; related |
| **Service Detail Pages (Preview)** | `/services/store-launch/`, `/services/storefront-customization/`, etc. (6 routes) | `services.public_views.{service}` | `service_detail_base.html` | Static templates | Live (preview) | Hero tilt; decision tabs; scope toggle; gallery; related services |
| **Service Detail Pages (DB)** | `/services/<slug>/`, `/services/<slug>/request/` | `services.views.service_detail/request` | `layouts/public_base.html` | `Service` model + inquiry form | Production | Pricing, deliverables, process, action button (WhatsApp/Checkout/Inquiry) |
| **Tharaa Product** | `/tharaa/` | `public_preview.views.tharaa` | `public_preview/base.html` | Static + Wagtail `TharaaPage` | Live (preview) | Immersive lab; feature grid; pricing; FAQ; support CTA |
| **Portfolio / Case Studies** | `/portfolio/`, `/portfolio/<slug>/` | `public_preview.views.portfolio` + Wagtail `CaseStudyPage` | `public_preview/base.html` / `content/standard_page.html` | Mixed | Mixed | Preview static; production via Wagtail |
| **Knowledge / Articles** | `/knowledge/`, `/knowledge/product-page/`, etc. | `public_preview.views.knowledge/article_*` | `public_preview/base.html` / `article_detail_base.html` | Static templates | Live (preview) | Article list + 3 detail pages; reading progress; related |
| **About** | `/about/` | `public_preview.views.about` | `public_preview/base.html` | Static / Wagtail `AboutPage` | Mixed | |
| **Contact** | `/contact/` | `public_preview.views.contact` | `public_preview/base.html` | Form → `Inquiry` model | Live (preview) | Multi-step form; analytics; rate limiting |
| **Customer Portal** | `/portal/`, `/portal/saved-services/`, `/portal/inquiries/`, `/portal/quotes/`, `/portal/projects/`, `/portal/stores/`, `/portal/profile/` | `customer_portal.views.*` | `layouts/portal_base.html` | CRM models (Contact, Inquiry, Quote, Project, Store) | Production | Auth required; dashboard UX |
| **Support Portal** | `/portal/support/tickets/`, `/portal/support/tickets/<id>/` | `customer_portal.views.tickets/ticket_detail` | `layouts/portal_base.html` | Ticket models | Production | |
| **Control Panel (Services Catalog)** | `/control/services/services/`, `/control/services/servicecategory/` | `ServiceViewSet`, `ServiceCategoryViewSet` | Wagtail Admin + custom | `Service`, `ServiceCategory` | Production | ModelViewSet CRUD; search, filter, ordering |
| **Control Panel (CRM 360)** | `/control/crm/360/`, `/control/crm/360/<id>/` | `core.control_views.customer360_*` | `control/crm/base.html` | `Contact`, `Organization`, `Store`, `ConsentRecord`, `ActivityEvent` | Production | Operational CRM view |
| **Control Panel (Consent/Activity)** | `/control/crm/consent/`, `/control/crm/activity/` | `core.control_views.consent_*/activity_*` | `control/crm/base.html` | `ConsentRecord`, `ActivityEvent` | Production | Audit/log views |
| **Wagtail CMS Pages** | Catch-all (various) | Wagtail page serving | `content/standard_page.html` | Page models | Production | SolutionPage, PlatformPage, ArticlePage, LegalPage, LandingPage |

---

## 3. Route → Template → Asset Architecture

### Major Production Routes Traced

#### Home (`/`)
```
Route: / → public_preview.views.home
Template: public_preview/pages/index.html
Base: public_preview/base.html
Components:
  - hero (cinematic, 6 scenes via source-home.js)
  - services-orbit (interactive cards via source-services.js)
  - journey (5-step process)
  - portfolio (carousel)
  - tharaa-teaser
  - testimonials
  - pricing
  - FAQ (accordion)
  - final CTA
CSS: tokens.css, ibtikar-shell.css, base.css, components.css, pages.css, inner.css,
     homepage-surface-refinement-v1.css, homepage-refinement-v1.css,
     homepage-production-qa-v1.css, homepage-experience-v2.css,
     conversion-funnel.css, continuous-flow.css, launch-readiness.css,
     frontend-final.css, approved-source.css, section-layout-refinement-v2.css,
     ux-system-v1.css, typography-system.css, mobile-action-pairs-v1.css,
     strategy-enhancements.css
JS: page-shell.js → loads: site-config.js, ibtikar-shell.js, app.js, analytics.js,
    gsap-loader.js, gsap-home.js, continuous-flow.js, frontend-final.js,
    home-enhancements.js, home-experience-v2.js, strategy-enhancements.js,
    source-home.js, source-services.js, source-tharaa.js
Data: Static template + optional Wagtail HomePage
```

#### Service Category — Ecommerce (`/ecommerce/`)
```
Route: /ecommerce/ → public_preview.views.ecommerce
Template: public_preview/pages/ecommerce.html
Base: public_preview/families/service_category_base.html
Components:
  - breadcrumb
  - platform-hero (with gallery trigger)
  - proof bar (4 items)
  - service-paths-section (cinematic via service-cinema.js, 4 paths)
  - commerce-health-lab (8-tab diagnostic with canvas visualizations)
  - solutions carousel (3 service cards)
  - journey (5-step)
  - platforms (4 cards)
  - detail comparison (image + caption)
  - approach (5-step process)
  - deliverables (6 items)
  - FAQ (details/summary)
  - related services carousel (5 cards)
  - final CTA
CSS: tokens.css, ibtikar-shell.css, base.css, components.css, pages.css, inner.css,
     service-category.css, service-category-refinement-v1.css,
     services-reference.css, continuous-flow.css, frontend-final.css,
     launch-readiness.css, conversion-funnel.css, approved-source.css,
     section-layout-refinement-v2.css, service-related-cards.css,
     service-primitives.css
JS: page-shell.js → ibtikar-shell.js, app.js, analytics.js, service-cinema.js,
    ecommerce-category.js, services-experience.js, service-related-cards.js,
    service-primitives.js
Data: Static template (no DB queries in preview)
```

#### Service Detail — Store Launch (`/services/store-launch/`)
```
Route: /services/store-launch/ → services.public_views.store_launch
Template: public_preview/pages/store-launch.html
Base: public_preview/families/service_detail_base.html
Components:
  - breadcrumb
  - hero (tilt effect via commerce-service-detail.js)
  - decision tabs (4 tabs, native details)
  - scope toggle (what's included/excluded)
  - gallery (lightbox)
  - storefront hotspots (interactive image map)
  - process (5-step)
  - deliverables
  - FAQ (accordion via service-primitives.js)
  - related services carousel
  - final CTA
CSS: tokens.css, ibtikar-shell.css, base.css, components.css, pages.css, inner.css,
     commerce-service-detail.css, continuous-flow.css, frontend-final.css,
     launch-readiness.css, section-layout-refinement-v2.css,
     service-related-cards.css, service-primitives.css,
     service-detail-refinement-v1.css, service-detail-completion-v1.css
JS: page-shell.js → ibtikar-shell.js, app.js, analytics.js,
    commerce-service-detail.js, service-related-cards.js, service-primitives.js
Data: Static template
```

#### DB-Driven Service Detail (`/services/<slug>/`)
```
Route: /services/<slug>/ → services.views.service_detail
Template: services/detail.html
Base: layouts/public_base.html
Components:
  - header (from public_base.html)
  - breadcrumb
  - service hero (image, category, pricing)
  - description
  - scope/deliverables/requirements/process (from model JSON fields)
  - action button (WhatsApp / External Checkout / Inquiry Form)
  - gallery
  - related services (from category)
  - footer
CSS: static/css/tokens.css, static/css/base.css, static/css/portal/portal.css,
     (public_preview CSS NOT loaded — separate stack)
JS: static/js/core/app.js
Data: Service model (prefetch category, gallery_data JSON)
```

#### Customer Portal Overview (`/portal/`)
```
Route: /portal/ → customer_portal.views.overview
Template: portal/overview.html
Base: layouts/portal_base.html
Components:
  - portal header (user menu, notifications)
  - stats cards (inquiries, quotes, projects, stores)
  - recent activity timeline
  - quick actions
CSS: static/css/portal/portal.css, static/css/portal/projects.css
JS: static/js/core/app.js (shared)
Data: Contact (from request.user), Inquiry, Quote, Project, Store querysets
```

---

## 4. Current Design-System Architecture

### Tokens (`static/public_preview/assets/css/tokens.css`)
**Comprehensive token system** — 200+ lines covering:
- **Colors**: Brand (cyan `#10c8e8`, purple `#7c3aed`, pink `#ec4899`, green `#20c98b`, blue `#4f7df3`), Semantic (bg, surface, surface-2, text, muted, line, border), State (success, warning, error), Overlay/Glass
- **Typography**: Font families (IBM Plex Sans Arabic), fluid type scale `--ibt-text-xs` through `--ibt-text-5xl`, display scale `--ibt-display-xs` through `--ibt-display-3xl`, line heights, font weights
- **Spacing**: `--ibt-space-1` (4px) through `--ibt-space-16` (64px), fluid `--ibt-space-fluid-*`
- **Radius**: `--ibt-radius-sm` (6px) through `--ibt-radius-full`
- **Shadows**: `--ibt-shadow-sm` through `--ibt-shadow-xl`, glow variants
- **Z-Index**: `--ibt-z-*` scale (10-100)
- **Transitions**: `--ibt-duration-fast/normal/slow`, `--ibt-ease` (cubic-bezier)
- **Breakpoints**: `--ibt-bp-sm` (480) through `--ibt-bp-2xl` (1536)
- **Container**: `--ibt-container-max` (1180px), `--ibt-container-padding`

**Issue**: Duplicate token file at `static/css/tokens.css` (minimal, for control/portal only) — divergence risk.

### Typography
- **Primary**: IBM Plex Sans Arabic (variable font, Google Fonts)
- **Display**: Same family, weight 700-900
- **Scale**: Fluid clamp() based, defined in tokens + `typography-system.css`
- **Arabic-specific**: `font-feature-settings: "cv06"`, `text-wrap: balance` on headings
- **Issues**: `typography-system.css` redefines some token values; page-specific CSS overrides heading sizes inconsistently

### Spacing
- **Token-based**: `--ibt-space-*` scale used inconsistently
- **Hardcoded values**: Many page CSS files use raw `px`/`rem` values bypassing tokens
- **Container**: `.container` = `min(var(--ibt-container-max), calc(100% - 64px))` in base.css; overridden in service-category.css to `calc(100% - 32px)` in cinematic mode

### Layout/Grid
- **Base grid**: 12-column via CSS Grid in `components.css` (`.grid`, `.grid-cols-*`)
- **Service paths grid**: Custom 12-col with span overrides in `service-category.css`
- **Cinematic layout**: Absolute positioning + sticky container + scroll progress (service-cinema.js)
- **Responsive**: Breakpoints at 480, 640, 760, 900, 1024, 1100, 1280, 1440 — inconsistent across files

### Shell (Header/Mega Menu/Mobile Menu/Footer)
- **Canonical**: `ibtikar-shell.css` + `ibtikar-shell.js` (loaded in preview family)
- **Header**: Sticky, backdrop blur, logo, main nav (5 items), CTA button, mobile menu button
- **Mega Menu**: CSS-only hover/focus, 4-column grid, service categories + links
- **Mobile Menu**: Slide-in drawer, same links, JS toggle in `ibtikar-shell.js`
- **Footer**: 4-column grid (brand, services, company, contact), social links, legal
- **Portal/Control**: Separate shells (`portal_base.html`, `control/crm/base.html`) with different headers

### Components (Defined Across Multiple Files)
| Component | Primary Definition | Overrides |
|-----------|-------------------|-----------|
| Buttons | `components.css` (`.btn`, `.btn-primary`, `.btn-outline`, `.btn-white`, `.btn-ghost`) | `service-category.css`, `commerce-service-detail.css`, `inner.css`, `approved-source.css` |
| Cards | `components.css` (`.card`, `.surface`) | `service-category.css` (`.service-path-card`, `.service-card`), `inner.css` (`.related-card`, `.service-card`), `articles.css` |
| Forms | `components.css` (`.form-group`, `.form-input`, `.form-label`, `.form-error`) | `contact.html` inline styles, `service-request` template |
| Section Heading | `inner.css` (`.section-head`, `.section-kicker`) | `service-category.css`, `service-detail`, `approved-source.css`, `source-home.css` |
| FAQ | `inner.css` (`.faq`, `.faq-item`), `service-category.css` (`.service-category-faq`), `articles.css`, `service-primitives.css` | 4+ distinct implementations |
| Process/Journey | `inner.css` (`.process`, `.journey`), `service-category.css`, `commerce-service-detail.css` | 3+ implementations |
| CTA | `components.css` (`.cta-card`), `inner.css` (`.final-cta`), page-specific | 5+ variants |
| Trust/Proof | `inner.css` (`.proof`), `ecommerce.html` inline, `service-category.css` | 3+ implementations |
| Carousel | `components.css` (`.carousel`, `.carousel-tools`), `service-related-cards.js` | Multiple JS initializations |
| Breadcrumbs | `inner.css` (`.crumb`), page templates inline | Inconsistent markup |

### Page-Family Styles
Loaded via `{% block page_refinements %}` in family templates:
- `service_category_base.html` → `service-category-refinement-v1.css`, `services-reference.css`
- `service_detail_base.html` → `service-detail-refinement-v1.css`, `service-detail-completion-v1.css`
- `index.html` → `homepage-refinement-v1.css`, `homepage-surface-refinement-v1.css`, `homepage-production-qa-v1.css`
- `tharaa.html` → `tharaa-refinement-v1.css`, `tharaa-preview.css`

### Motion
- **CSS Transitions**: `--ibt-duration-normal` (220ms), `--ibt-ease` (cubic-bezier(0.2,0,0.2,1)) — used for hover/focus states
- **Reveal Animations**: `.reveal` class + `IntersectionObserver` in `app.js` / `ibtikar-shell.js` — fade-up on scroll
- **Cinematic**: `service-cinema.js` (canvas particles, scroll-driven scenes), `source-home.js` (GSAP ScrollTrigger, 6 scenes), `source-services.js`, `source-tharaa.js`, `tharaa-preview.js`
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` blocks in 15+ CSS files — inconsistent coverage

### Themes
- **Dark-only** (primary): `--bg: #030a19`, `--surface: #071224`, `--text: #f3f5ff`
- **Light theme**: Partial support via `[data-theme="light"]` in `tokens.css` but incomplete; `homepage-surface-refinement-v1.css` has light-mode hero
- **Theme Toggle**: In `ibtikar-shell.js` — toggles `data-theme` on `html`, persists to localStorage
- **Issue**: Light theme not fully implemented across all components; cinematic sections hardcoded dark

### Responsive Architecture
- **Mobile-first tokens**: Base tokens mobile, desktop overrides via `@media (min-width: ...)`
- **Breakpoint inconsistency**: 760px, 900px, 950px, 1000px, 1024px, 1100px, 1150px, 1280px, 1440px used across files
- **Container shifts**: `calc(100% - 64px)` → `calc(100% - 32px)` → `calc(100% - 28px)` at different breakpoints
- **Cinematic responsive**: Separate static/mobile story mode at `<760px` or `<1000px` width / `<840px` height

---

