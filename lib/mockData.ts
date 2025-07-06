// Shared mock data store for development
// This will be replaced with actual database queries in production

export interface MockAssignment {
  id: string;
  projectId: string;
  developerId: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  assignedAt: string;
  updatedAt: string;
}

// In-memory storage for assignments
let assignments: MockAssignment[] = [];

export const mockAssignments = {
  getAll: (): MockAssignment[] => assignments,
  
  getById: (id: string): MockAssignment | undefined => 
    assignments.find(a => a.id === id),
  
  create: (assignment: Omit<MockAssignment, 'id' | 'assignedAt' | 'updatedAt'>): MockAssignment => {
    const newAssignment: MockAssignment = {
      ...assignment,
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assignments.push(newAssignment);
    return newAssignment;
  },
  
  update: (id: string, updates: Partial<MockAssignment>): MockAssignment | null => {
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    assignments[index] = {
      ...assignments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return assignments[index];
  },
  
  delete: (id: string): boolean => {
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    assignments.splice(index, 1);
    return true;
  },
  
  findByProject: (projectId: string): MockAssignment[] =>
    assignments.filter(a => a.projectId === projectId),
  
  findByDeveloper: (developerId: string): MockAssignment[] =>
    assignments.filter(a => a.developerId === developerId),
  
  exists: (projectId: string, developerId: string): boolean =>
    assignments.some(a => a.projectId === projectId && a.developerId === developerId),
};
