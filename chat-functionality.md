# Project Chat Functionality Implementation Guide

## Overview

This guide details how to implement robust project chat functionality for project management, tailored to this codebase. It covers backend models, utility functions, API endpoints, frontend hooks, and best practices for security, performance, and real-time updates.

---

## Backend Implementation

### Database Models

Models are defined in `lib/mongodb.ts` (MongoDB/Mongoose) or `prisma/schema.prisma` (Prisma). Ensure the following exist:

- **User**: `id`, `name`, `email`, `role`, `isOnline`, `lastSeen`, `status`
- **Project**: `id`, `title`, `clientId`, `assignedDeveloperId`, `lastActivity`
- **ChatParticipant**: composite key `projectId_userId`, fields: `projectId`, `userId`, `role`, `joinedAt`, `isMuted`
- **ChatMessage**: `id`, `projectId`, `senderId`, `content`, `timestamp`, `messageType`, `isRead`, `isDeleted`
- **ProjectAdminAssignment**: `id`, `projectId`, `adminId`, `assignedBy`, `assignedAt`

> See model definitions in `lib/mongodb.ts` or `prisma/schema.prisma` for schema details and update as needed.

### Utility Functions (`lib/chat-utils.ts`)

Implement these functions in `lib/chat-utils.ts`. Use MongoDB transactions (with sessions) for atomicity where required.

1. **assignDeveloperToProject(projectId, developerId, adminId)**
   - Update `Project.assignedDeveloperId` and `lastActivity`.
   - Add developer, client (if exists), and admin as `ChatParticipant`s.
   - Create a system `ChatMessage` about the assignment.
   - Use a transaction for all operations.

2. **getAvailableDevelopers()**
   - Query `User` with `role: 'DEVELOPER'`.
   - Aggregate count of active (non-completed) projects per developer.
   - Sort by `isOnline` (desc), then `name` (asc).

3. **updateUserOnlineStatus(userId, isOnline)**
   - Update `User.isOnline` and `lastSeen` (if going offline).

4. **getUserUnreadMessageCount(userId)**
   - Count unread `ChatMessage`s not sent by the user in projects where they are a `ChatParticipant`.

5. **getUserActiveChats(userId)**
   - Fetch user's `ChatParticipant` records with project details, last message, and unread count.

6. **removeDeveloperFromProject(projectId, developerId, adminId, reason)**
   - Remove developer from `Project.assignedDeveloperId`.
   - Delete developer from `ChatParticipant`.
   - Create a system `ChatMessage` about the removal.
   - Use a transaction.

7. **broadcastMessage** (placeholder)
   - For real-time updates (to be replaced with WebSocket/SSE).

8. **getProjectChatStats(projectId)**
   - Return message counts by user, total messages, first/last message dates.

9. **searchProjectMessages(projectId, query, userId)**
   - Search messages in a project (with access check) and return matches.

10. **exportChatHistory(projectId, userId)**
    - Export all chat messages for a project (with access check) in a structured format.

> Follow error handling and return conventions used in `lib/utils.ts`.

---

## API Endpoints

Implement endpoints in `app/api/` as follows:

### `api/project-assignments/[projectId]/route.ts`
- **GET**: Return available developers (admin only).
- **POST**: Assign developer to project (admin only). Validate developer exists and is a developer.
- **DELETE**: Remove developer from project (admin only). Accepts a reason.

### `api/users/status`
- **GET**: Return current user's status and stats (unread message count, active projects count).
- **PUT**: Update user's online status and/or custom status.
- **POST** (`/api/users/status/heartbeat`): Update user's heartbeat to maintain online status.

> Use `middleware.ts` for session and role checks. Reference `lib/chat-utils.ts` for business logic.

---

## Frontend Implementation

### React Hooks

Implement hooks in `hooks/`:

1. **useProjectChat(projectId)**
   - Manages state for a project chat (messages, participants, loading, error).
   - Provides functions to send messages, mark as read, and refetch.
   - Polls every 3 seconds for updates (replace with WebSocket/SSE for real-time).
   - Marks messages as read after a delay when viewed.
   - Sends heartbeat every 30 seconds to maintain online status.

2. **useUserChats()**
   - Fetches the current user's active chats (projects they participate in).

> Use `swr` or similar for data fetching and caching. Reference API endpoints above.

---

## Important Considerations

1. **Real-time Updates**: Polling is temporary. Replace with WebSocket/SSE for efficiency.
2. **Security**: All API routes must check user session and role using `middleware.ts`.
3. **Error Handling**: Extend error handling for user feedback as needed.
4. **Performance**: Use pagination for large message sets. Add indexes for frequent queries (`ChatMessage.projectId`, `ChatMessage.timestamp`, `ChatParticipant.userId`, `ChatParticipant.projectId`).
5. **Atomicity**: Use MongoDB transactions for multi-step operations.

---

## Integration Notes

- Frontend hooks expect the API endpoints described above.
- `useProjectChat` requires a project ID and uses the session for user identification.
- `useUserChats` fetches the user's chats on mount.
- UI components should be located in `components/` (e.g., `ProjectChat.tsx`, `ActiveChatsSidebar.tsx`).

---

## Next Steps

1. Implement/verify all utility functions in `lib/chat-utils.ts`.
2. Complete API endpoints in `app/api/`.
3. Ensure frontend hooks/components are wired to correct endpoints.
4. Add real-time support (WebSocket/SSE) as a future enhancement.
5. Review and update database indexes for performance.

---

By following this guide, you can implement a scalable, secure, and maintainable project chat system in this codebase.
