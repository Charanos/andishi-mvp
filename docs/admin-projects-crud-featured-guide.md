# Admin Projects CRUD & Featured Selection Implementation Guide

This guide outlines the implementation of admin CRUD operations and featured project selection for the Andishi platform, following the same patterns established for blog posts.

## Overview

The implementation will allow admin users to:

1. Create, read, update, and delete projects
2. Select featured projects for homepage display
3. Designate a main featured project
4. Manage projects through an intuitive admin dashboard interface

## Architecture Components

### 1. Database Schema

The Project model already exists in `prisma/schema.prisma`. We need to add featured fields:

```prisma
model Project {
  id                      String              @id @default(auto()) @map("_id") @db.ObjectId
  // ... existing fields ...

  // Add these new fields for featured functionality
  featured       Boolean  @default(false)
  mainFeatured   Boolean  @default(false)

  // ... existing fields ...
}
```

### 2. API Endpoints

#### Main Projects API (`/api/projects`)

- `GET /api/projects` - Fetch all projects (public access)
- `POST /api/projects` - Create new project (admin only)
- `GET /api/projects/[id]` - Fetch single project (public access)
- `PUT /api/projects/[id]` - Update project (admin only)
- `DELETE /api/projects/[id]` - Delete project (admin only)

#### Featured Projects API (`/api/projects/featured`)

- `GET /api/projects/featured` - Get featured projects (public access)
- `POST /api/projects/featured` - Update featured projects selection (admin only)

### 3. React Hooks

#### `useProjectCrud` Hook

Similar to `useBlogCrud`, this hook will manage project operations:

```typescript
export const useProjectCrud = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  // CRUD operations
  const createProject = useCallback(
    async (projectData: ProjectFormData): Promise<ProjectType | null> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const updateProject = useCallback(
    async (
      id: string,
      projectData: Partial<ProjectFormData>
    ): Promise<ProjectType | null> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const fetchProjects = useCallback(async (): Promise<ProjectType[]> => {
    /* ... */
  }, []);

  return {
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
    isLoading,
    error,
    isAdmin,
    clearError: () => setError(null),
  };
};
```

### 4. Admin Dashboard UI Components

#### Project Selection Interface

Create a dedicated admin interface for selecting featured projects:

```tsx
const FeaturedProjectsAdmin = () => {
  const { fetchProjects } = useProjectCrud();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedFeatureds, setSelectedFeatureds] = useState<string[]>([]);
  const [mainFeatured, setMainFeatured] = useState<string>('');

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      const projectData = await fetchProjects();
      if (projectData) {
        setProjects(projectData);

        // Pre-select currently featured projects
        const featuredProjects = projectData.filter(p => p.featured);
        setSelectedFeatureds(featuredProjects.map(p => p.id));

        // Pre-select main featured project
        const mainFeaturedProject = projectData.find(p => p.mainFeatured);
        if (mainFeaturedProject) {
          setMainFeatured(mainFeaturedProject.id);
        }
      }
    };

    loadProjects();
  }, [fetchProjects]);

  // Handle featured project selection
  const handleFeaturedToggle = (projectId: string) => {
    setSelectedFeatureds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Save featured selections
  const saveFeaturedSelections = async () => {
    try {
      const response = await fetch('/api/projects/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          featuredProjectIds: selectedFeatureds,
          mainFeaturedProjectId: mainFeatured
        })
      });

      if (response.ok) {
        toast.success('Featured projects updated successfully');
      } else {
        throw new Error('Failed to update featured projects');
      }
    } catch (error) {
      toast.error('Error updating featured projects');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium text-white">Featured Projects</h2>

      {/* Main Featured Project Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Main Featured Project</h3>
        <select
          value={mainFeatured}
          onChange={(e) => setMainFeatured(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="">Select main featured project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Projects Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Featured Projects (Select up to 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedFeatureds.includes(project.id) ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800/30 border-gray-700'}`}
              onClick={() => handleFeaturedToggle(project.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedFeatureds.includes(project.id)}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <h4 className="font-medium text-white">{project.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveFeaturedSelections}
        disabled={selectedFeatureds.length > 3}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Featured Selections
      </button>

      {selectedFeatureds.length > 3 && (
        <p className="text-red-400">You can only select up to 3 featured projects</p>
      ))}
    </div>
  );
};
```

### 5. Homepage Integration

Update the homepage to display featured projects using the new API:

```tsx
// In homepage component
useEffect(() => {
  const loadFeaturedProjects = async () => {
    try {
      const response = await fetch("/api/projects/featured");
      const result = await response.json();

      if (response.ok && result.data) {
        setFeaturedProjects(result.data.featuredProjects);
        setMainFeaturedProject(result.data.mainFeaturedProject);
      }
    } catch (error) {
      console.error("Error loading featured projects:", error);
    }
  };

  loadFeaturedProjects();
}, []);
```

## Implementation Steps

1. **Database Migration**

   - Add `featured` and `mainFeatured` fields to Project model
   - Run `npx prisma generate` to update client

2. **API Development**

   - Create `/api/projects/featured` route handlers
   - Implement authentication middleware for admin-only endpoints
   - Add validation for featured project limits (max 3 featured)

3. **Frontend Implementation**

   - Create `useProjectCrud` hook
   - Implement admin dashboard UI for project management
   - Add featured project selection interface
   - Integrate with homepage display

4. **Testing**
   - Verify public access to projects list
   - Test admin-only CRUD operations
   - Validate featured project selection limits
   - Check homepage display of featured projects

## Security Considerations

- All CUD operations must be protected by admin authentication
- Featured project selection is admin-only
- Input validation for all API endpoints
- Proper error handling and user feedback

## Error Handling

- Implement toast notifications for user feedback
- Add confirmation modals for destructive actions
- Provide clear error messages for failed operations
- Implement retry mechanisms for failed requests

## Performance Optimization

- Implement proper indexing on featured fields
- Use caching for featured projects data
- Optimize project list queries with pagination
- Lazy load project details when needed

This implementation follows the same patterns established for blog posts, ensuring consistency across the platform while providing powerful admin capabilities for project management.
