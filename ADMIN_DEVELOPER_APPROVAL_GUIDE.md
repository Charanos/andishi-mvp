# Admin Developer Approval & Availability Guide

This guide outlines the concise steps and requirements for implementing the admin workflow for approving developers and making them available for project assignment.

## 1. Developer Profile Submission
- When a developer submits their profile (joins the talent pool):
  - Their user account status should be set to `inactive`.
  - Their developer profile status should be set to `pending`.
  - They should **not** be available for assignment to projects.

## 2. Admin Dashboard: User Tab
- In the Users tab:
  - Newly registered developers appear with status `inactive`.
  - Admin can view user details and optionally activate the user account.

## 3. Admin Dashboard: Developer Profiles Tab
- In the Developer Profiles Overview:
  - Developers with `pending` status are clearly marked as awaiting approval.
  - Admin can review each developer's profile.
  - Admin can approve or reject a developer:
    - **Approve:**
      - Set developer profile status to `approved`.
      - Set `isAvailable` to `true` (developer is now available for assignment).
      - Optionally, activate the user account if not already active.
    - **Reject:**
      - Set developer profile status to `rejected`.
      - Developer remains unavailable for assignment.

## 4. Project Assignment Eligibility
- Only developers with:
  - `status: "approved"`
  - `isAvailable: true`
  - are returned by the `/api/project-assignments/available` endpoint and shown in the assignment UI.

## 5. Implementation Checklist
- [ ] Ensure developer profile model includes `status` (pending/approved/rejected) and `isAvailable` fields.
- [ ] On profile submission, set `status: "pending"`, `isAvailable: false`.
- [ ] In admin dashboard, add actions to approve/reject developers.
- [ ] On approval, set `status: "approved"`, `isAvailable: true`.
- [ ] Update API endpoints to filter by these fields.

---

**Summary:**
- Developers are not available for assignment until approved by an admin.
- Admins control approval and availability from the dashboard.
- Only approved and available developers are assignable to projects.
