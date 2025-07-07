# Project Assignments Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the Project Assignments feature in the Admin Dashboard, based on client projects. It is tailored to the current codebase, which uses Next.js API routes, modular hooks, and mock data for rapid prototyping. This guide ensures clarity and alignment for developers, designers, QA, and product stakeholders.

---

## 1. Stakeholders
- **Admins:** Assign developers to client projects, monitor assignments, and manage statuses via the Admin Dashboard UI.
- **Clients:** View assigned developers for their projects (read-only access).
- **Developers:** View their own assignments and statuses.
- **Product/QA:** Ensure business logic and user experience meet requirements.

---

## 2. Implementation Strategy & Architecture
- **API Routes:**
  - Located in `app/api/project-assignments/route.ts` (for all assignments) and `app/api/project-assignments/[projectId]/route.ts` (for project-specific operations).
  - Follows Next.js App Router conventions for RESTful endpoints.
- **Mock Data:**
  - Uses `mockAssignments` from `@/lib/mockData` for development and testing.
  - All assignment CRUD operations currently interact with this in-memory store.
  - Plan: Transition to persistent storage (MongoDB/Prisma) by swapping out the mock layer.
- **Hooks:**
  - Custom React hooks (e.g., `useProjectAssignments`, `useAvailableDevelopers`) encapsulate API calls and state management for UI components.
  - Promotes code reuse and separation of concerns.
- **Chat Integration:**
  - Chat functionality is modular (`useProjectChat`, `ProjectChat.tsx`) and can be linked to assignments for project-based communication.
  - Assignment and chat features are decoupled but share project context.
- **Component Structure:**
  - Admin dashboard components: `ProjectAssignments.tsx`, `ProjectAssignmentManager.tsx`, `DeveloperProfilesOverview.tsx`, etc.
  - Each component consumes hooks and API endpoints for data.

---

## 3. User Flows (with Implementation Notes)
### Admin
- View all client projects (`useProjectCRUD`, `/api/client-projects`).
- Select a project to view details and current assignments (`ProjectOverview.tsx`, `ProjectAssignments.tsx`).
- Assign one or more developers to a project (modal/form, `AddNewDeveloper.tsx`, `POST /api/project-assignments`).
- Edit or remove assignments (`PATCH`/`DELETE` endpoints, UI actions in `ProjectAssignmentManager.tsx`).
- Monitor assignment statuses (status field, color-coded in UI).

### Client
- View their projects and assigned developers (read-only, filtered via API and UI logic).

### Developer
- View their own project assignments and statuses (dashboard, filtered via user context).

---

## 4. Data Model
- See `@/lib/mockData.ts` for mock structure. Plan for migration to Prisma schema in `prisma/schema.prisma`.
- Assignment model includes: `id`, `projectId`, `developerId`, `role`, `status`, `assignedAt`, `updatedAt`.
- Project and Developer models are similarly structured for easy integration.

---

## 5. API Endpoints (Current & Planned)
- `/api/project-assignments` (GET, POST): List/create assignments (admin only).
- `/api/project-assignments/[projectId]` (GET, PATCH, DELETE): Project-specific assignment operations.
- `/api/client-projects` (GET): List all client projects.
- All endpoints currently use mock data; swap to DB logic for production.

---

## 6. UI/UX Considerations
- **Admin Dashboard:**
  - Table/list of client projects and assignments (`ProjectAssignments.tsx`).
  - Modal/form for assigning developers (`AddNewDeveloper.tsx`).
  - Status indicators (color-coded, e.g., pending, active, completed).
  - Compatibility scoring for developer-project fit.
  - Enhanced search, filter, and sort for developer selection.
  - Toast notifications for assignment actions.
- **Client Dashboard:**
  - Read-only view of assigned developers per project.
- **Developer Dashboard:**
  - List of assignments with statuses.
- **Chat Integration:**
  - Optionally display project chat alongside assignments for context.

---

## 7. Business Logic
- Prevent duplicate assignments (enforced in `mockAssignments.exists`).
- Update developer availability when assigned (currently logged, to be implemented in DB layer).
- Only admins can create/edit/delete assignments (enforced via UI and future API auth middleware).
- Assignment status transitions: pending → active → completed/cancelled.
- Compatibility score calculated based on skills, experience, availability, and rating.

---

## 8. Testing & QA
- Unit tests for API endpoints (mock data layer).
- Integration tests for assignment flows (using hooks and components).
- UI tests for dashboard components (React Testing Library, Cypress).
- Manual QA: assignment creation, editing, removal, and status updates.

---

## 9. Rollout & Documentation
- Update user documentation for admins, clients, and developers.
- Announce new feature to stakeholders.
- Monitor logs and feedback after deployment.
- Plan for seamless migration from mock data to persistent storage.

---

## 10. Future Enhancements
- Notifications for assignment changes (in-app or email).
- Bulk assignment actions.
- Analytics on assignments and developer utilization.
- Real-time updates (WebSockets or polling).
- More granular assignment roles and permissions.

---

## 11. References & File Map
- Next.js API Routes: [Docs](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- Prisma Data Modeling: [Docs](https://www.prisma.io/docs/concepts/components/prisma-schema)
- Key files:
  - `app/api/project-assignments/route.ts`
  - `app/api/project-assignments/[projectId]/route.ts`
  - `lib/mockData.ts`
  - `hooks/useProjectAssignments.ts`, `hooks/useAvailableDevelopers.ts`, `hooks/useProjectChat.ts`
  - `components/ProjectAssignments.tsx`, `components/ProjectChat.tsx`

---

*This guide should be reviewed and updated as requirements evolve and as the codebase transitions from mock data to production-ready infrastructure.*
