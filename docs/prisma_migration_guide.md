# Comprehensive Prisma Migration & Troubleshooting Guide

This guide provides a detailed, step-by-step walkthrough for migrating a Next.js application from the native MongoDB driver to Prisma. It also covers refactoring and fixing existing Prisma implementations to ensure they are robust, performant, and maintainable.

## 1. Guiding Principles

- **Conciseness & Precision:** All fixes must be minimal, targeted, and directly address a specific issue.
- **Adherence to Conventions:** Strictly follow existing project patterns, including error handling and type definitions.
- **Server-Side Logic:** API routes are server-side only. Do not use client-side libraries (e.g., `react-toastify`).
- **Incremental Changes:** Apply and verify changes one file at a time to minimize errors.

## 2. Schema (`prisma.prisma`) Review

- [x] **Initial Review Completed:** The schema has been reviewed. Key findings include the need to consolidate the `Developer` and `DeveloperProfile` models and to review `onDelete` behavior for relations.
- [ ] **Action Item:** Before fixing routes, consolidate the `Developer` and `DeveloperProfile` models to create a single source of truth and eliminate data redundancy.

## 3. API Route Migration & Refactoring Plan

This plan will be executed for **every single API route file** in the `app/api` directory.

### Step 1: Analyze the Route

For each `route.ts` file:

1.  **Read the File:** Start by reading the entire file to understand its purpose and current implementation.
2.  **Check for MongoDB Driver:** Search for any remaining usage of the native MongoDB driver (e.g., `db.collection(...)`, `connectToDatabase`).
3.  **Verify Prisma Client Usage:** Ensure Prisma Client is instantiated as a singleton (e.g., imported from `@/lib/prisma`) and not inside the request handler.
4.  **Inspect for Type Safety:**
    - Identify every use of the `any` type.
    - Check if the necessary types are imported from a shared types file (e.g., `@/lib/types.ts`).
    - If types are not available globally, they must be defined locally within the file to ensure type safety and encapsulation.
5.  **Review Data Handling:**
    - Identify complex, multi-step data transformations that are happening in-memory.
    - Look for opportunities to simplify logic by pushing computations to the database using Prisma's aggregation, filtering, and relation query features.
6.  **Check Error Handling:**
    - Ensure `try...catch` blocks are used for all database operations.
    - Verify that errors are handled gracefully on the server-side (e.g., returning a `NextResponse` with an appropriate status code and error message) and that no client-side libraries like `toast` are being called.

### Step 2: Fix the Route

Based on the analysis, perform the following actions incrementally:

1.  **Remove MongoDB Driver:** Replace any native MongoDB calls with the equivalent Prisma Client queries.
2.  **Correct Type Definitions:**
    - Replace all `any` types with specific, locally-defined interfaces.
    - Do not import types that don't exist. Define them within the route file itself.
3.  **Refactor Data Logic:**
    - Simplify complex data manipulation logic.
    - Use Prisma aggregations (`_count`, `_sum`, `_avg`, etc.) to reduce in-memory processing.
4.  **Implement Proper Error Handling:**
    - Remove all client-side `toast` calls.
    - Return `NextResponse.json({ error: '...' }, { status: ... })` from within `catch` blocks.

### Step 3: Verify the Fix

After editing a file, confirm that:
- The code is syntactically correct.
- All type errors are resolved.
- The logic is sound and follows the principles outlined above.

## 4. Execution Log

- **`app/api/analytics/comprehensive/route.ts`**
    - [ ] **Analysis:** File uses Prisma but has significant issues: client-side `toast`, incorrect type imports, and overly complex in-memory data processing.
    - [ ] **Fix:** Will be the first file to be refactored according to the plan above.
- **`app/api/auth/...`**
    - [ ] **Analysis:** Pending.
    - [ ] **Fix:** Pending.

(This log will be updated as I proceed through the API routes.)