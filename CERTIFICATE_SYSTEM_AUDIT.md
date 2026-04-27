# Certificate System Audit

Date: 2026-04-25

## 1) Component that renders the Certificate of Completion

### Active course-completion certificate UI
- `components/QuizPlayer.tsx`
  - Renders the completion certificate block after a passing quiz.
  - Key render area: near `Certificate of Completion` heading in the pass state.

### Dedicated certificate preview/template component
- `components/CertificatePreview.tsx`
  - Also renders a full `Certificate of Completion` paper template.
  - Used as a modal-style preview (currently from dashboard flow).

### Additional certificate display component (appears unused)
- `components/CertificateDisplay.tsx`
  - Renders certificate UI and actions, but no active imports/usages were found.

## 2) Wrapper/page that contains the certificate completion view

- Route wrapper: `App.tsx`
  - `QuizPlayerWrapper` reads route/query params and passes props to `QuizPlayer`.
  - Route: `/quiz/:quizId`.
- Completion view host: `components/QuizPlayer.tsx`
  - The pass result state shows certificate name confirmation and then certificate UI.

## 3) How certificate data is passed (source + shape)

### Entry and prop flow
- `App.tsx` passes:
  - `quizId` from route param (`/quiz/:quizId`)
  - `courseId` and `courseName` from query params
- These are passed to `QuizPlayer` via props.

### Runtime certificate data source
- `QuizPlayer` uses `useQuiz()` hook state (local hook state, not a global store).
- `useQuiz.loadCertificate(courseId)` -> `quizService.getUserCertificate(courseId)`.
- `quizService.getUserCertificate` reads from Supabase table `certificates`.
- Certificate generation uses edge function call:
  - `quizService.generateCertificate(courseId, quizAttemptId)` -> `functions/v1/generate-certificate`.

### Certificate data shape
- Defined in `types.ts`:

```ts
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  certificateUrl: string | null;
  uniqueCode: string;
  quizAttemptId?: string;
}
```

### Generation request shape

```ts
{
  courseId: string;
  quizAttemptId?: string;
}
```

## 4) CSS framework / styling approach

- Primary approach: **Tailwind CSS utility classes**.
- Also used: **global custom CSS classes** in `index.css` (e.g., `.glass-card`, `.btn-primary`, `.btn-secondary`).
- Animation layer: **Framer Motion**.
- Not observed for certificate UI: CSS modules or styled-components.

## 5) Existing print/download logic

### `window.print`
- `components/CertificateDisplay.tsx` (legacy fallback path)

### `html2canvas`
- `components/CertificatePreview.tsx`
  - Fallback client-side capture of certificate DOM for PDF generation.

### `jsPDF`
- `components/CertificatePreview.tsx`
  - Builds and saves a PDF from the captured canvas.

### Download logic (`link.download`)
- `components/CertificatePreview.tsx`
- `components/CertificateDisplay.tsx`
- `services/quizService.ts` (`downloadCertificate` helper)

### Blob usage
- No explicit `Blob` / `blob` usage found in frontend TS/TSX certificate paths.

### Server-side PDF generation (additional)
- `supabase/functions/generate-certificate/index.ts`
  - Uses `pdf-lib` to generate PDF and upload to Supabase Storage.

## 6) Current certificate background/theme (hardcoded vs dynamic)

- Overall finding: **mostly hardcoded**, not theme-dynamic.

### Quiz completion certificate (`QuizPlayer`)
- Hardcoded dark/glass + gold styling and fixed decorative gradient layers.

### Certificate paper (`CertificatePreview`)
- Hardcoded white paper background, fixed gold accents, fixed watermark treatment.

### Edge function PDF template
- Hardcoded layout coordinates (`CERT_LAYOUT`) and fixed drawing positions/colors.

## 7) Full file paths of relevant files

- `/home/op7/Downloads/HAMA-LMS-main/components/QuizPlayer.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/App.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/hooks/useQuiz.ts`
- `/home/op7/Downloads/HAMA-LMS-main/services/quizService.ts`
- `/home/op7/Downloads/HAMA-LMS-main/types.ts`
- `/home/op7/Downloads/HAMA-LMS-main/components/CertificatePreview.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/components/CertificateDisplay.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/components/CertificateVerification.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/components/Dashboard.tsx`
- `/home/op7/Downloads/HAMA-LMS-main/supabase/functions/generate-certificate/index.ts`
- `/home/op7/Downloads/HAMA-LMS-main/supabase/functions/verify-certificate/index.ts`
- `/home/op7/Downloads/HAMA-LMS-main/index.css`
