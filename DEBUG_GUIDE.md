# DEBUG GUIDE: Developer Visibility in Project Assignments

## Problem Statement
Developers, specifically those marked as "approved" in their profiles, are not appearing in the "Available Developers" list within the "Project Assignments" tab. The API endpoint `/api/project-assignments/available` consistently returns an empty array, despite the `DeveloperProfilesOverview` tab showing approved developers.

## Current State Analysis

1.  **`app/admin-dashboard/page.tsx` (Parent Component)**:
    *   Fetches both `users` and `developerProfiles` data.
    *   Merges `developerProfileStatus` and `developerProfileId` into the `users` state for developer roles. This means the `users` state *should* contain the correct approval status for developers.
    *   Passes the `users` state to `UserManagement.tsx`, which correctly displays developer statuses.

2.  **`app/admin-dashboard/renderUsers.tsx` (User Table)**:
    *   Receives `users` as a prop from `page.tsx`.
    *   Successfully displays users, including their `developerProfileStatus`. This confirms the data merging in `page.tsx` is working for the user table.

3.  **`app/admin-dashboard/ProjectAssignments.tsx` (Assignments Tab)**:
    *   Uses `useAvailableDevelopers` hook, which fetches data from `/api/project-assignments/available`.
    *   The internal filtering logic in `getFilteredDevelopers` was adjusted to filter by `dev.status === "approved"`.

4.  **`hooks/useProjectAssignments.ts`**:
    *   `useAvailableDevelopers` calls `/api/project-assignments/available`.

5.  **`app/api/project-assignments/available/route.ts` (API Endpoint)**:
    *   Queries `prisma.developerProfile` for `isAvailable: true` and `status: "approved"`.
    *   **Returns an empty array**, indicating no matching records in the database *or* an issue with the query/data.

## Hypothesis

The primary issue is a disconnect between the `users` state in `page.tsx` (which correctly has merged developer profile data) and the `ProjectAssignments` component's reliance on a separate API call (`/api/project-assignments/available`) that is not returning the expected data.

Instead of debugging the `/api/project-assignments/available` endpoint further (which seems to be correctly querying the database based on its code, implying a data issue in the DB itself), we should leverage the already working data flow from `page.tsx`.

## Proposed Solution

We will refactor `ProjectAssignments.tsx` to receive its developer data directly from `app/admin-dashboard/page.tsx`, similar to how `UserManagement.tsx` receives its user data. This ensures consistency and utilizes the already verified data merging logic.


## Expected Outcome

After these changes, the `ProjectAssignments` tab should correctly display all approved developers, as the data will be sourced from the same, already-verified `users` state that populates the `UserManagement` table. This bypasses the problematic `/api/project-assignments/available` endpoint for the UI display.

**Note:** This solution addresses the UI display. If the underlying database still lacks approved developer profiles, you will need to manually create/approve them via the `DeveloperProfilesOverview` tab to see them appear. The API endpoint `/api/project-assignments/available` will still be used by `useAvailableDevelopers` hook, but `ProjectAssignments` will no longer rely on it for its primary display.
