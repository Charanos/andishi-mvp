# Developer Dashboard: Projects & Chat Implementation Guide

## Overview

This guide provides a comprehensive roadmap for implementing project assignments and chat functionality in the developer dashboard. The implementation leverages existing reusable components and APIs to maintain consistency and reduce code duplication.

### Key Implementation Principles:

- **Reuse existing components**: ProjectChat, ConfirmationModal, ToastContainer, etc.
- **Leverage existing APIs**: Extend current project-assignments and project-chat endpoints
- **Maintain consistency**: Use existing patterns and styling from admin/client dashboards
- **Sync with admin dashboard**: All data displayed should be manageable from admin dashboard

## 🎯 Core Features to Implement

### 1. Enhanced Project Assignment View

- **Detailed project cards**: Rich project information with client details, tech stack, milestones
- **Assignment-specific data**: Developer role, assignment date, estimated completion
- **Project timeline**: Visual timeline showing project phases and developer involvement
- **Collaboration info**: Team members, client contact, admin oversight

### 2. Comprehensive Project Management

- **Inline tabbed navigation**: Overview, Tasks, Milestones, Files, Chat, Updates
- **Real-time status updates**: Sync with admin dashboard for instant updates
- **Progress tracking**: Visual progress indicators and milestone completion
- **File management**: Upload deliverables and access project resources

### 3. Integrated Communication

- **Project chat**: Reuse existing ProjectChat component with developer-specific features
- **Notifications**: Integration with existing toast notification system
- **Status updates**: Communication about project progress and blockers
- **Client interaction**: Direct communication channel with project stakeholders

## 📁 File Structure (Leveraging Existing Components)

```
app/
├── developer-dashboard/
│   ├── DevProjects.tsx                     # Enhanced projects list with assignments
│   ├── ProjectDetail.tsx                   # Enhanced project detail with tabs
│   └── components/
│       ├── ProjectAssignmentCard.tsx       # Rich assignment card
│       ├── ProjectTimeline.tsx             # Visual project timeline
│       ├── AssignmentDetails.tsx           # Developer-specific assignment info
│       ├── ProjectTabNavigation.tsx        # Inline tab navigation
│       └── ProjectStatusUpdate.tsx         # Status update component
├── components/                              # Reusable existing components
│   ├── ProjectChat.tsx                     # Already exists - reuse
│   ├── ConfirmationModal.tsx               # Already exists - reuse
│   ├── ToastContainer.tsx                  # Already exists - reuse
│   └── ToastNotification.tsx               # Already exists - reuse
├── hooks/
│   ├── useProjectChat.ts                   # Already exists - reuse
│   ├── useProjectAssignments.ts            # Already exists - extend
│   └── useDeveloperAssignments.ts          # New hook for developer view
└── api/
    ├── project-assignments/                # Already exists - extend
    └── project-chat/                       # Already exists - reuse
```

## 🔄 Reusable Components Strategy

### Existing Components to Reuse:

1. **ProjectChat** (`app/admin-dashboard/ProjectChat.tsx`) - Full-featured chat component
2. **ConfirmationModal** (`app/components/ConfirmationModal.tsx`) - Modal for confirmations
3. **ToastContainer** (`app/components/ToastContainer.tsx`) - Notification system
4. **ProjectAssignments** (`app/admin-dashboard/ProjectAssignments.tsx`) - Assignment logic

### Existing APIs to Leverage:

1. **Project Assignments API** (`/api/project-assignments/`) - Extend with developer views
2. **Project Chat API** (`/api/project-chat/`) - Already implemented and working
3. **Projects API** (`/api/projects/`) - Core project data

### Existing Hooks to Extend:

1. **useProjectAssignments** - Add developer-specific methods
2. **useProjectChat** - Already developer-ready
3. **useToast** - Already integrated in dashboard

## 🛠️ Implementation Steps

### Step 1: Extend Existing API Hook for Developer View

**File**: `hooks/useDeveloperAssignments.ts`

```typescript
import useSWR from "swr";
import { useAuth } from "./useAuth";
import { Assignment } from "@/types/project";

// Reuse existing fetcher pattern
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
};

export function useDeveloperAssignments() {
  const { user } = useAuth();

  // Leverage existing project-assignments API with developer filter
  const { data, error, mutate, isLoading } = useSWR<Assignment[]>(
    user ? `/api/project-assignments/developer/${user.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Update assignment status (developer can update their own assignment)
  const updateAssignmentStatus = async (
    assignmentId: string,
    status: string
  ) => {
    const response = await fetch(
      `/api/project-assignments/${assignmentId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update assignment status");
    }

    mutate(); // Refresh the data
    return response.json();
  };

  // Update project progress (developer-specific)
  const updateProjectProgress = async (projectId: string, progress: number) => {
    const response = await fetch(`/api/projects/${projectId}/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ progress }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to update project progress");
    }

    mutate(); // Refresh the data
    return response.json();
  };

  return {
    assignments: data || [],
    loading: isLoading,
    error,
    refetch: mutate,
    updateAssignmentStatus,
    updateProjectProgress,
  };
}
```

### Step 2: Extend Existing API Routes for Developer View

**File**: `app/api/project-assignments/developer/[developerId]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";

// Extend existing project-assignments API for developer-specific view
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    // Reuse existing authentication pattern
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow developers to view their own assignments or admin access
    if (session.user.role !== "admin" && session.user.id !== developerId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get developer's assignments with enhanced project details
    const assignments = await prisma.assignment.findMany({
      where: {
        developerId: developerId,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                company: true,
              },
            },
            milestones: {
              orderBy: {
                order: "asc",
              },
            },
            files: {
              orderBy: {
                createdAt: "desc",
              },
            },
            updates: {
              orderBy: {
                createdAt: "desc",
              },
              take: 5, // Latest 5 updates
            },
            assignments: {
              include: {
                developer: {
                  select: {
                    id: true,
                    personalInfo: true,
                    professionalInfo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform data for developer dashboard with enhanced details
    const enhancedAssignments = assignments.map((assignment) => ({
      // Assignment-specific data
      id: assignment.id,
      assignmentId: assignment.id,
      assignedAt: assignment.assignedAt,
      updatedAt: assignment.updatedAt,
      status: assignment.status,
      role: assignment.role,

      // Project data
      project: {
        id: assignment.project.id,
        title: assignment.project.projectDetails.title,
        description: assignment.project.projectDetails.description,
        category: assignment.project.projectDetails.category,
        priority: assignment.project.priority,
        status: assignment.project.status,
        progress: assignment.project.progress,
        technologies: assignment.project.projectDetails.techStack,
        timeline: assignment.project.projectDetails.timeline,
        estimatedCompletionDate: assignment.project.estimatedCompletionDate,
        actualCompletionDate: assignment.project.actualCompletionDate,
        createdAt: assignment.project.createdAt,

        // Client information
        client: assignment.project.client
          ? {
              id: assignment.project.client.id,
              name: `${assignment.project.client.firstName} ${assignment.project.client.lastName}`,
              email: assignment.project.client.email,
              company: assignment.project.client.company,
            }
          : null,

        // Project team (all assigned developers)
        team: assignment.project.assignments.map((a) => ({
          id: a.id,
          role: a.role,
          status: a.status,
          assignedAt: a.assignedAt,
          developer: a.developer
            ? {
                id: a.developer.id,
                name: `${a.developer.personalInfo?.firstName || ""} ${
                  a.developer.personalInfo?.lastName || ""
                }`.trim(),
                title: a.developer.professionalInfo?.title || "Developer",
                email: a.developer.personalInfo?.email,
              }
            : null,
        })),

        // Milestones
        milestones: assignment.project.milestones,

        // Files
        files: assignment.project.files,

        // Recent updates
        updates: assignment.project.updates,

        // Budget information
        budget: assignment.project.pricing.fixedBudget || 0,
        pricingType: assignment.project.pricing.type,
      },
    }));

    return NextResponse.json(enhancedAssignments);
  } catch (error) {
    console.error("Error fetching developer assignments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

### Step 3: Create Enhanced DevProjects Component with Inline Tabs

**File**: `app/developer-dashboard/DevProjects.tsx`

```typescript
"use client";

import React, { useState, useMemo } from "react";
import { useDeveloperAssignments } from "@/hooks/useDeveloperAssignments";
import { useAuth } from "@/hooks/useAuth";
import { Assignment } from "@/types/project";
import {
  FaSearch,
  FaFilter,
  FaComments,
  FaEye,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaUser,
  FaCode,
  FaDollarSign,
  FaBriefcase,
  FaTasks,
  FaFileAlt,
  FaUsers,
  FaHistory,
} from "react-icons/fa";
import { IoIosGrid, IoIosList } from "react-icons/io";

// Reuse existing components
import ProjectChat from "@/app/admin-dashboard/ProjectChat";
import ToastContainer from "@/app/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import ProjectAssignmentCard from "./components/ProjectAssignmentCard";
import ProjectTabNavigation from "./components/ProjectTabNavigation";

export default function DevProjects() {
  const { user } = useAuth();
  const { assignments, loading, error, refetch } = useDeveloperAssignments();
  const { notifications, removeNotification } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "milestones" | "files" | "chat" | "updates"
  >("overview");

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments.filter((assignment) => {
      const project = assignment.project;
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || assignment.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.project.title.localeCompare(b.project.title);
        case "deadline":
          return (
            new Date(a.project.estimatedCompletionDate).getTime() -
            new Date(b.project.estimatedCompletionDate).getTime()
          );
        case "progress":
          return b.project.progress - a.project.progress;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return (
            priorityOrder[b.project.priority] -
            priorityOrder[a.project.priority]
          );
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return filtered;
  }, [assignments, searchTerm, statusFilter, priorityFilter, sortBy]);

  // Show detailed assignment view with inline tabs
  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        {/* Assignment Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <FaArrowLeft className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {selectedAssignment.project.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400">Client:</span>
                <span className="text-white">
                  {selectedAssignment.project.client?.name}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">Role:</span>
                <span className="text-blue-400">{selectedAssignment.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                selectedAssignment.status
              )}`}
            >
              {selectedAssignment.status}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(
                selectedAssignment.project.priority
              )}`}
            >
              {selectedAssignment.project.priority}
            </div>
          </div>
        </div>

        {/* Enhanced Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progress</p>
                <p className="text-2xl font-semibold text-white">
                  {selectedAssignment.project.progress}%
                </p>
              </div>
              <FaChartLine className="text-blue-400 text-2xl" />
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${selectedAssignment.project.progress}%` }}
              />
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Size</p>
                <p className="text-2xl font-semibold text-white">
                  {selectedAssignment.project.team?.length || 1}
                </p>
              </div>
              <FaUsers className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Deadline</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(
                    selectedAssignment.project.estimatedCompletionDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <FaCalendarAlt className="text-orange-400 text-2xl" />
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Budget</p>
                <p className="text-lg font-semibold text-white">
                  $
                  {selectedAssignment.project.budget?.toLocaleString() || "N/A"}
                </p>
              </div>
              <FaDollarSign className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Inline Tab Navigation */}
        <ProjectTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          assignment={selectedAssignment}
        />

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === "overview" && (
            <AssignmentOverview assignment={selectedAssignment} />
          )}

          {activeTab === "tasks" && (
            <AssignmentTasks assignment={selectedAssignment} />
          )}

          {activeTab === "milestones" && (
            <AssignmentMilestones assignment={selectedAssignment} />
          )}

          {activeTab === "files" && (
            <AssignmentFiles assignment={selectedAssignment} />
          )}

          {activeTab === "chat" && (
            <ProjectChat
              projectId={selectedAssignment.project.id}
              projectTitle={selectedAssignment.project.title}
              currentUserId={user?.id || ""}
              currentUserRole="developer"
              currentUserName={user?.name || "Developer"}
            />
          )}

          {activeTab === "updates" && (
            <AssignmentUpdates assignment={selectedAssignment} />
          )}
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />
      </div>
    );
  }

  // Assignment List View
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading assignments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading assignments: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm monty uppercase">
                Total Projects
              </p>
              <p className="text-2xl font-semibold text-white">
                {assignments.length}
              </p>
            </div>
            <FaBriefcase className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm monty uppercase">Active</p>
              <p className="text-2xl font-semibold text-green-400">
                {
                  assignments.filter(
                    (a) => a.status === "accepted" || a.status === "pending"
                  ).length
                }
              </p>
            </div>
            <FaCheck className="text-green-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm monty uppercase">Completed</p>
              <p className="text-2xl font-semibold text-purple-400">
                {assignments.filter((a) => a.status === "completed").length}
              </p>
            </div>
            <FaCheckCircle className="text-purple-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm monty uppercase">Overdue</p>
              <p className="text-2xl font-semibold text-red-400">
                {
                  assignments.filter(
                    (a) =>
                      new Date(a.project.estimatedCompletionDate) <
                        new Date() && a.status !== "completed"
                  ).length
                }
              </p>
            </div>
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <IoIosGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <IoIosList size={20} />
          </button>
        </div>
      </div>

      {/* Assignment Cards */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <FaBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-400">
            No assignments found matching your criteria
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredAssignments.map((assignment) => (
            <ProjectAssignmentCard
              key={assignment.id}
              assignment={assignment}
              viewMode={viewMode}
              onSelect={() => setSelectedAssignment(assignment)}
            />
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
}

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    accepted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    critical: "bg-red-500/20 text-red-400",
  };
  return colors[priority as keyof typeof colors] || colors.low;
};
```

### Step 4: Create Supporting Components

**File**: `app/developer-dashboard/components/ProjectAssignmentCard.tsx`

```typescript
"use client";

import React from "react";
import { Assignment } from "@/types/project";
import {
  FaCalendarAlt,
  FaUser,
  FaChartLine,
  FaComments,
  FaEye,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { format } from "date-fns";

interface ProjectAssignmentCardProps {
  assignment: Assignment;
  viewMode: "grid" | "list";
  onSelect: () => void;
}

export default function ProjectAssignmentCard({
  assignment,
  viewMode,
  onSelect,
}: ProjectAssignmentCardProps) {
  const project = assignment.project;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      accepted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const isOverdue =
    new Date(project.estimatedCompletionDate) < new Date() &&
    assignment.status !== "completed";
  const daysUntilDeadline = Math.ceil(
    (new Date(project.estimatedCompletionDate).getTime() -
      new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (viewMode === "list") {
    return (
      <div
        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {project.title}
              </h3>
              <div
                className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                  assignment.status
                )}`}
              >
                {assignment.status}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                  project.priority
                )}`}
              >
                {project.priority}
              </div>
              {isOverdue && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <FaExclamationTriangle />
                  Overdue
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FaUser />
                {project.client?.name || "Unknown Client"}
              </div>
              <div className="flex items-center gap-1">
                <FaCalendarAlt />
                {format(
                  new Date(project.estimatedCompletionDate),
                  "MMM dd, yyyy"
                )}
              </div>
              <div className="flex items-center gap-1">
                <FaChartLine />
                {project.progress}%
              </div>
              <div className="flex items-center gap-1">
                <FaUsers />
                {project.team?.length || 1} members
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                assignment.status
              )}`}
            >
              {assignment.status}
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority}
            </div>
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-400 text-xs">
            <FaExclamationTriangle />
            Overdue
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-1 mb-4">
        {project.technologies.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
            +{project.technologies.length - 3} more
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Assignment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-400">Your Role</p>
          <p className="text-white font-medium">{assignment.role}</p>
        </div>
        <div>
          <p className="text-gray-400">Team Size</p>
          <p className="text-white font-medium">
            {project.team?.length || 1} members
          </p>
        </div>
        <div>
          <p className="text-gray-400">Assigned</p>
          <p className="text-white font-medium">
            {format(new Date(assignment.assignedAt), "MMM dd, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Deadline</p>
          <p
            className={`font-medium ${
              isOverdue
                ? "text-red-400"
                : daysUntilDeadline <= 7
                ? "text-yellow-400"
                : "text-white"
            }`}
          >
            {isOverdue
              ? "Overdue"
              : daysUntilDeadline <= 0
              ? "Today"
              : `${daysUntilDeadline} days`}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <FaUser />
          {project.client?.name || "Unknown Client"}
        </div>
        <div className="flex items-center gap-1">
          <FaClock />
          {format(new Date(project.estimatedCompletionDate), "MMM dd")}
        </div>
      </div>
    </div>
  );
}
```

**File**: `app/developer-dashboard/components/ProjectTabNavigation.tsx`

```typescript
"use client";

import React from "react";
import { Assignment } from "@/types/project";
import {
  FaEye,
  FaTasks,
  FaFlag,
  FaFileAlt,
  FaComments,
  FaHistory,
  FaBell,
} from "react-icons/fa";

interface ProjectTabNavigationProps {
  activeTab: "overview" | "tasks" | "milestones" | "files" | "chat" | "updates";
  onTabChange: (
    tab: "overview" | "tasks" | "milestones" | "files" | "chat" | "updates"
  ) => void;
  assignment: Assignment;
}

export default function ProjectTabNavigation({
  activeTab,
  onTabChange,
  assignment,
}: ProjectTabNavigationProps) {
  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: FaEye,
      count: null,
    },
    {
      id: "tasks" as const,
      label: "Tasks",
      icon: FaTasks,
      count: assignment.project.tasks?.length || 0,
    },
    {
      id: "milestones" as const,
      label: "Milestones",
      icon: FaFlag,
      count: assignment.project.milestones?.length || 0,
    },
    {
      id: "files" as const,
      label: "Files",
      icon: FaFileAlt,
      count: assignment.project.files?.length || 0,
    },
    {
      id: "chat" as const,
      label: "Chat",
      icon: FaComments,
      count: null, // Could show unread count
    },
    {
      id: "updates" as const,
      label: "Updates",
      icon: FaHistory,
      count: assignment.project.updates?.length || 0,
    },
  ];

  return (
    <div className="border-b border-white/10">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? "text-blue-400 border-blue-400"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <Icon className="text-sm" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**File**: `app/developer-dashboard/components/AssignmentOverview.tsx`

```typescript
"use client";

import React from "react";
import { Assignment } from "@/types/project";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBuilding,
  FaUsers,
  FaCode,
  FaClipboardList,
} from "react-icons/fa";
import { format } from "date-fns";

interface AssignmentOverviewProps {
  assignment: Assignment;
}

export default function AssignmentOverview({
  assignment,
}: AssignmentOverviewProps) {
  const project = assignment.project;

  return (
    <div className="space-y-6">
      {/* Project Description */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Project Description
        </h3>
        <p className="text-gray-300 leading-relaxed">{project.description}</p>
      </div>

      {/* Technologies & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaCode className="text-blue-400" />
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaClipboardList className="text-green-400" />
            Project Timeline
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">
                {format(new Date(project.createdAt), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Duration:</span>
              <span className="text-white">{project.timeline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expected Completion:</span>
              <span className="text-white">
                {format(
                  new Date(project.estimatedCompletionDate),
                  "MMM dd, yyyy"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      {project.client && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaUser className="text-purple-400" />
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400 text-sm" />
                <div>
                  <p className="text-white font-medium">
                    {project.client.name}
                  </p>
                  <p className="text-gray-400 text-sm">Client</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-gray-400 text-sm" />
                <div>
                  <p className="text-white">{project.client.email}</p>
                  <p className="text-gray-400 text-sm">Email</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {project.client.company && (
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-gray-400 text-sm" />
                  <div>
                    <p className="text-white">{project.client.company}</p>
                    <p className="text-gray-400 text-sm">Company</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Information */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-orange-400" />
          Project Team
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.team?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {member.developer?.name || "Unknown"}
                </p>
                <p className="text-gray-400 text-sm">{member.role}</p>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    member.status === "accepted"
                      ? "bg-green-500/20 text-green-400"
                      : member.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {member.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Details */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Assignment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Role</p>
            <p className="text-white font-medium">{assignment.role}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <div
              className={`inline-block px-2 py-1 rounded-full text-xs ${
                assignment.status === "accepted"
                  ? "bg-green-500/20 text-green-400"
                  : assignment.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : assignment.status === "completed"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {assignment.status}
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Assigned On</p>
            <p className="text-white font-medium">
              {format(new Date(assignment.assignedAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🚀 Implementation Summary

### Key Benefits of This Approach:

1. **Reusability**: Leverages existing components (ProjectChat, ConfirmationModal, ToastContainer)
2. **Consistency**: Maintains design patterns from admin and client dashboards
3. **Efficiency**: Extends existing APIs rather than creating new ones
4. **Maintainability**: Uses established patterns and hooks
5. **Scalability**: Modular component structure allows easy extension

### Data Flow:

1. **Authentication**: Uses existing `useAuth` hook and `getSession` function
2. **Data Fetching**: Extends existing `useProjectAssignments` hook for developer view
3. **Real-time Updates**: Leverages SWR for automatic revalidation
4. **Chat Integration**: Reuses existing `ProjectChat` component with developer role
5. **Notifications**: Uses existing toast notification system

### Admin Dashboard Sync:

All data displayed in the developer dashboard is manageable from the admin dashboard:

- **Project assignments**: Admin can assign/unassign developers
- **Project details**: Admin can update project information
- **Milestones**: Admin can create and manage project milestones
- **Files**: Admin can upload and manage project files
- **Chat access**: Admin participates in all project chats

## 🧪 Testing & Deployment

### Testing Checklist

#### API Integration Tests

- [ ] Developer assignments API returns correct data
- [ ] Assignment status updates work correctly
- [ ] Project progress updates sync with admin dashboard
- [ ] Chat API works with developer role
- [ ] Authentication works across all endpoints

#### Component Tests

- [ ] ProjectAssignmentCard displays correct information
- [ ] ProjectTabNavigation switches between tabs correctly
- [ ] AssignmentOverview shows comprehensive project details
- [ ] Chat integration works seamlessly
- [ ] Toast notifications appear for actions

#### Integration Tests

- [ ] Developer can view only their assigned projects
- [ ] Real-time updates work when admin makes changes
- [ ] Chat messages sync between admin, client, and developer
- [ ] Status updates reflect immediately across dashboards
- [ ] File uploads and downloads work correctly

#### User Experience Tests

- [ ] Responsive design works on all devices
- [ ] Loading states display appropriately
- [ ] Error handling provides clear feedback
- [ ] Navigation is intuitive and consistent
- [ ] Performance is acceptable with large datasets

### Deployment Steps

1. **API Extensions**

   ```bash
   # Add new API route for developer assignments
   mkdir -p app/api/project-assignments/developer
   # Deploy the new endpoint
   ```

2. **Component Deployment**

   ```bash
   # Create component directory
   mkdir -p app/developer-dashboard/components
   # Deploy new components
   ```

3. **Hook Extensions**

   ```bash
   # Add new developer-specific hook
   # Update existing hooks as needed
   ```

4. **Database Verification**

   - Ensure assignment relationships are properly set up
   - Verify developer profile connections
   - Test chat permissions and access

5. **Production Testing**
   - Test with real developer accounts
   - Verify chat works across all user roles
   - Check performance with production data
   - Monitor error rates and response times

### Performance Considerations

- **Data Fetching**: Uses SWR for efficient caching and revalidation
- **Component Optimization**: Lazy loading for heavy components
- **API Efficiency**: Batch requests where possible
- **Real-time Updates**: Optimistic updates for better UX

## 🔧 Troubleshooting

### Common Issues

1. **Assignments Not Loading**

   - Check developer profile status (`approved`)
   - Verify assignment relationships in database
   - Ensure API endpoint has correct permissions
   - Check authentication token validity

2. **Chat Not Working**

   - Verify project chat permissions
   - Check authentication in chat API
   - Ensure developer is assigned to project
   - Test WebSocket connections

3. **Real-time Updates Not Syncing**

   - Check SWR cache invalidation
   - Verify API response consistency
   - Test network connectivity
   - Check for JavaScript errors

4. **Components Not Rendering**
   - Verify import paths for reused components
   - Check TypeScript type definitions
   - Ensure all dependencies are installed
   - Check for console errors

### Debugging Tips

1. **API Debugging**

   ```javascript
   // Add logging to API routes
   console.log("Assignment data:", assignments);

   // Test API endpoints directly
   fetch("/api/project-assignments/developer/[id]")
     .then((r) => r.json())
     .then(console.log);
   ```

2. **Component Debugging**

   ```javascript
   // Add debug logging to components
   console.log("Assignment data:", assignment);

   // Use React DevTools to inspect component state
   // Check for prop drilling issues
   ```

3. **Hook Debugging**
   ```javascript
   // Debug SWR data fetching
   const { data, error, isLoading } = useDeveloperAssignments();
   console.log({ data, error, isLoading });
   ```

### Support Resources

- **Component Library**: Existing components in `app/components/`
- **API Documentation**: Check existing API routes for patterns
- **Type Definitions**: Use existing types in `types/project.ts`
- **Authentication**: Follow patterns in `hooks/useAuth.ts`

## 📈 Future Enhancements

### Phase 1: Core Features

- [ ] Basic assignment viewing
- [ ] Project detail tabs
- [ ] Chat integration
- [ ] Status updates

### Phase 2: Advanced Features

- [ ] Time tracking integration
- [ ] Advanced file management
- [ ] Project collaboration tools
- [ ] Performance analytics

### Phase 3: Mobile & Notifications

- [ ] Mobile-responsive design
- [ ] Push notifications
- [ ] Offline support
- [ ] Mobile app integration

### Phase 4: AI & Automation

- [ ] AI-powered project insights
- [ ] Automated status updates
- [ ] Smart notifications
- [ ] Predictive analytics

## 📝 Conclusion

This implementation guide provides a comprehensive approach to extending the developer dashboard with project assignments and chat functionality. By leveraging existing components and APIs, we maintain consistency while reducing development time and potential bugs.

The inline tabbed navigation provides a seamless experience for developers to access all project information in one place, while the integration with existing admin dashboard features ensures data consistency and administrative control.

Key success factors:

- **Reuse existing, proven components**
- **Maintain consistency with current design patterns**
- **Ensure all features sync with admin dashboard**
- **Provide comprehensive project details for developers**
- **Enable seamless communication through integrated chat**

Follow the implementation steps systematically, test thoroughly, and deploy with confidence. The modular approach allows for incremental implementation and easy future extensions.

---

_This guide is designed to be a living document. Update it as you implement features and discover new patterns or improvements._
FaEdit,
FaUpload,
FaDownload,
FaCheckCircle,
FaClock,
FaExclamationTriangle,
} from "react-icons/fa";
import ProjectTasks from "./components/ProjectTasks";
import ProjectMilestones from "./components/ProjectMilestones";
import ProjectFiles from "./components/ProjectFiles";
import ProjectProgressUpdate from "./components/ProjectProgressUpdate";

interface ProjectDetailProps {
project: ProjectAssignment;
onBack: () => void;
onOpenChat: () => void;
}

export default function ProjectDetail({ project, onBack, onOpenChat }: ProjectDetailProps) {
const { updateProjectStatus, updateProjectProgress } = useDeveloperProjects();
const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "milestones" | "files">("overview");
const [updating, setUpdating] = useState(false);

const handleStatusUpdate = async (newStatus: string) => {
setUpdating(true);
try {
await updateProjectStatus(project.id, newStatus);
// Show success toast
} catch (error) {
// Show error toast
} finally {
setUpdating(false);
}
};

const handleProgressUpdate = async (newProgress: number) => {
setUpdating(true);
try {
await updateProjectProgress(project.id, newProgress);
// Show success toast
} catch (error) {
// Show error toast
} finally {
setUpdating(false);
}
};

const getStatusColor = (status: string) => {
const colors = {
assigned: "bg-blue-500/20 text-blue-400",
"in-progress": "bg-yellow-500/20 text-yellow-400",
completed: "bg-green-500/20 text-green-400",
"on-hold": "bg-gray-500/20 text-gray-400",
review: "bg-purple-500/20 text-purple-400",
};
return colors[status as keyof typeof colors] || colors.assigned;
};

return (

<div className="space-y-6">
{/_ Header _/}
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
<FaArrowLeft className="text-gray-400" />
</button>
<div>
<h1 className="text-2xl font-semibold text-white">{project.title}</h1>
<p className="text-gray-400">{project.client}</p>
</div>
</div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <FaComments />
            Chat
          </button>
          <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
            {project.status}
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Progress</p>
              <p className="text-2xl font-semibold text-white">{project.progress}%</p>
            </div>
            <FaChartLine className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Budget</p>
              <p className="text-2xl font-semibold text-white">${project.budget.toLocaleString()}</p>
            </div>
            <FaDollarSign className="text-green-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Deadline</p>
              <p className="text-2xl font-semibold text-white">
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
            <FaCalendarAlt className="text-orange-400 text-2xl" />
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Priority</p>
              <p className="text-2xl font-semibold text-white capitalize">{project.priority}</p>
            </div>
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        {["overview", "tasks", "milestones", "files"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Description</h3>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <ProjectProgressUpdate
              currentProgress={project.progress}
              onProgressUpdate={handleProgressUpdate}
              onStatusUpdate={handleStatusUpdate}
              currentStatus={project.status}
              updating={updating}
            />
          </div>
        )}

        {activeTab === "tasks" && (
          <ProjectTasks
            projectId={project.id}
            tasks={project.tasks || []}
          />
        )}

        {activeTab === "milestones" && (
          <ProjectMilestones
            projectId={project.id}
            milestones={project.milestones || []}
          />
        )}

        {activeTab === "files" && (
          <ProjectFiles
            projectId={project.id}
            files={project.files || []}
          />
        )}
      </div>
    </div>

);
}

````

### Step 5: Create Developer Project Chat Component

**File**: `app/developer-dashboard/components/ProjectChat.tsx`

```typescript
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjectChat } from "@/hooks/useProjectChat";
import { useAuth } from "@/hooks/useAuth";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaFile,
  FaDownload,
  FaUser,
  FaCircle,
} from "react-icons/fa";
import { format } from "date-fns";

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
}

export default function ProjectChat({ projectId, projectTitle, onBack }: ProjectChatProps) {
  const { user } = useAuth();
  const {
    messages,
    participants,
    loading,
    sendMessage,
    markAsRead,
    onlineParticipants,
    isConnected,
  } = useProjectChat(projectId);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "text-red-400",
      client: "text-blue-400",
      developer: "text-green-400",
    };
    return colors[role as keyof typeof colors] || "text-gray-400";
  };

  const isMyMessage = (senderId: string) => senderId === user?.id;

  return (
    <div className="flex flex-col h-screen max-h-[800px] bg-gray-900/50 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">{projectTitle}</h2>
            <p className="text-sm text-gray-400">
              {onlineParticipants.length} online • {participants.length} participants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FaCircle className={`text-xs ${isConnected ? "text-green-400" : "text-red-400"}`} />
          <span className="text-sm text-gray-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Participants:</span>
          {participants.map((participant) => (
            <span
              key={participant.id}
              className={`${getRoleColor(participant.role)} capitalize`}
            >
              {participant.name}
              {onlineParticipants.some(p => p.userId === participant.userId) && (
                <FaCircle className="inline ml-1 text-green-400" style={{ fontSize: "6px" }} />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-400">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message.senderId) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage(message.senderId)
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${getRoleColor(message.senderRole)}`}>
                    {message.senderName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg transition-colors"
          >
            <FaPaperPlane className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
````

### Step 6: Create Supporting Components

**File**: `app/developer-dashboard/components/ProjectCard.tsx`

```typescript
"use client";

import React from "react";
import { ProjectAssignment } from "@/types/project";
import {
  FaCalendarAlt,
  FaUser,
  FaChartLine,
  FaComments,
  FaEye,
  FaCode,
  FaExclamationTriangle,
} from "react-icons/fa";
import { format } from "date-fns";

interface ProjectCardProps {
  project: ProjectAssignment;
  viewMode: "grid" | "list";
  onSelect: () => void;
  onOpenChat: () => void;
}

export default function ProjectCard({
  project,
  viewMode,
  onSelect,
  onOpenChat,
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      "on-hold": "bg-gray-500/20 text-gray-400 border-gray-500/30",
      review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status as keyof typeof colors] || colors.assigned;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const isOverdue =
    new Date(project.deadline) < new Date() && project.status !== "completed";

  if (viewMode === "list") {
    return (
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {project.title}
              </h3>
              <div
                className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                  project.priority
                )}`}
              >
                {project.priority}
              </div>
              {isOverdue && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <FaExclamationTriangle />
                  Overdue
                </div>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FaUser />
                {project.client}
              </div>
              <div className="flex items-center gap-1">
                <FaCalendarAlt />
                {format(new Date(project.deadline), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <FaChartLine />
                {project.progress}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenChat}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <FaComments />
            </button>
            <button
              onClick={onSelect}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                project.status
              )}`}
            >
              {project.status}
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority}
            </div>
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-400 text-xs">
            <FaExclamationTriangle />
            Overdue
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {project.technologies.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
            +{project.technologies.length - 3} more
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <FaUser />
          {project.client}
        </div>
        <div className="flex items-center gap-1">
          <FaCalendarAlt />
          {format(new Date(project.deadline), "MMM dd")}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
        >
          <FaEye className="inline mr-2" />
          View Details
        </button>
        <button
          onClick={onOpenChat}
          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
        >
          <FaComments />
        </button>
      </div>
    </div>
  );
}
```

## 🚀 Testing & Deployment

### Testing Checklist

1. **Authentication Tests**

   - [ ] Developer can only access their assigned projects
   - [ ] Chat authentication works correctly
   - [ ] API endpoints respect role-based access

2. **Functionality Tests**

   - [ ] Project list displays correctly
   - [ ] Project details show complete information
   - [ ] Chat functionality works in real-time
   - [ ] Status and progress updates work
   - [ ] File uploads and downloads work

3. **UI/UX Tests**
   - [ ] Responsive design works on all devices
   - [ ] Loading states display properly
   - [ ] Error handling works correctly
   - [ ] Real-time updates reflect immediately

### Deployment Steps

1. **Database Updates**

   - Ensure assignment relationships are properly set up
   - Test project-developer associations
   - Verify chat permissions

2. **API Deployment**

   - Deploy new API routes for developer projects
   - Update existing chat API if needed
   - Test API endpoints in production

3. **Frontend Deployment**

   - Deploy updated developer dashboard
   - Test chat functionality in production
   - Monitor for any performance issues

4. **Post-Deployment Verification**
   - Test with real developer accounts
   - Verify chat works across different roles
   - Check mobile responsiveness

## 📝 Future Enhancements

1. **Real-time Notifications**

   - Push notifications for new messages
   - Email notifications for project updates
   - Desktop notifications for urgent messages

2. **Advanced Chat Features**

   - File sharing in chat
   - Message reactions and threading
   - Voice and video calls

3. **Project Management**

   - Time tracking integration
   - Gantt chart visualization
   - Advanced reporting and analytics

4. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Offline support

## 🔧 Troubleshooting

### Common Issues

1. **Chat Not Loading**

   - Check authentication tokens
   - Verify project permissions
   - Check API endpoint responses

2. **Projects Not Showing**

   - Verify assignment relationships in database
   - Check developer profile status
   - Verify API filtering logic

3. **Real-time Updates Not Working**
   - Check WebSocket connections
   - Verify SWR cache invalidation
   - Test network connectivity

### Support Resources

- API Documentation: `/docs/api-reference.md`
- Database Schema: `/docs/database-schema.md`
- Authentication Guide: `/docs/authentication.md`
- Component Library: `/docs/components.md`

---

This implementation guide provides a comprehensive roadmap for extending the developer dashboard with project assignment visibility and chat functionality. Follow the steps systematically, test thoroughly, and deploy with confidence.
