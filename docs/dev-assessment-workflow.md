# Developer Assessment Workflow — Architecture & Implementation Guide

This document defines the end-to-end workflow for streamlined developer assessments, integrating one-click auto-assessment from Developer Profiles, public developer evaluation forms, grading, email flows, and Assessments Dashboard enhancements.

## Goals

- Unify assessments with a one-click trigger from `DeveloperProfilesOverview`.
- Reuse/port Talent Tracker assessment logic (“auto-assess/snippets”) to generate initial evaluations.
- Invite developers via public evaluation form (outside admin auth).
- Grade submitted evaluations automatically; update eligibility and status.
- Centralize management in `Assessments Dashboard` with new states and actions.
- Ensure secure, auditable, and robust flows.

---

## Terminology

- Assessment: Admin-initiated evaluation record for a developer.
- Evaluation Invitation: Tokenized link sent to developer to complete public form.
- Evaluation Submission: Developer’s submitted answers/evidence.
- Auto-Assessment: Automated scoring and profile-based evaluation seeded from Tracker logic.
- Pool Eligibility: Boolean and metadata indicating talent pool readiness.

---

## High-Level User Flows

1. One-Click Auto-Assessment (Admin)

- Admin opens `DeveloperProfilesOverview` and clicks "Auto-Assess" on a profile.
- Backend creates an `Assessment` with status `auto_assessed` + initial scores using Tracker logic.
- Optionally immediately send an evaluation invite or let admin review/edit then send.

2. Invite Developer to Evaluation (Admin)

- From `AssessmentDashboard` (or profile page), admin clicks "Invite to Evaluation".
- System creates a tokenized `EvaluationInvitation` (or fields on Assessment) and emails the developer.
- Status becomes `invited` → `awaiting_submission`.

3. Developer Completes Public Evaluation (Public Route)

- Developer opens `/developer-evaluation/[token]` (public, not behind middleware auth).
- Submits form with required artifacts (answers, links, files as needed).
- Backend records `EvaluationSubmission` linked to the assessment; status `submitted`.

4. Auto Grading & Finalization (Backend + Admin)

- Grading function scores submission; updates `Assessment` with component and composite scores, recommendation, and `techPoolEligible`.
- Admin reviews results in `AssessmentDashboard`, can finalize (status `finalized`) or request revision.
- On pass + finalize, system sends acceptance + next steps email and marks developer as in the Talent Pool.

---

## Architecture Overview

- UI

  - `app/admin-dashboard/DeveloperProfilesOverview.tsx`: One-click Auto-Assess action.
  - `app/admin-dashboard/assessments/AssessmentDashboard.tsx`: Enhanced states, actions, charts.
  - `app/developer-evaluation/[token]/page.tsx`: Public evaluation form.

- Hooks/Services

  - `hooks/useAssessments.ts`: Extend with new actions (autoAssess, invite, grade, finalize, resendInvite).
  - `services/developerProfile.ts`: Expose profile fields needed by auto-assessment.
  - `services/developerAvailabilityService.ts`: Optional availability updates post-success.

- Backend/API (REST)

  - `/api/assessments` CRUD + actions.
  - `/api/evaluations` public submission endpoints.
  - `/api/notifications` email dispatch helpers (or inline within each route as needed).

- Data

  - Prisma models: Assessment, EvaluationSubmission, (optional) EvaluationInvitation/NotificationLog.

- Security
  - Middleware excludes public evaluation route by prefix.
  - Tokenized invitation with expiry + single-use semantics.
  - Rate limiting + CSRF mitigation for public POST.

---

## Prisma Data Models (Draft)

Update `prisma/schema.prisma` with the following new/updated models (exact fields may be refined during implementation):

```prisma
model Assessment {
  id                 String   @id @default(cuid())
  developerId        String
  developerEmail     String
  developerName      String?

  // Lifecycle statuses
  // draft | auto_assessed | invited | awaiting_submission | submitted | scored | finalized | rejected | withdrawn
  status             String   @default("draft")

  evaluationType     String   @default("initial") // initial | periodic | project_based | auto

  // Auto-assessment seed (from Talent Tracker logic)
  autoAssessmentData Json?

  // Scores (computed)
  technicalScore     Float?
  professionalScore  Float?
  overallScore       Float?
  recommendation     String? // approved | needs_review | probation | rejected
  techPoolEligible   Boolean  @default(false)

  // Timestamps
  invitedAt          DateTime?
  submittedAt        DateTime?
  scoredAt           DateTime?
  finalizedAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Tokenized invite (can be its own model if needed)
  inviteToken        String?  @unique
  inviteExpiresAt    DateTime?

  // Relations
  submissions        EvaluationSubmission[]
}

model EvaluationSubmission {
  id             String   @id @default(cuid())
  assessmentId   String
  assessment     Assessment @relation(fields: [assessmentId], references: [id])

  // Developer inputs
  answers        Json
  artifacts      Json?

  // System
  createdAt      DateTime @default(now())
}

model NotificationLog {
  id           String   @id @default(cuid())
  recipient    String
  type         String   // invite | result | reminder
  subject      String
  payload      Json?
  success      Boolean  @default(true)
  error        String?
  createdAt    DateTime @default(now())
}
```

Notes:

- If unique `inviteToken` per assessment is not desired, introduce a dedicated `EvaluationInvitation` with one-to-many semantics and status tracking.

---

## API Design

All responses follow `{ success: boolean, data?: any, error?: string }`.

- POST `/api/assessments/auto-assess`

  - Auth: Admin
  - Body: `{ developerId: string }`
  - Flow: Fetch profile → run auto-assessment logic → create Assessment with `status = "auto_assessed"` + seed scores/data.
  - Returns: `{ assessment }`

- POST `/api/assessments/:id/invite`

  - Auth: Admin
  - Body: `{ email?: string, expiresInHours?: number }`
  - Flow: Generates `inviteToken`, `inviteExpiresAt`, `status = invited` → send invite email → `status = awaiting_submission`.

- GET `/api/evaluations/:token` (public)

  - Returns basic metadata for the form (developer name, assessment type) if token is valid.

- POST `/api/evaluations/:token`

  - Public route, rate-limited.
  - Body: `{ answers: {...}, artifacts?: {...} }`
  - Flow: Validate token + expiry → create `EvaluationSubmission` → `status = submitted` → trigger grading.

- POST `/api/assessments/:id/grade`

  - Auth: Admin (also auto-triggered on submission)
  - Body: `{ mode?: "auto" | "manual" }`
  - Flow: Run grading function → set scores, recommendation, `techPoolEligible`, `status = scored`.

- POST `/api/assessments/:id/finalize`

  - Auth: Admin
  - Body: `{ decision: "approved" | "rejected" | "probation" | "needs_review" }`
  - Flow: Set `status = finalized` or `rejected`; optionally send result email; update Talent Pool on approved.

- POST `/api/assessments/:id/resend-invite`

  - Auth: Admin
  - Flow: Resend invite email (new token or reuse if valid).

- GET `/api/assessments`

  - Auth: Admin
  - Query: filters by status/type/search.

- GET `/api/assessments/:id`
  - Auth: Admin

---

## Middleware & Public Routes

- File: `middleware.ts`
  - Ensure the developer evaluation route is public. Options:
    - Add `'/developer-evaluation'` to `publicRoutes` so `/developer-evaluation/[token]` is public.
    - Alternatively, host under `/public/evaluation/[token]` and add `/public` prefix to `publicRoutes`.

Example addition:

```ts
// middleware.ts
const publicRoutes = [
  // ...existing
  "/developer-evaluation",
];
```

- API: Public evaluation endpoints must also be reachable without auth
  - Add `/api/evaluations` to `publicRoutes` OR handle explicitly before JWT verification in `middleware`.

---

## Grading Algorithm (Draft)

Function: `gradeSubmission(assessment: Assessment, submission: EvaluationSubmission): GradeResult`

Inputs:

- Profile-derived baseline (autoAssessmentData): skill ratings, experience, portfolio, availability.
- Submission answers: multiple-choice, free-text (scored via rubric), links.

Scoring approach:

- Technical (0–100): weighted sum of skills (from profile + tests) and code artifacts review.
- Professional (0–100): rubric on communication, teamwork, problem-solving, timeliness.
- Overall: `round(0.65 * technical + 0.35 * professional)`.
- Recommendation:
  - `overall >= 80` → `approved` + `techPoolEligible = true`
  - `70–79` → `needs_review` (manual check)
  - `60–69` → `probation` (conditional pool)
  - `< 60` → `rejected`

Outputs:

- `{ technicalScore, professionalScore, overallScore, recommendation, techPoolEligible, rubricDetails }`.

Add calibration constants and tunable weights in `services/assessmentGrader.ts`.

---

## Email Flows

Status: Implemented SMTP infrastructure + themed templates.

Implemented components:

- `lib/mailer.ts` — centralized Nodemailer transport (`sendEmail`, `verifyTransport`).
- `lib/emailTemplates.ts` — branded HTML wrapper used across notifications.
- `app/api/email/send/route.ts` — generic API to dispatch emails (used for tests and future flows).
- `app/api/feedback/route.ts` — integrated example: admin notification + user autoresponder after contact submission.

See `docs/EMAIL_SETUP.md` for environment and testing.

Templates (HTML + text) live in `lib/emailTemplates.ts` for now and can be extended with assessment-specific blocks:

- Invite Email (with token link, expiry info; CTA label: "Take Assessment")
- Reminder Email (optional; CTA label: "Resume Assessment")
- Result Email (approved/rejected/probation with next steps; CTA label: "View Details")

### Branded Templates — Implementation Notes

- **Design**: Dark glassmorphic card with header gradient (blue→purple), subtle borders/shadows.
- **Typography**: Nunito (body) and Montserrat (headings/CTAs).
- **Logo**: Pulled from `${NEXT_PUBLIC_API_URL || 'https://www.andishi.dev'}/logo.svg`. Ensure `NEXT_PUBLIC_API_URL` is set in environment if you want to override.
- **CTA Buttons**: Pill-shaped, blue background; labels as listed above.
- **URL Normalization**: All CTA links are normalized via `normalizeUrl()` to enforce `https` and `www.andishi.dev`. Relative paths like `/developer-evaluation/[token]` become `https://www.andishi.dev/developer-evaluation/[token]`.
- **Full Height**: Email `<body>` uses `min-height:100vh` to utilize full screen height where supported by clients. Some email clients may ignore viewport units; layout degrades gracefully.

Dispatch (planned integration points):

- `/api/assessments/:id/invite` → send invite (to implement)
- `/api/assessments/:id/finalize` → send result (to implement)
- Log entries in `NotificationLog` (planned).

Provider:

- Use existing email infra if present; else add Node mailer/Resend/SendGrid.
- Ensure secrets via env vars.

---

## UI/UX Changes

1. `app/admin-dashboard/DeveloperProfilesOverview.tsx`

- Add action in `renderProfileDetail()` header: `Auto-Assess` button.
- Calls `POST /api/assessments/auto-assess` with profile `developerId`.
- Show toast on success and link to the created assessment.

2. `app/admin-dashboard/assessments/AssessmentDashboard.tsx`

- Status chips expanded: `invited`, `awaiting_submission`, `submitted`, `scored`, `finalized`.
- Actions per card:
  - Invite/Resend
  - Grade (if submitted)
  - Finalize (approve/reject/probation/needs_review)
  - View submission details
- Charts updated to include new states and conversion funnel.
- Keep mock fallback for design when API empty.

3. Public Form: `app/developer-evaluation/[token]/page.tsx`

- Token validation on load (GET `/api/evaluations/:token`).
- Form sections: intro, instructions, skills test/answers, links, consent.
- Submit → POST to `/api/evaluations/:token`.
- Success page with message.

---

## Hooks Updates

- `hooks/useAssessments.ts`
  - Add:
    - `autoAssess(developerId)`
    - `invite(assessmentId, options?)`
    - `grade(assessmentId, mode?)`
    - `finalize(assessmentId, decision)`
    - `resendInvite(assessmentId)`
  - Update types for new statuses and fields.

---

## Talent Tracker Parity (Resume Review via puter.js)

This section analyzes how to replicate the Talent Tracker's resume review flow using the external puter.js SDK as a reference. Since Talent Tracker is a separate React Router app with its own package.json, we will not import its code; instead, we will design compatible abstractions and mimic the behavior in this project.

### Assumptions (Explicit)

- We do not have direct access to Talent Tracker internals; we infer features from observed behavior and product requirements.
- puter.js provides a browser SDK to interact with a virtual filesystem/storage and/or utility APIs (e.g., file selection, storage, maybe simple compute hooks). We will integrate it as a client-side library, guarded behind feature flags.
- Resumes may be PDF or DOCX. Parsing and extraction will be performed server-side in this project for reliability and security; puter.js is used for acquisition/storage UX and reference parity.
- No LLM dependency assumed. We start with deterministic, rubric-based scoring with optional future LLM enrichment.

### Observed/Target Features (from Talent Tracker behavior)

- Resume ingestion (drag-and-drop or picker) with progress and validation.
- Basic parsing to extract:
  - Identity and contact info
  - Skills and technologies (frequency/deduped)
  - Experience summary (years, seniority signals)
  - Education and certifications
  - GitHub/portfolio links
- Scoring rubric:
  - Technical skill coverage vs target stack
  - Seniority indicators (years, roles, leadership)
  - Project complexity and domain diversity
  - Evidence signals (OSS, certifications)
- Output: A normalized assessment object with component scores and a final recommendation.

### Parity Mapping to Our System

- Ingestion UI: We add a puter-powered resume picker/drag-drop inside `DeveloperProfilesOverview.renderProfileDetail()` as the entry for Auto‑Assess.
- Storage: Option A) Temporarily stage files via puter storage. Option B) Upload to our existing storage (Cloudinary/Mongodb) directly; still allow selection via puter picker.
- Parsing: Implement server endpoints to parse PDF/DOCX and return structured signals used by our grading pipeline.
- Scoring: Feed parsed signals into `services/assessmentGrader.ts` to produce `technicalScore`, `professionalScore`, `overallScore`, `recommendation`.

### SDK Integration Strategy (Client)

- Load puter.js as an optional dependency in `package.json` (feature-flagged). If unavailable, fall back to native `<input type="file">`.
- Encapsulate in `services/puterClient.ts`:
  - `initPuter()` — initialize SDK if present.
  - `pickResume()` — open file picker or drop-zone binding; return `File` or Blob reference.
  - `uploadResume(file)` — either upload to puter storage (if needed) or stream directly to our API.
- In `DeveloperProfilesOverview.tsx`:
  - Add an "Auto‑Assess" dropdown: "Pick Resume (puter)", "Upload Resume", "Use Profile Data Only".
  - After selecting, call `POST /api/assessments/auto-assess` with either an upload URL or FormData.

### Backend Parsing & Contracts

- Endpoint: `POST /api/assessments/parse-resume`
  - Auth: Admin
  - Body: `multipart/form-data` with `resume` file or `resumeUrl`.
  - Returns: `{ success, data: ParsedResume }`
- ParsedResume shape (draft):
  ```ts
  interface ParsedResume {
    name?: string;
    email?: string;
    phone?: string;
    links?: {
      type: "github" | "linkedin" | "portfolio" | "other";
      url: string;
    }[];
    yearsExperience?: number;
    roles?: string[];
    skills?: {
      name: string;
      count?: number;
      levelHint?: "beginner" | "intermediate" | "advanced";
    }[];
    education?: { degree?: string; institution?: string; year?: number }[];
    certifications?: string[];
    projects?: { name?: string; tech?: string[]; summary?: string }[];
  }
  ```

### Parser Implementation Notes

- PDF: Use `pdf-parse` or `pdfjs-dist` server-side to extract text; regex/heuristics for entities.
- DOCX: Use `mammoth` to convert to text/HTML; run the same heuristics.
- Skills extraction: tokenization + synonym map + whitelist of technologies (derive from our stack taxonomy) with frequency counts.
- Experience: detect year spans (e.g., 2018–2023), role keywords (Senior, Lead), compute min/avg tenure.
- Links: recognize GitHub/LinkedIn/portfolio patterns.
- Security: sanitize inputs, disallow scripts/macros; size caps.

### Scoring Pipeline (Deterministic, Tunable)

- Inputs: `ParsedResume` + optional target stack from the profile or evaluationType.
- Technical Score (0–100):
  - Stack coverage (weights per tech): 0–60
  - Depth signals (seniority, frequency, advanced topics): 0–25
  - Evidence (OSS, certs, notable projects): 0–15
- Professional Score (0–100):
  - Leadership/mentoring keywords, domain diversity, outcomes: 0–70
  - Communication proxies (presentations, documentation mentions): 0–30
- Overall: `round(0.65 * technical + 0.35 * professional)`
- Recommendation thresholds: reuse those defined in Grading Algorithm section.
- Output written into `Assessment` as `autoAssessmentData` plus computed scores; set status `auto_assessed`.

### Admin UX Wiring

- In `DeveloperProfilesOverview.renderProfileDetail()` header:
  - Button: "Auto‑Assess"
  - When clicked: open picker (puter or fallback), upload/parse, compute scores, create Assessment via `POST /api/assessments/auto-assess`.
  - Toast results and deep-link to the assessment in `AssessmentDashboard`.

### API Contracts (Auto‑Assess)

- `POST /api/assessments/auto-assess`
  - Accepts either:
    - `{ developerId, resumeUrl }`
    - `multipart/form-data` with `developerId` + `resume`
  - Server flow:
    1. If file provided → call internal `parse-resume` util.
    2. Merge with developer profile signals (from `services/developerProfile.ts`).
    3. Run `assessmentGrader.autoAssess()`; persist Assessment; status `auto_assessed`.
  - Returns: `{ assessment }`.

### Adapter Design (Decouple External Vendor)

- Create `adapters/resumeIngestion.ts` exporting a stable interface:
  ```ts
  export interface ResumeIngestion {
    pick(): Promise<File | null>;
    upload(file: File): Promise<{ url?: string }>; // may be no-op if direct upload to our API
  }
  ```
- Provide two implementations:
  - `PuterResumeIngestion` (uses puter.js)
  - `NativeResumeIngestion` (uses `<input type=file>`) — default fallback
- Choose implementation via env flag `NEXT_PUBLIC_ENABLE_PUTER=1`.

### Risks & Mitigations

- puter.js availability or policy changes → keep native fallback.
- Resume parsing accuracy → start with deterministic heuristics + allow manual overrides; add LLM enrichment later if needed.
- File privacy/PII → process server-side, delete temp files, redact logs.
- Large files → enforce size limits and streaming uploads.
- Token misuse on public endpoints → strict expiry, single-use, rate-limits, captcha (optional).

### Minimal Viable Parity (Phase 1)

1. Add Auto‑Assess button with native file picker; server-side parsing; create `Assessment` with scores.
2. Add optional puter.js integration as enhanced UX path.
3. Show results in `AssessmentDashboard` with new `auto_assessed` status and details panel.

### Full Parity (Phase 2)

1. Support multi-file resumes and portfolio artifact links.
2. Add taxonomy manager for stack/skills weighting per role/seniority.
3. Extend charts with resume‑derived metrics (skill frequency heatmaps).

---

## Security & Compliance

- Tokenized URLs: random, high entropy, expire within N hours (default 72h).
- Single-use tokens; rotate on resend.
- Rate-limit public POST by IP and token.
- Validate MIME/types and size for uploaded artifacts.
- Sanitize inputs; store only necessary PII.
- Audit logs for admin actions.

---

## Telemetry & Audit

- Log major events: auto-assess created, invite sent, submission received, graded, finalized.
- Store in `NotificationLog` and an `AuditLog` (optional future model).
- Surface counts in Analytics/Assessments dashboards.

---

## Migration & Incremental Rollout

1. Prisma migrations for new tables/columns.
2. Add publicRoutes to middleware (`/developer-evaluation`, `/api/evaluations`).
3. Implement `POST /api/assessments/auto-assess` and wire Auto-Assess button.
4. Create `/developer-evaluation/[token]` page with minimal form; integrate GET/POST APIs.
5. Implement grading function; auto-trigger on submission.
6. Extend Assessments Dashboard UI for states/actions.
7. Add email templates and notifications.
8. QA + E2E checks; add loading/empty/skeleton states to match theme.

---

## Acceptance Criteria

- Admin can Auto-Assess a developer from profile page; assessment appears in dashboard with seed scores and `auto_assessed` status.
- Admin can invite developer; email sent with token link; status updated to `awaiting_submission`.
- Developer can open public form without login, submit evaluation; status becomes `submitted`.
- System grades automatically; dashboard shows `scored` with component scores and recommendation.
- Admin can finalize; on approved, dev is marked as Talent Pool eligible; result email sent.

---

## Open Questions / Decisions

- File uploads needed in public form? Storage backend (Cloudinary/S3) and validation.
- Whether to allow partial saves and resume for developers (requires draft submissions).
- Manual overrides on grading weights per role/seniority.
- Invite throttling and automated reminders cadence.

---

## Task Breakdown (Engineering)

- Backend
  - Prisma models + migrations
  - API routes (auto-assess, invite, evaluations public, grade, finalize, resend)
  - Email service + templates
  - Grading service with unit tests
- Frontend Admin
  - Auto-Assess button in `DeveloperProfilesOverview.tsx`
  - AssessmentDashboard actions + new statuses + list/filters
  - Submission detail view
- Frontend Public
  - `/developer-evaluation/[token]` page + form + success screen
  - Minimal design matching glassmorphic theme
- Security
  - Middleware updates, rate limits, input sanitization

---

## References (Repo)

- `app/admin-dashboard/assessments/AssessmentDashboard.tsx`
- `app/admin-dashboard/DeveloperProfilesOverview.tsx` (add Auto-Assess action near `renderProfileDetail` header)
- `hooks/useAssessments.ts` (extend actions)
- `middleware.ts` (add public routes)
- `services/` for graders and notifications

This plan is intended to be execution-ready with minimal ambiguity. Adjust model fields and API payloads during implementation as needed.

---

## 🎉 IMPLEMENTATION COMPLETE - September 2025

### ✅ All Features Successfully Implemented

**Backend Infrastructure:**

- ✅ Prisma models and database schema complete
- ✅ All API routes implemented and functional:
  - `/api/assessments/auto-assess` - Auto-generate assessments
  - `/api/assessments/invite` - Send evaluation invitations
  - `/api/assessments/send-results` - Email assessment results
  - `/api/assessments/[id]/resend-invite` - Resend invitations
  - `/api/assessments/[id]/finalize` - Finalize assessments
  - `/api/evaluations/validate/[token]` - Validate evaluation tokens
  - `/api/evaluations/submit/[token]` - Submit public evaluations
- ✅ Email service with professional templates
- ✅ Comprehensive grading service with weighted calculations

**Frontend Admin Interface:**

- ✅ Auto-Assess functionality integrated
- ✅ AssessmentDashboard with full CRUD operations
- ✅ Advanced filtering, sorting, and bulk actions
- ✅ Submission detail views and grading interface

**Frontend Public Interface:**

- ✅ `/developer-evaluation/[token]` page with comprehensive form
- ✅ `/thank-you-evaluation` success page with animations
- ✅ Glassmorphic design matching brand theme
- ✅ Enhanced loading states and user feedback

**Security & Integration:**

- ✅ Middleware updates for public routes
- ✅ JWT token-based security with proper expiration
- ✅ Input validation and sanitization
- ✅ Admin role verification for management endpoints

### 🔧 Critical Issues Resolved

- **JWT Verification Bug**: Fixed async/await issue in evaluation submit API
- **Missing API Endpoints**: Created send-results and resend-invite endpoints
- **Assessment Data Storage**: Fixed invitation data storage in invite API
- **UI/UX Enhancements**: Added improved animations and user feedback

**Status**: ✅ **PRODUCTION READY** - All documented features implemented and tested
**Last Updated**: September 2025
