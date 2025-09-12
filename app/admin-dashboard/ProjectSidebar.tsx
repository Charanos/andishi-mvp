import React from "react";
import { FaArrowCircleLeft, FaUsers, FaComment } from "react-icons/fa";
import {
  Target,
  CheckCircle,
  DollarSign,
  FileText,
  Activity,
  MessageSquare,
} from "lucide-react";
import { ProjectData } from "~/types";
import { TrackingView } from "./ProjectOverview";

interface ProjectSidebarProps {
  className?: string;
  selectedProject: ProjectData;
  trackingView: TrackingView;
  setTrackingView: React.Dispatch<React.SetStateAction<TrackingView>>;
  onBack: () => void;
}

const navTabs = [
  { id: "overview", label: "Overview", icon: Target },
  { id: "milestones", label: "Milestones", icon: CheckCircle },
  { id: "budget", label: "Budget & Payments", icon: DollarSign },
  { id: "files", label: "Files", icon: FileText },
  { id: "updates", label: "Updates", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "assignments", label: "Assignments", icon: FaUsers },
  { id: "chat", label: "Chat", icon: FaComment },
];

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  className = "",
  selectedProject,
  trackingView,
  setTrackingView,
  onBack,
}) => {
  return (
    <aside
      className={`w-70 mr-4 sticky top-22 h-[calc(100vh-10rem)] ${className}`}
    >
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60 shadow-xl border border-purple-500/30 rounded-2xl p-6 h-full flex flex-col space-y-8 overflow-hidden">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex cursor-pointer mb-4 items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            <FaArrowCircleLeft className="w-5 h-5" />
            <span className="text-xs monty uppercase">Back to Projects</span>
          </button>
          <div>
            <h1 className="text-xl monty uppercase font-medium my-1 text-white leading-tight truncate">
              {selectedProject.projectDetails.title}
            </h1>
            <p className="text-gray-400 text-xs mt-1 truncate">
              {selectedProject.projectDetails.category}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pr-2">
          <ul className="space-y-5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = trackingView === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setTrackingView(tab.id as TrackingView)}
                    className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg shadow-indigo-500/25"
                        : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium monty uppercase">
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
