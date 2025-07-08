# Guide: Extending Project Assignment & Chat Functionality to Client and Developer Dashboards

This guide provides comprehensive and actionable instructions for replicating the project assignment and chat functionalities, currently available in the Admin Dashboard, into the Client and Developer Dashboards. It emphasizes precision and adherence to existing project conventions to ensure a fool-proof implementation.

## 1. Prerequisites

Before proceeding, ensure you have a clear understanding of the following:

*   **React/Next.js Fundamentals:** Familiarity with React components, hooks, and Next.js page routing.
*   **TypeScript:** The project uses TypeScript for type safety.
*   **Tailwind CSS:** For styling and maintaining UI consistency.
*   **SWR:** For data fetching and caching (`useSWR` hook).
*   **Prisma & MongoDB:** Understanding of the database schema and how data is modeled.
*   **Existing Admin Dashboard Implementation:**
    *   `app/admin-dashboard/ProjectAssignments.tsx`
    *   `app/admin-dashboard/ProjectChat.tsx`
    *   `hooks/useProjectAssignments.ts`
    *   `hooks/useProjectChat.ts`
    *   `app/api/project-assignments/route.ts`
    *   `app/api/project-chat/route.ts` (Assumed structure, as file was not found in analysis)
    *   `types/project.ts`
    *   `types/chat.ts`
    *   `prisma/schema.prisma`
    *   `hooks/useAuth.ts` (for user authentication and roles)

## 2. Core Components Overview

The existing functionalities are built upon the following core components and patterns:

### 2.1. Project Assignments

*   **`ProjectAssignments` Component (`app/admin-dashboard/ProjectAssignments.tsx`):**
    *   A React component responsible for displaying assigned developers, searching/filtering available developers, and handling assignment actions.
    *   **Props:** `projectId`, `projectTitle`, `projectTechStack`, `projectExperienceLevel`, `developers` (list of all system developers).
    *   **Key Logic:** Manages selected developers, search terms, filters, and interacts with the `useProjectAssignments` hook.
*   **`useProjectAssignments` Hook (`hooks/useProjectAssignments.ts`):**
    *   A custom React hook that provides data fetching and mutation logic for project assignments.
    *   **Functions:**
        *   `assignments`: Fetches assignments for a specific `projectId` from `/api/project-assignments/[projectId]`.
        *   `assignDevelopers(developerIds: string[], role: string)`: Sends a POST request to `/api/project-assignments` to assign developers.
        *   `updateAssignment(developerId: string, updates: Partial<Assignment>)`: Sends a PATCH request to `/api/project-assignments/[projectId]` to update an assignment.
        *   `removeAssignment(developerId: string)`: Sends a DELETE request to `/api/project-assignments/[projectId]` to remove an assignment.
        *   `refetch()`: Revalidates SWR cache.
*   **API Endpoint (`app/api/project-assignments/route.ts`):**
    *   **`GET /api/project-assignments/[projectId]`:** Retrieves all assignments for a given project.
    *   **`POST /api/project-assignments`:** Creates new project assignments. Expects `projectId`, `developerIds[]`, and `role`. Updates `isAvailable` status of `DeveloperProfile`.
    *   **`PATCH /api/project-assignments/[projectId]`:** Updates an existing assignment. Expects `developerId` and `updates`.
    *   **`DELETE /api/project-assignments/[projectId]`:** Removes an assignment. Expects `developerId`.
*   **Data Models:**
    *   `Assignment` (`types/project.ts`): Defines the structure of a project assignment (e.g., `projectId`, `developerId`, `status`).
    *   `DeveloperProfile` (`prisma/schema.prisma`): Represents a developer's profile, including `isAvailable` status.

### 2.2. Project Chat

*   **`ProjectChat` Component (`app/admin-dashboard/ProjectChat.tsx`):**
    *   A React component for displaying chat messages, participants, and sending new messages.
    *   **Props:** `projectId`, `projectTitle`, `currentUserId`, `currentUserRole`, `currentUserName`.
    *   **Key Logic:** Manages `newMessage` state, handles sending messages, and displays chat history. Uses `useProjectChat` hook.
*   **`useProjectChat` Hook (`hooks/useProjectChat.ts`):**
    *   A custom React hook for real-time chat functionality using SWR with a `refreshInterval`.
    *   **Functions:**
        *   `messages`: Fetches chat messages for a specific `projectId` from `/api/project-chat/[projectId]`.
        *   `participants`: Fetches chat participants.
        *   `sendMessage(content: string)`: Sends a POST request to `/api/project-chat/[projectId]` to send a message.
        *   `markAsRead(messageIds?: string[])`: Sends a PUT request to `/api/project-chat/[projectId]` to mark messages as read.
        *   `updateOnlineStatus(isOnline: boolean)`: Sends a PATCH request to `/api/project-chat/[projectId]` to update online status.
        *   `refetch()`: Revalidates SWR cache.
*   **API Endpoint (`app/api/project-chat/route.ts` - Inferred Structure):**
    *   **`GET /api/project-chat/[projectId]`:** Retrieves chat messages and participants for a project.
    *   **`POST /api/project-chat/[projectId]`:** Sends a new message.
        *   **Request Body:** `{ senderId: string, senderName: string, senderRole: string, content: string }`
    *   **`PUT /api/project-chat/[projectId]`:** Marks messages as read.
        *   **Request Body:** `{ messageIds?: string[] }` (if omitted, all unread messages for the user are marked as read).
    *   **`PATCH /api/project-chat/[projectId]`:** Updates online status.
        *   **Request Body:** `{ isOnline: boolean }`
*   **Data Models:**
    *   `ChatMessage`, `ChatParticipant`, `ProjectChat` (`types/chat.ts`): Define the structure of chat-related data.

## 3. Implementation Steps for Client Dashboard

The client dashboard typically focuses on viewing project progress and communicating with the team.

### 3.1. Identify Target Component

Locate the main component in the client dashboard where project details are displayed. This is likely `app/client-dashboard/page.tsx` or `app/client-dashboard/projectDetails.tsx`. For this guide, let's assume `app/client-dashboard/projectDetails.tsx` is the target.

### 3.2. Data Acquisition

You will need the `projectId`, `projectTitle`, and the current user's `id`, `role`, and `name`.

*   **`projectId` and `projectTitle`:** These should be available from the `selectedProject` object that the client dashboard is already displaying.
*   **`currentUserId`, `currentUserRole`, `currentUserName`:** Use the `useAuth` hook to get the authenticated user's details.

    ```typescript
    // app/client-dashboard/projectDetails.tsx (or similar)
    import { useAuth } from "@/hooks/useAuth";

    // Inside your component
    const { user: currentUser } = useAuth();

    if (!currentUser) {
      // Handle loading or unauthorized state
      return <div>Loading user data...</div>;
    }

    const currentUserId = currentUser.id;
    const currentUserRole = currentUser.role as "admin" | "client" | "developer"; // Cast to appropriate role type
    const currentUserName = currentUser.name || currentUser.email; // Use name if available, otherwise email
    ```

*   **`developers` (for Project Assignments - Optional for Client):** If the client needs to see the list of *all* available developers (similar to admin), you might need to fetch this data. However, it's more likely the client only needs to see *assigned* developers. The `ProjectAssignments` component expects a `developers` prop, which is a list of `SystemUser`. If you only want to show assigned developers, you'll need to filter this list or modify the `ProjectAssignments` component to accept a list of `assignedDevelopers` instead. For simplicity, if the client only needs to see who is assigned, you can fetch the assignments and then map the `developerId` to `SystemUser` objects.

    ```typescript
    // Example: Fetching assigned developers for client view
    import { useProjectAssignments } from "@/hooks/useProjectAssignments";
    import { SystemUser } from "@/app/admin-dashboard/ProjectOverview"; // Assuming SystemUser is defined here or in a shared type file

    // Inside your component
    const { assignments, loading: loadingAssignments } = useProjectAssignments(projectId);

    // You'll need a way to get the full developer objects based on assignment.developerId
    // This might involve fetching all developers and then filtering, or a new API endpoint.
    // For now, assume `allDevelopers` is available (e.g., passed as a prop or fetched globally)
    const assignedDevelopers = allDevelopers.filter(dev =>
      assignments.some(assignment => assignment.developerId === dev._id)
    );
    ```

### 3.3. UI Integration

Import and render the `ProjectChat` and `ProjectAssignments` components within your client dashboard component.

```typescript
// app/client-dashboard/projectDetails.tsx (or similar)
import ProjectChatComponent from "@/app/admin-dashboard/ProjectChat";
import ProjectAssignmentsComponent from "@/app/admin-dashboard/ProjectAssignments"; // If client needs to see assignments

// ... inside your component's render method

{/* Example for Project Chat */}
<div className="my-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Project Chat</h2>
  {currentUser && (
    <ProjectChatComponent
      projectId={selectedProject._id}
      projectTitle={selectedProject.projectDetails.title}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      currentUserName={currentUserName}
    />
  )}
</div>

{/* Example for Project Assignments (if applicable for client) */}
{/* Note: You might need to adjust ProjectAssignmentsComponent props or logic
    if the client's view of assignments is different from the admin's. */}
{/*
<div className="my-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Team Assignments</h2>
  {selectedProject && assignedDevelopers && (
    <ProjectAssignmentsComponent
      projectId={selectedProject._id}
      projectTitle={selectedProject.projectDetails.title}
      projectTechStack={selectedProject.projectDetails.techStack || []}
      projectExperienceLevel={selectedProject.projectDetails.experienceLevel || "Mid-level"}
      developers={assignedDevelopers} // Pass only assigned developers or all if needed
    />
  )}
</div>
*/}
```

### 3.4. Permissions and Access Control (Client)

The `ProjectChat` component already uses `currentUserRole` to determine `canViewAll` (admin only). For the client dashboard, ensure that the `currentUserRole` passed to `ProjectChat` is `"client"`.

For `ProjectAssignments`, consider if clients should be able to assign/unassign developers. Typically, this is an admin-only function. If not, you might need to:
*   Create a client-specific `ProjectAssignmentsView` component that only displays assigned developers without the assignment controls.
*   Pass a `readOnly` prop to `ProjectAssignments` and modify its internal logic to disable assignment actions if `readOnly` is true.

## 4. Implementation Steps for Developer Dashboard

The developer dashboard will focus on their assigned projects and communication within their project teams.

### 4.1. Identify Target Component

Locate the main component in the developer dashboard where project details are displayed. This is likely `app/developer-dashboard/page.tsx` or `app/developer-dashboard/ProjectDetail.tsx`. For this guide, let's assume `app/developer-dashboard/ProjectDetail.tsx` is the target.

### 4.2. Data Acquisition

Similar to the client dashboard, you will need `projectId`, `projectTitle`, and the current user's `id`, `role`, and `name`.

*   **`projectId` and `projectTitle`:** These should be available from the `selectedProject` object that the developer dashboard is already displaying.
*   **`currentUserId`, `currentUserRole`, `currentUserName`:** Use the `useAuth` hook.

    ```typescript
    // app/developer-dashboard/ProjectDetail.tsx (or similar)
    import { useAuth } from "@/hooks/useAuth";

    // Inside your component
    const { user: currentUser } = useAuth();

    if (!currentUser) {
      // Handle loading or unauthorized state
      return <div>Loading user data...</div>;
    }

    const currentUserId = currentUser.id;
    const currentUserRole = currentUser.role as "admin" | "client" | "developer";
    const currentUserName = currentUser.name || currentUser.email;
    ```

*   **`developers` (for Project Assignments - Optional for Developer):** Developers might need to see other assigned developers on their project. You can fetch assignments for the current project and then retrieve the `SystemUser` objects for those developers.

    ```typescript
    // Example: Fetching assigned developers for developer view
    import { useProjectAssignments } from "@/hooks/useProjectAssignments";
    import { SystemUser } from "@/app/admin-dashboard/ProjectOverview"; // Assuming SystemUser is defined here or in a shared type file

    // Inside your component
    const { assignments, loading: loadingAssignments } = useProjectAssignments(projectId);

    // You'll need a way to get the full developer objects based on assignment.developerId
    // This might involve fetching all developers and then filtering, or a new API endpoint.
    // For now, assume `allDevelopers` is available (e.g., passed as a prop or fetched globally)
    const assignedDevelopers = allDevelopers.filter(dev =>
      assignments.some(assignment => assignment.developerId === dev._id)
    );
    ```

### 4.3. UI Integration

Import and render the `ProjectChat` and `ProjectAssignments` components within your developer dashboard component.

```typescript
// app/developer-dashboard/ProjectDetail.tsx (or similar)
import ProjectChatComponent from "@/app/admin-dashboard/ProjectChat";
import ProjectAssignmentsComponent from "@/app/admin-dashboard/ProjectAssignments"; // If developers need to see assignments

// ... inside your component's render method

{/* Example for Project Chat */}
<div className="my-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Project Chat</h2>
  {currentUser && (
    <ProjectChatComponent
      projectId={selectedProject._id}
      projectTitle={selectedProject.projectDetails.title}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      currentUserName={currentUserName}
    />
  )}
</div>

{/* Example for Project Assignments (if applicable for developer) */}
{/* Developers typically don't assign, so this would be a read-only view. */}
{/*
<div className="my-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Team Assignments</h2>
  {selectedProject && assignedDevelopers && (
    <ProjectAssignmentsComponent
      projectId={selectedProject._id}
      projectTitle={selectedProject.projectDetails.title}
      projectTechStack={selectedProject.projectDetails.techStack || []}
      projectExperienceLevel={selectedProject.projectDetails.experienceLevel || "Mid-level"}
      developers={assignedDevelopers} // Pass only assigned developers
      readOnly={true} // Add a readOnly prop to disable assignment controls
    />
  )}
</div>
*/}
```

### 4.4. Permissions and Access Control (Developer)

Ensure the `currentUserRole` passed to `ProjectChat` is `"developer"`.

For `ProjectAssignments`, developers should generally only *view* assignments, not modify them. Implement a `readOnly` prop in `ProjectAssignments` (if not already present) and set it to `true` when rendering it in the developer dashboard.

## 5. Key Considerations & Best Practices

*   **Role-Based Access Control (RBAC):**
    *   Always use `currentUserRole` from `useAuth` to conditionally render UI elements (e.g., assignment buttons for admins only) and to validate actions on the backend API routes.
    *   The `ProjectChat` component already handles `canViewAll` for admins. Extend this logic if specific chat features (e.g., deleting messages) should be restricted by role.
*   **Error Handling:**
    *   Implement robust error handling for all API calls (e.g., using `try...catch` blocks, displaying user-friendly error messages). The `useSWR` hook provides `error` state for this.
*   **Loading States:**
    *   Display loading indicators (`loading` state from SWR hooks) while data is being fetched to improve user experience.
*   **Real-time Updates:**
    *   The `useProjectChat` hook already uses `refreshInterval` for near real-time updates. Ensure this is sufficient for your needs. For more advanced real-time features (e.g., typing indicators, presence), consider WebSockets.
*   **UI/UX Consistency:**
    *   Adhere strictly to the existing Tailwind CSS classes and component structures to maintain a consistent look and feel across dashboards.
    *   Ensure the layout and placement of the chat and assignment sections are intuitive for clients and developers.
*   **Data Filtering/Scope:**
    *   For client and developer dashboards, ensure that only relevant project data (projects they are associated with) is displayed. This filtering should primarily happen at the API level based on the authenticated user's ID and role.
*   **Testing:**
    *   Thoroughly test the integrated functionalities in both client and developer dashboards.
    *   Test with different user roles (client, developer, admin) to ensure correct permissions and data visibility.
    *   Test edge cases: no assignments, no chat messages, network errors.

By following this guide, you can successfully extend the project assignment and chat functionalities to the client and developer dashboards, providing a consistent and secure experience across the application.
