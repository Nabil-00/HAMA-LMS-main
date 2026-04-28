# LandingPage Audit

## Scope

- Audited `components/LandingPage.tsx`
- Included imported/related data sources used by the page:
  - `types.ts`
  - `services/courseService.ts`
  - `utils/coursePreviewVideo.ts`
  - `schema.sql`
  - `contexts/LanguageContext.tsx`

## Section Inventory (render order)

1. `LandingNavbar`
   - Defined: `components/LandingPage.tsx:49-126`
   - Rendered: `components/LandingPage.tsx:516`
2. `HeroSection`
   - Defined: `components/LandingPage.tsx:128-206`
   - Rendered: `components/LandingPage.tsx:517`
3. `TrustStrip`
   - Defined: `components/LandingPage.tsx:208-228`
   - Rendered: `components/LandingPage.tsx:518`
4. `FeaturedCourses`
   - Defined: `components/LandingPage.tsx:230-336`
   - Rendered: `components/LandingPage.tsx:519-524`
5. `WhyHama`
   - Defined: `components/LandingPage.tsx:338-371`
   - Rendered: `components/LandingPage.tsx:525`
6. `PlatformFeatures`
   - Defined: `components/LandingPage.tsx:373-396`
   - Rendered: `components/LandingPage.tsx:526`
7. `CtaModule`
   - Defined: `components/LandingPage.tsx:398-417`
   - Rendered: `components/LandingPage.tsx:527`
8. `Footer`
   - Defined: `components/LandingPage.tsx:419-455`
   - Rendered: `components/LandingPage.tsx:528`
9. Preview modal overlay (conditional block)
   - Defined/rendered inline: `components/LandingPage.tsx:531-566`

## Course Card Data Shape

Fields used directly in the catalog grid (`FeaturedCourses`):

- `id: string`
- `title: string`
- `description: string`
- `thumbnailUrl: string`
- `isFree: boolean`
- `price: number | undefined`
- `modules: Module[]` (indirectly for preview resolution)

Optional preview-related fields read by `resolvePreviewVideoId`:

- `previewVideoId?: string`
- `preview_video_id?: string`
- `previewVideoUrl?: string`
- `preview_video_url?: string`

Additional course fields available from type/service layer (`types.ts`, `services/courseService.ts`):

- `author: string`
- `status: CourseStatus`
- `lastModified: string`
- `tags: string[]`
- `defaultLocale: string`
- `supportedLocales: string[]`
- `localizations: Record<string, LocalizedContent>`
- `currentVersion: string`
- `versions: CourseVersion[]`

## Instructor Data

- No standalone `instructors` table found.
- Instructor/author relationship is represented by:
  - `courses.author_id` -> `profiles.id` (`schema.sql`)
  - `getCourses()` joins `profiles:author_id(name)` and maps `author` fallback.
- `profiles.role` supports `Teacher`, but there is no dedicated instructor entity/table.

## Testimonials / Reviews

- No `reviews`, `testimonials`, or `ratings` table found in schema.
- No Supabase queries to such tables in service layer.
- No review/testimonial UI found in `LandingPage.tsx`.

## Hero Stats Card Data Source

- Hero stat cards are not fetched from Supabase.
- Content comes from language translation keys (`t('hero.card_*')`) in `HeroSection`.
- Translation source is local JSON via `LanguageContext`.

## Current Imports in `LandingPage.tsx`

Animation:

- `framer-motion` (`motion`)

UI / routing:

- `react-router-dom` (`Link`, `useNavigate`)

Icons:

- `./icons/HamaUIIcons`: `ArrowRight`, `CheckCircle2`, `Menu`, `Play`, `X`
- `./icons`: `HamaCertificateIcon`, `HamaCoursesIcon`, `HamaProgressIcon`, `HamaUserIcon`

Other UI sub-components:

- `LanguageToggle`
- `BrandLogo`

## Filter Pills

- No category filter pills are implemented in `LandingPage.tsx`.
- The nearest pill-like elements are TrustStrip items (4 items) sourced from translation keys but structurally fixed.

## Line Count

- `components/LandingPage.tsx` line count: **571** (`wc -l`)
