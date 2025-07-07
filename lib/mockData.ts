// Shared mock data store for development
// This will be replaced with actual database queries in production

// Use the shared types for production readiness
type Assignment = import("@/types/project").Assignment;

// In-memory storage for assignments
let assignments: Assignment[] = [];


