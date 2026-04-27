# HAMA LMS — Systemwide Brand Integration Audit
**Framework:** VIBE (Visual Mapping, Integration Opportunities, Brand Behavior, Enhancement Strategy)  
**Scope:** LMS web app + public landing surfaces  
**Objective:** Integrate HAMA logo systemwide with premium visibility and subtlety balance

---

## 1) UI Surface Map

### A. Navbar (Public Landing)
- **Current**
  - Logo is present on left via reusable `Monogram` component.
  - Language toggle is visible and mobile-friendly.
- **Observed**
  - Good primary visibility.
  - Inconsistency with internal app header (logo+text treatment differs by surface).
- **Reference**
  - `components/LandingPage.tsx`

### B. Sidebar (App Shell)
- **Current**
  - Expanded: logo + text lockup (`HAMA`, `Student Portal`).
  - Collapsed: icon/logo only.
- **Observed**
  - Good behavior by state, but text lockup can conflict with evolving product voice.
- **Reference**
  - `components/Layout.tsx`

### C. Dashboard
- **Current**
  - Subtle logo usage in header/welcome area.
- **Observed**
  - Correct content-first restraint.
  - Could be standardized as single brand anchor only.
- **Reference**
  - `components/Dashboard.tsx`

### D. Auth Pages (Login/Signup)
- **Current**
  - Strong expressive branding above form with glow.
- **Observed**
  - Correct high-expression zone.
- **Reference**
  - `components/Login.tsx`, `components/Signup.tsx`

### E. Course Pages (Player + Modules + Progress)
- **Current**
  - Focus remains on content; no heavy persistent logo in lesson body.
  - Text references to HAMA exist in metadata/labels.
- **Observed**
  - Correct low-noise approach for learning focus mode.
- **Reference**
  - `components/CourseList.tsx`, `components/PublicCoursePreview.tsx`

### F. Footer
- **Current**
  - Logo appears with brand text in landing footer.
- **Observed**
  - Appropriate reinforcement placement.
- **Reference**
  - `components/LandingPage.tsx`

### G. Modals/Popups
- **Current**
  - Preview/video modals are mostly content-first.
  - Certificate preview still references legacy logo asset in several places.
- **Observed**
  - Main inconsistency hotspot in branding assets.
- **Reference**
  - `components/CertificatePreview.tsx`

### H. Loading States / Splash
- **Current**
  - Generic spinners across auth/admin flows.
- **Observed**
  - No branded loading behavior yet (opportunity).
- **Reference**
  - `components/Login.tsx`, `components/Signup.tsx`, `components/QuizManagement.tsx`, etc.

### I. Mobile vs Desktop
- **Current**
  - Mobile has visible logo + language toggle in key places.
- **Observed**
  - Strong baseline; needs consistent size/opacity hierarchy across breakpoints.

---

## 2) Recommended Logo Placement Strategy

## Primary (Always Visible, Low-Noise)
1. Public landing navbar (left brand anchor).
2. Internal app header (top shell).
3. Sidebar header (single canonical anchor).
4. Auth form header (login/signup).

## Secondary (Reinforcement)
1. Landing footer brand block.
2. Dashboard top section (single subtle logo marker).
3. Public course preview header/media block.

## Passive (Ambient, Minimal)
1. Certificate watermark (very low opacity).
2. Optional player watermark in idle/paused states only.
3. Branded skeleton/loading mark at low opacity.

## Do Not Place (Avoid Noise)
1. Every dashboard widget card.
2. Quiz question body/content panes.
3. Notification list rows.
4. Repeated decorative logos within same viewport section.

---

## 3) Logo Variants Needed

1. **Full horizontal lockup**
   - Use: auth hero, desktop sidebar expanded, footer lockup.
2. **Icon-only monogram**
   - Use: mobile headers, compact nav, collapsed sidebar, utility contexts.
3. **Monochrome light-on-dark**
   - Main app dark surfaces.
4. **Monochrome dark-on-light**
   - Certificate/print/light surfaces.
5. **Favicon/App icon set**
   - 16/32/48/180/192/512 variants from the new master asset.
6. **Watermark variant**
   - Single-color low-contrast, optimized for ultra-low opacity backgrounds.

---

## 4) Behavior Rules (Size, Spacing, Responsiveness)

## Size Tiers
- `xs`: 20-24px (inline utility)
- `sm`: 28-32px (mobile nav/header)
- `md`: 36-44px (desktop header)
- `lg`: 56-72px (auth expressive brand moments)

## Spacing
- Clearspace minimum: `0.5x` logo height on all sides.
- Minimum gap from adjacent text/controls: 8px.

## Visual Intensity
- **Default:** clean, no aggressive glow.
- **Glow:** only in primary brand moments (landing nav, auth top).
- **Subtle:** 60-80% opacity in passive placements.

## Interaction
- Clickable logos route to contextual home (`/` or `/dashboard`).
- Hover behavior should be external glow/brightness only.
- Avoid fill-flooding effects that reduce logo legibility.

## Responsive Rules
- Mobile: icon-first, no cramped text lockups.
- Desktop expanded states may show lockup text.
- Preserve aspect ratio always (`object-contain`, width auto).

---

## 5) Systemwide Branding Guidelines (Actionable)

1. Use one canonical reusable brand component for logo rendering everywhere.
2. Remove direct ad-hoc logo `<img>` usage in product surfaces.
3. Keep one brand anchor per major viewport section.
4. Standardize naming language:
   - Decide canonical UI naming (`HAMA Academy` vs `HAMA Studio`) and apply consistently.
5. Keep course/player surfaces content-first:
   - branding should assist trust, never compete with learning content.
6. Accessibility:
   - informative logo instances: meaningful `alt`
   - decorative/watermark logo instances: `aria-hidden="true"`
7. Keep glow restrained and context-based.
8. Avoid mixed old/new assets in active UI.

---

## 6) Optional Enhancements (Subtle, Premium)

1. **Branded loading pulse**
   - Tiny monogram pulse for page-level loads only.
2. **Certificate watermark refresh**
   - Replace legacy watermark image with new logo watermark variant.
3. **Micro-interaction polish**
   - Soft hover glow/brightness in navbar and auth logo only.
4. **Focus-mode player branding**
   - Tiny passive top-corner mark when controls are visible.
5. **PWA icon readiness**
   - Generate proper app icon pack and manifest entries.

---

## Priority Fix List (Recommended Execution Order)

## Phase 1 — Consistency
1. Replace legacy logo asset usage in certificate surfaces.
2. Unify logo variant usage in app shell + landing + auth.
3. Standardize alt labels and brand naming copy.

## Phase 2 — Behavior
1. Enforce shared size/spacing rules via brand component props.
2. Normalize glow rules (only primary moments).

## Phase 3 — Enhancements
1. Add optional branded loading state.
2. Add passive watermark variants where appropriate.

---

## Key Risk Controls
- Prioritize subtlety over dominance.
- Preserve readability and content hierarchy.
- Keep glassmorphism-compatible contrast.
- Avoid decorative overuse that weakens conversion or focus.

---

## Audit Outcome
HAMA already has a strong reusable branding base (`Monogram`) and good high-impact placements.  
Main opportunity is **systemwide consistency** (especially legacy logo remnants and variant discipline), not increased logo volume.
