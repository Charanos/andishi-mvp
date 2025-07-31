# Admin Dashboard – **User Feedback Tab**

_Comprehensive implementation guide_

---

## 1. Purpose
✅ Create a new **Feedback** tab in the Admin Dashboard to allow administrators to view, search and manage messages submitted through the public **Contact-Us** form.

## 2. Functional Requirements
✅ 1. Display a paginated table/list of all feedback entries.
✅ 2. Show all fields captured by the Contact-Us form (name, email, subject, message, createdAt, etc.).
✅ 3. Allow admins to:
   - Filter/search by keyword, date range, or read/unread status.
   - Mark messages as _read_ / _unread_ (updates a `read` boolean).
   - Delete a feedback entry (soft delete preferred).
✅ 4. Real-time toast notifications for actions (delete, mark as read).
✅ 5. UI/UX consistent with existing admin dashboard (dark theme, Tailwind + React Icons).
✅ 6. Access restricted to authenticated users with role `admin`.

## 3. Data Model
| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID (Mongo ObjectId) |
| `name` | `string` | Sender full name |
| `email` | `string` | Valid email address |
| `subject` | `string` | Short subject line |
| `message` | `string` | Full message body (markdown safe) |
| `read` | `boolean` | Defaults to `false` |
| `createdAt` | `Date` | Auto-generated |
| `deleted` | `boolean` | Soft delete flag |

> **Collection:** `contactFeedback`

## 4. Backend
### 4.1 Routes (REST, `/api/feedback`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/feedback` | List feedback (supports `page`, `limit`, `search`, `status`) |
| `GET` | `/api/feedback/[id]` | Get single feedback item |
| `POST` | `/api/feedback` | Create new entry (called by public Contact-Us form) |
| `PUT` | `/api/feedback/[id]` | Update `read` or other admin flags |
| `DELETE` | `/api/feedback/[id]` | Soft delete (sets `deleted = true`) |

✅ All endpoints protected by existing JWT auth middleware **except** the public `POST`.

### 4.2 Controller Skeleton (Node/Next.js API)
✅ Implemented with Next.js API routes:
- `app/api/feedback/route.ts` (GET, POST)
- `app/api/feedback/[id]/route.ts` (PUT, DELETE)

## 5. Frontend Implementation
### 5.1 New Tab Registration
✅ 1. Added `"feedback"` to `ActiveTab` union in `app/admin-dashboard/page.tsx`.
✅ 2. Added button in the sidebar list with icon `FaEnvelope`.

```tsx
{ id: 'feedback', label: 'Feedback', icon: FaEnvelope }
```

### 5.2 Component Tree
✅ Implemented as a single component with all functionality:
```
FeedbackTabEnhanced
 ├─ Feedback List (with search, filters)
 └─ Feedback Details Sidebar
```

Created file:
```
app/admin-dashboard/FeedbackTabEnhanced.tsx
```

### 5.3 Data Fetching Hook
✅ Implemented in `hooks/useFeedback.ts` with:
- State management for feedback items
- Custom fetcher functions for API interactions
- Error handling

### 5.4 UI/UX Notes
✅ Implemented with:
* Consistent Tailwind classes and card styling
* Unread rows highlighted with subtle yellow background
* Icon buttons for actions with hover effects
* Glass-like UI with backdrop blur
* Automatic marking of unread messages as read when clicked

## 6. Authorization & Security
* Leverage `adminAuth` util.
* Sanitize message content to prevent XSS (use `dompurify`).
* Rate-limit public `POST` endpoint (e.g., 5/min per IP).

## 7. Testing
1. **Unit tests** for API using Jest + Supertest.
2. **Component tests** with React Testing Library.
3. **E2E tests** with Cypress to cover create → view → update → delete flow.

## 8. Deployment & Migration
* Add new collection to Mongo Atlas – no migration required for empty collection.
* Update seed scripts if sample data desired for staging.

## 9. Future Enhancements
* Email notifications to admins on new feedback.
* Export feedback as CSV.
* Tagging / categorization system.

---
© 2025 Andishi MVP – Internal Documentation
