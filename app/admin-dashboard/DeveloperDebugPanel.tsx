"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaSyncAlt,
} from "react-icons/fa";

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  developerProfileStatus?: string;
  isActive?: boolean;
  createdAt: string;
}

interface DeveloperDebugPanelProps {
  users: SystemUser[];
  onRefresh?: () => void;
}

const DeveloperDebugPanel: React.FC<DeveloperDebugPanelProps> = ({
  users,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fixingUsers, setFixingUsers] = useState<string[]>([]);

  // Filter developers
  const allDevelopers = users.filter((user) => user.role === "developer");
  const approvedDevelopers = allDevelopers.filter(
    (dev) => dev.developerProfileStatus === "approved"
  );
  const pendingDevelopers = allDevelopers.filter(
    (dev) =>
      dev.developerProfileStatus === "pending" ||
      dev.developerProfileStatus === null
  );
  const rejectedDevelopers = allDevelopers.filter(
    (dev) => dev.developerProfileStatus === "rejected"
  );

  // Quick fix function to approve developers via API
  const quickFixDeveloper = async (developerId: string, email: string) => {
    setFixingUsers((prev) => [...prev, developerId]);

    try {
      // This would typically call your user management API
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          id: developerId,
          developerProfileStatus: "approved",
        }),
      });

      if (response.ok) {
        console.log(`✅ Successfully approved developer: ${email}`);
        if (onRefresh) onRefresh();
      } else {
        console.error(`❌ Failed to approve developer: ${email}`);
      }
    } catch (error) {
      console.error(`❌ Error approving developer ${email}:`, error);
    } finally {
      setFixingUsers((prev) => prev.filter((id) => id !== developerId));
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <FaCheck className="text-green-500" />;
      case "pending":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "rejected":
        return <FaTimes className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FaUser className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Developer Visibility Debug Panel
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaEye />
          </button>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-green-400">
            {approvedDevelopers.length}
          </div>
          <div className="text-sm text-green-300">Approved</div>
          <div className="text-xs text-gray-400">Will show in assignments</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-yellow-400">
            {pendingDevelopers.length}
          </div>
          <div className="text-sm text-yellow-300">Pending/Null</div>
          <div className="text-xs text-gray-400">Need approval</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-red-400">
            {rejectedDevelopers.length}
          </div>
          <div className="text-sm text-red-300">Rejected</div>
          <div className="text-xs text-gray-400">Won't show</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-semibold text-blue-400">
            {allDevelopers.length}
          </div>
          <div className="text-sm text-blue-300">Total Devs</div>
          <div className="text-xs text-gray-400">All developers</div>
        </div>
      </div>

      {/* Issue Alert */}
      {approvedDevelopers.length === 0 && allDevelopers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <FaExclamationTriangle />
            <span className="font-semibold">Issue Detected!</span>
          </div>
          <p className="text-red-300 text-sm mb-3">
            You have {allDevelopers.length} developers but none are approved.
            This is why you can't see available developers in assignments.
          </p>
          <div className="text-xs text-gray-400">
            <strong>Quick Fix:</strong> Expand this panel and click "Quick
            Approve" for developers you want to make available.
          </div>
        </div>
      )}

      {/* Detailed View */}
      {isExpanded && (
        <div className="space-y-4">
          <h4 className="text-white font-medium">
            All Developers ({allDevelopers.length})
          </h4>

          {allDevelopers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No developers found in the system.
            </div>
          ) : (
            <div className="space-y-2">
              {allDevelopers.map((developer) => (
                <div
                  key={developer.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(developer.developerProfileStatus)}
                    <div>
                      <div className="text-white font-medium">
                        {developer.firstName} {developer.lastName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {developer.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${getStatusColor(
                          developer.developerProfileStatus
                        )}`}
                      >
                        {developer.developerProfileStatus || "null"}
                      </div>
                      <div className="text-xs text-gray-400">
                        User: {developer.status}
                      </div>
                    </div>

                    {(developer.developerProfileStatus === "pending" ||
                      !developer.developerProfileStatus) && (
                      <button
                        onClick={() =>
                          quickFixDeveloper(developer.id, developer.email)
                        }
                        disabled={fixingUsers.includes(developer.id)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {fixingUsers.includes(developer.id)
                          ? "Fixing..."
                          : "Quick Approve"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="text-blue-400 text-sm font-medium mb-1">
          How to Fix:
        </div>
        <div className="text-blue-300 text-xs space-y-1">
          <div>1. Expand this panel to see all developers</div>
          <div>
            2. Click "Quick Approve" for developers you want to make available
          </div>
          <div>3. Refresh the page and check assignments tab</div>
          <div>
            4. Alternatively, go to Developer Profiles tab and approve them
            manually
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDebugPanel;
