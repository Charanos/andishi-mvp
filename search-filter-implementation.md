
# Replicating Search & Filter UI from Our Portfolio to Admin Dashboard

This document outlines the steps to replace the existing project search and filter functionality in the Admin Dashboard (`/app/admin-dashboard/page.tsx`) with the more advanced and visually appealing UI from the Our Portfolio page (`/app/our-portfolio/page.tsx`).

## 1. Create a Reusable Search & Filter Component

We will create a new reusable component to encapsulate the search, filter, and view-switching logic.

**File:** `app/admin-dashboard/SearchFilter.tsx`

```tsx
"use client";

import React from "react";
import {
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { HiViewGrid, HiViewList } from "react-icons/hi";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  filteredProjectsCount: number;
  totalProjectsCount: number;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  filteredProjectsCount,
  totalProjectsCount,
  clearFilters,
  hasActiveFilters,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) => {
  return (
    <div className="bg-white/5 my-12 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search projects by name, client, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
          >
            <option value="all" className="bg-black/50">
              All Status
            </option>
            <option value="pending" className="bg-black/50">
              Pending
            </option>
            <option value="reviewed" className="bg-black/50">
              Reviewed
            </option>
            <option value="approved" className="bg-black/50">
              Approved
            </option>
            <option value="rejected" className="bg-black/50">
              Rejected
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 bg-black/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
          >
            <option value="all" className="bg-black/50">
              All Priority
            </option>
            <option value="critical" className="bg-black/50">
              Critical
            </option>
            <option value="high" className="bg-black/50">
              High
            </option>
            <option value="medium" className="bg-black/50">
              Medium
            </option>
            <option value="low" className="bg-black/50">
              Low
            </option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative ">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-5  py-3 pr-12  border border-white/10 rounded-xl text-white focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 min-w-[160px]"
            >
              <option value="newest">✨ Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="name">🔤 Name A-Z</option>
              <option value="budget">💰 Budget</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3.5 transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Grid View"
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <div className="w-px bg-white/10"></div>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3.5 transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="List View"
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FiTrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">
                Showing{" "}
                <span className="text-white font-semibold">
                  {filteredProjectsCount}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {totalProjectsCount}
                </span>{" "}
                projects
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-300 hover:bg-purple-500/30 transition-colors duration-200"
              >
                <FiX className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
```

## 2. Integrate the `SearchFilter` Component into the Admin Dashboard

Now, we'll modify the `admin-dashboard/page.tsx` to use our new `SearchFilter` component.

### 2.1. Import the New Component

Add the following import statement at the top of `app/admin-dashboard/page.tsx`:

```tsx
import SearchFilter from "./SearchFilter";
```

### 2.2. Remove the Old Filter UI

In the `renderProjects` function within `app/admin-dashboard/page.tsx`, delete the entire `div` with the class `bg-white/5 my-12 backdrop-blur-xl...`. This is the container for the old filter UI.

### 2.3. Add the New `SearchFilter` Component

In the same `renderProjects` function, where you just deleted the old filter UI, add the new `SearchFilter` component:

```tsx
<SearchFilter
  searchQuery={searchTerm}
  setSearchQuery={setSearchTerm}
  sortBy={sortBy}
  setSortBy={setSortBy}
  viewMode={viewMode}
  setViewMode={setViewMode}
  filteredProjectsCount={filteredAndSortedProjects.length}
  totalProjectsCount={allFilteredProjects.length}
  clearFilters={clearFilters}
  hasActiveFilters={hasActiveFilters}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
  priorityFilter={priorityFilter}
  setPriorityFilter={setPriorityFilter}
/>
```

## 3. Update the Projects Grid/List View

The `our-portfolio` page has a more modern grid and list view. We'll adapt this for the admin dashboard.

### 3.1. Update the Grid View

In `app/admin-dashboard/page.tsx`, inside the `renderProjects` function, locate the `filteredAndSortedProjects.map(...)` section. Replace the existing grid item with the following structure, which is a simplified version of the one from `our-portfolio/page.tsx` adapted for the admin dashboard's data.

Replace this:
```tsx
<div
  key={project?._id}
  className="group relative overflow-hidden rounded-xl bg-black/10 border border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 hover:scale-[1.01] p-6 cursor-pointer"
>
  {/* ... existing grid item content ... */}
</div>
```

With this:
```tsx
<article
  key={project.id}
  className="group relative overflow-hidden rounded-2xl backdrop-blur-xl shadow-md bg-black/10 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
>
  {/* ... content from our-portfolio page, adapted for admin dashboard ... */}
</article>
```

### 3.2. Update the List View

Similarly, you will need to add a list view rendering option. The current implementation only has a grid view. You will need to add a conditional rendering based on the `viewMode` state.

```tsx
<div
  className={
    viewMode === "grid"
      ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
      : "space-y-4"
  }
>
  {filteredAndSortedProjects.map((project) =>
    viewMode === "grid" ? (
      // Grid View Card
    ) : (
      // List View Card
    )
  )}
</div>
```

You will need to create a new list view card component based on the `our-portfolio` page's list view.

## 4. Final Touches

- **Styling:** Ensure that the new components and styles integrate well with the existing admin dashboard theme. You may need to adjust some Tailwind CSS classes.
- **State Management:** The state for filters, search queries, and view mode is already managed in `app/admin-dashboard/page.tsx`. The new `SearchFilter` component will just be a controlled component that receives and updates this state.
- **Functionality:** Test the search, filtering, sorting, and view-switching functionalities thoroughly to ensure they work as expected.

By following these steps, you will successfully replicate the search and filter UI from the `our-portfolio` page to the `admin-dashboard` page, providing a more modern and user-friendly experience.
