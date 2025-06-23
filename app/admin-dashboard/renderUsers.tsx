import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaLock,
  FaUnlock,
  FaUserCheck,
  FaUserTimes,
  FaUser,
  FaKey,
  FaRedo,
  FaCopy,
  FaCheckCircle,
  FaBan,
  FaExclamationTriangle,
  FaPaperPlane,
  FaArrowCircleLeft,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { UserRole } from "@/types/auth";

// Type definitions
interface SystemUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  company?: string;
  phone?: string;
  role: "admin" | "developer" | "client";
  status: "active" | "inactive" | "suspended";
  isActive: boolean;
  accountCreated: boolean;
  passwordGenerated: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  skills?: string[];
  hourlyRate?: number;
  projectsCount?: number;
  completedProjects?: number;
  activeProjects?: number;
  totalEarnings?: number;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company?: string;
  phone?: string;
  generatePassword?: boolean;
  skills?: string;
  hourlyRate?: string;
  status?: "active" | "inactive" | "suspended";
}

interface UserManagementProps {
  activeTab: string;
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  userSearchTerm: string;
  setUserSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  userRoleFilter: string;
  setUserRoleFilter: React.Dispatch<React.SetStateAction<string>>;
  userStatusFilter: string;
  setUserStatusFilter: React.Dispatch<React.SetStateAction<string>>;
}

interface EditingUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "developer" | "client";
  company?: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  skills: string;
  hourlyRate: string;
}

const defaultEditingForm: EditingUserForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "client",
  company: "",
  phone: "",
  status: "active",
  skills: "",
  hourlyRate: "",
};

const UserManagement: React.FC<UserManagementProps> = ({
  activeTab,
  users,
  setUsers,
  userSearchTerm,
  setUserSearchTerm,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
}) => {
  // State management
  const [viewMode, setViewMode] = useState<
    "list" | "create" | "edit" | "detail"
  >("list");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [editingUser, setEditingUser] =
    useState<EditingUserForm>(defaultEditingForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [devProfiles, setDevProfiles] = useState<any[]>([]);

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "client",
    company: "",
    phone: "",
    generatePassword: true,
    skills: "",
    hourlyRate: "",
    status: "active",
  });

  // Helper functions
  const getAccountStatusInfo = () => ({
    isActive: selectedUser?.isActive || false,
    role: selectedUser?.role || "client",
    permissions: selectedUser?.role === "admin" ? "all" : "limited",
    lastLogin: selectedUser?.lastLogin,
    accountCreated: selectedUser?.createdAt,
    lastPasswordChange: selectedUser?.updatedAt,
  });

  const generateRandomPassword = (length: number = 12): string => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => charset[x % charset.length])
      .join("");
  };

  const checkExistingAccount = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users`);
      const data = await response.json();

      if (data.success) {
        const user = data.users.find((u: any) => u._id === userId);
        if (user && user.passwordGenerated) {
          setAccountExists(true);
          setGeneratedPassword("");
        } else {
          setAccountExists(false);
          setGeneratedPassword("");
        }
      }
    } catch (error) {
      console.error("Error checking existing account:", error);
      setAccountExists(false);
    }
  };

  const generateCredentials = async () => {
    if (!selectedUser?._id) return;
    setIsCreatingAccount(true);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedUser._id,
          action: "reset_password",
          generatePassword: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      if (data.success) {
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id
              ? { ...user, passwordGenerated: true, isActive: true }
              : user
          )
        );
        setSelectedUser((prev) =>
          prev ? { ...prev, passwordGenerated: true, isActive: true } : null
        );
        setGeneratedPassword(data.generatedPassword);
        setAccountExists(true);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const copyCredentials = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(
        `Email: ${selectedUser?.email}\nPassword: ${generatedPassword}`
      );
      // You could add a toast notification here if you have one
    } catch (err) {
      setError("Failed to copy credentials to clipboard");
    }
  };

  const sendCredentials = async () => {
    if (!selectedUser?._id || !generatedPassword) return;
    try {
      setLoading(true);
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedUser._id,
          action: "send_credentials",
          email: selectedUser.email,
          password: generatedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send credentials");
      }

      if (data.success) {
        setError(null);
        // Clear the generated password after sending
        setGeneratedPassword("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = () => {
    // Implement your revoke access logic here
  };

  const restoreAccess = () => {
    // Implement your restore access logic here
  };

  const getRolePermissions = (role: UserRole) => {
    // Return array of permissions based on role
    return ["SOME_PERMISSION"];
  };

  // Reset form and view
  const resetView = () => {
    setViewMode("list");
    setSelectedUser(null);
    setEditingUser(defaultEditingForm);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "client",
      company: "",
      phone: "",
      generatePassword: true,
      skills: "",
      hourlyRate: "",
      status: "active",
    });
    setError(null);
  };

  // CRUD Functions
  const createUser = async (userData: CreateUserData): Promise<void> => {
    if (
      !userData.email ||
      !userData.firstName ||
      !userData.lastName ||
      !userData.role
    )
      return;
    try {
      setLoading(true);
      const password = userData.generatePassword
        ? generateRandomPassword()
        : undefined;

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          password,
          isActive: true,
          accountCreated: true,
          passwordGenerated: !!password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      if (data.success) {
        setUsers((prev) => [data.user, ...prev]);
        if (password) {
          setGeneratedPassword(password);
          setAccountExists(true);
        }
        setViewMode("list");
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    userData: Partial<SystemUser>
  ): Promise<void> => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: userId,
          ...userData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      // Update local state with the updated user
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, ...userData } : user
        )
      );
      setSelectedUser(null);
      setViewMode("list");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers(users.filter((user) => user._id !== userId));
      setSelectedUser(null);
      setViewMode("list");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: string
  ): Promise<void> => {
    if (!userId) return;
    try {
      setLoading(true);
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: userId,
          action: "update_status",
          status: newStatus,
          isActive: newStatus === "active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle user status");
      }

      if (data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId
              ? { ...user, status: newStatus, isActive: newStatus === "active" }
              : user
          )
        );
        if (selectedUser?._id === userId) {
          setSelectedUser((prev) =>
            prev
              ? { ...prev, status: newStatus, isActive: newStatus === "active" }
              : null
          );
        }
        setError(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle user status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const getFilteredUsers = (): SystemUser[] => {
    const mappedUsers = users.map((user) => {
      if (user.role === "developer") {
        const devProfile = devProfiles.find(
          (profile) => profile.email === user.email.toLowerCase()
        );

        if (devProfile) {
          console.log("Found matching dev profile for user:", user.email);
          return {
            ...user,
            skills:
              devProfile.technicalSkills?.primarySkills?.map(
                (skill: any) => skill.name
              ) || user.skills,
            hourlyRate:
              devProfile.professionalInfo?.hourlyRate || user.hourlyRate,
            completedProjects:
              devProfile.projects?.filter((p: any) => p.status === "completed")
                ?.length || user.completedProjects,
            activeProjects:
              devProfile.projects?.filter(
                (p: any) => p.status === "in-progress"
              )?.length || user.activeProjects,
            totalEarnings:
              devProfile.projects?.reduce(
                (sum: number, p: any) => sum + (p.budget || 0),
                0
              ) || user.totalEarnings,
          };
        } else {
          console.log(
            "No matching dev profile found for developer:",
            user.email
          );
        }
      }
      return user;
    });

    console.log("Mapped users with dev profiles:", mappedUsers);

    return mappedUsers.filter((user) => {
      const searchMatch =
        user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase());

      const roleMatch =
        userRoleFilter === "all" || user.role === userRoleFilter;

      const statusMatch =
        userStatusFilter === "all" || user.status === userStatusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  };

  // Utility functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "developer":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      case "client":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "inactive":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "suspended":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <FaUserCheck className="w-3 h-3 text-green-400" />;
      case "inactive":
        return <FaUserTimes className="w-3 h-3 text-yellow-400" />;
      case "suspended":
        return <FaLock className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    if (viewMode === "create") {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else if (viewMode === "edit") {
      setEditingUser((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode === "create") {
      createUser(formData);
    } else if (viewMode === "edit" && selectedUser) {
      const updatedData: Partial<SystemUser> = {
        ...editingUser,
        skills: editingUser.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hourlyRate: editingUser.hourlyRate
          ? Number(editingUser.hourlyRate)
          : undefined,
      };
      updateUser(selectedUser._id, updatedData);
      setViewMode("list");
    }
    setIsEditing(false);
  };

  // Render create form
  const renderCreateForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Create New User
          </h3>
          <p className="text-gray-400">Add a new user to the system</p>
        </div>
        <button
          onClick={resetView}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <FaTimes />
          <span>Cancel</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Enter email address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role *
              </label>
              <select
                required
                value={formData.role || "client"}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option value="client" className="bg-gray-800">
                  Client
                </option>
                <option value="developer" className="bg-gray-800">
                  Developer
                </option>
                <option value="admin" className="bg-gray-800">
                  Admin
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company || ""}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generatePassword"
              checked={formData.generatePassword || false}
              onChange={(e) =>
                handleInputChange("generatePassword", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="generatePassword" className="text-sm text-gray-300">
              Generate password automatically
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
            >
              <FaSave />
              <span>{loading ? "Creating..." : "Create User"}</span>
            </button>
            <button
              type="button"
              onClick={resetView}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render edit form
  const renderEditForm = () => {
    if (!selectedUser) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Edit User
            </h3>
            <p className="text-gray-400">Update user information</p>
          </div>
          <button
            onClick={resetView}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <FaTimes />
            <span>Cancel</span>
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.firstName ?? selectedUser.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.lastName ?? selectedUser.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={editingUser.email ?? selectedUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={editingUser.role ?? selectedUser.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="client" className="bg-gray-800">
                    Client
                  </option>
                  <option value="developer" className="bg-gray-800">
                    Developer
                  </option>
                  <option value="admin" className="bg-gray-800">
                    Admin
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={editingUser.company ?? selectedUser.company ?? ""}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={editingUser.phone ?? selectedUser.phone ?? ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={editingUser.status ?? selectedUser.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option value="active" className="bg-gray-800">
                  Active
                </option>
                <option value="inactive" className="bg-gray-800">
                  Inactive
                </option>
                <option value="suspended" className="bg-gray-800">
                  Suspended
                </option>
              </select>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <FaSave />
                <span>{loading ? "Updating..." : "Update User"}</span>
              </button>
              <button
                type="button"
                onClick={resetView}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render user details view
  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <div className="min-h-screen  rounded-2xl bg-white/5 backdrop-blur-xl">
        {/* Header Section */}
        <div className="relative overflow-hidden  rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8 cursor-pointer p-2  rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/20 transition-all">
                  <FaArrowCircleLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">Back to Users</span>
              </button>

              {/* User Status and Role */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <FaUser className="text-blue-400" />
                  <span className="text-white font-medium capitalize">
                    {selectedUser.role}
                  </span>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 ${getStatusColor(
                    selectedUser.status || "inactive"
                  )}`}
                >
                  {selectedUser.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Profile Header */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white font-semibold text-3xl">
                  {selectedUser.firstName.charAt(0)}
                  {selectedUser.lastName.charAt(0)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
                {selectedUser.firstName} {selectedUser.lastName}
              </h1>
              <p className="text-xl text-blue-200 font-medium">
                {selectedUser.company || "Independent User"}
              </p>
              <p className="text-gray-400 mt-2">
                Member since {formatDate(selectedUser.createdAt || "")}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mt-6 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      Personal Information
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <FaEdit className="text-sm" />
                    <span>{isEditing ? "Cancel Edit" : "Edit Details"}</span>
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as
                                | "client"
                                | "developer"
                                | "admin",
                            })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        >
                          <option value="client" className="bg-gray-800">
                            Client
                          </option>
                          <option value="developer" className="bg-gray-800">
                            Developer
                          </option>
                          <option value="admin" className="bg-gray-800">
                            Admin
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as
                                | "active"
                                | "inactive"
                                | "suspended",
                            })
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        >
                          <option value="active" className="bg-gray-800">
                            Active
                          </option>
                          <option value="inactive" className="bg-gray-800">
                            Inactive
                          </option>
                          <option value="suspended" className="bg-gray-800">
                            Suspended
                          </option>
                        </select>
                      </div>
                    </div>

                    {formData.role === "developer" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-blue-300 mb-2">
                            Skills (comma separated)
                          </label>
                          <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                skills: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                            placeholder="React, Node.js, Python..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-300 mb-2">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                hourlyRate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-xl transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-blue-300 text-sm font-medium mb-2">
                          Contact Information
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <FaEnvelope className="text-blue-400 text-sm" />
                            <span className="text-white">
                              {selectedUser.email}
                            </span>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-center space-x-3">
                              <FaPhone className="text-blue-400 text-sm" />
                              <span className="text-white">
                                {selectedUser.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-blue-300 text-sm font-medium mb-2">
                          Professional Details
                        </p>
                        <div className="space-y-2">
                          <p className="text-white">
                            <span className="text-gray-400">Role:</span>{" "}
                            {selectedUser.role}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Status:</span>{" "}
                            {selectedUser.status}
                          </p>
                          {selectedUser.hourlyRate && (
                            <p className="text-white">
                              <span className="text-gray-400">Rate:</span> $
                              {selectedUser.hourlyRate}/hour
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                      <div>
                        <p className="text-blue-300 text-sm font-medium mb-3">
                          Skills & Expertise
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {selectedUser.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-400/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Login Credentials Card */}
              {/* Enhanced Login Credentials Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FaKey className="text-white text-sm" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    Login Credentials
                  </h3>
                  {accountExists && (
                    <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full">
                      <FaUser className="text-blue-400 text-xs" />
                      <span className="text-blue-300 text-xs font-medium">
                        Account Exists
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          Email
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              getAccountStatusInfo().isActive
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <span
                            className={`text-sm ${
                              getAccountStatusInfo().isActive
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {getAccountStatusInfo().isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 font-mono text-lg bg-black/20 px-4 py-3 rounded-lg border border-white/10">
                        {selectedUser.email}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          Password
                        </h4>
                        <span className="text-yellow-400 text-sm">
                          {generatedPassword
                            ? "Just Generated"
                            : getAccountStatusInfo().lastPasswordChange
                            ? `Changed ${formatDate(
                                getAccountStatusInfo().lastPasswordChange || ""
                              )}`
                            : accountExists
                            ? "Existing Password"
                            : "Not Generated"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          {generatedPassword ? (
                            <div className="space-y-2">
                              <p className="text-green-300 font-mono text-sm bg-green-900/20 px-4 py-3 rounded-lg border border-green-400/30 break-all">
                                {generatedPassword}
                              </p>
                              <p className="text-xs text-green-400">
                                ✓ New password generated -{" "}
                                {accountExists
                                  ? "Account updated"
                                  : "Account created"}
                              </p>
                            </div>
                          ) : accountExists ? (
                            <div className="space-y-2">
                              <p className="text-blue-300 font-mono text-lg bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-400/30">
                                ••••••••••••
                              </p>
                              <p className="text-xs text-blue-400">
                                ✓ Account has existing password - Generate new
                                to reset
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 font-mono text-lg bg-black/20 px-4 py-3 rounded-lg border border-white/10">
                              ••••••••••••
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={generateCredentials}
                            disabled={isCreatingAccount}
                            className="px-4 py-3 bg-blue-600/30 hover:bg-blue-600/50 disabled:bg-gray-600/30 text-blue-300 disabled:text-gray-400 rounded-lg transition-all duration-300"
                            title={
                              accountExists
                                ? "Reset password"
                                : "Generate password and create account"
                            }
                          >
                            {isCreatingAccount ? (
                              <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full"></div>
                            ) : (
                              <FaRedo className="text-sm" />
                            )}
                          </button>
                          {(generatedPassword || accountExists) && (
                            <button
                              onClick={copyCredentials}
                              className="px-4 py-3 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg transition-all duration-300"
                              title="Copy credentials info"
                            >
                              <FaCopy className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Account Status Alert */}
                  <div
                    className={`${
                      generatedPassword
                        ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
                        : accountExists
                        ? getAccountStatusInfo().isActive
                          ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20"
                          : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/20"
                        : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20"
                    } border rounded-xl p-6`}
                  >
                    <div className="flex items-start space-x-3">
                      {generatedPassword ? (
                        <FaCheckCircle className="text-green-400 text-lg mt-1" />
                      ) : accountExists ? (
                        getAccountStatusInfo().isActive ? (
                          <FaUser className="text-blue-400 text-lg mt-1" />
                        ) : (
                          <FaBan className="text-red-400 text-lg mt-1" />
                        )
                      ) : (
                        <FaExclamationTriangle className="text-amber-400 text-lg mt-1" />
                      )}
                      <div>
                        <h4
                          className={`${
                            generatedPassword
                              ? "text-green-300"
                              : accountExists
                              ? getAccountStatusInfo().isActive
                                ? "text-blue-300"
                                : "text-red-300"
                              : "text-amber-300"
                          } font-semibold mb-2`}
                        >
                          {generatedPassword
                            ? accountExists
                              ? "Account Updated"
                              : "Account Created"
                            : accountExists
                            ? getAccountStatusInfo().isActive
                              ? "Existing Account"
                              : "Account Disabled"
                            : "No Account"}
                        </h4>
                        <div
                          className={`space-y-2 text-sm ${
                            generatedPassword
                              ? "text-green-200"
                              : accountExists
                              ? getAccountStatusInfo().isActive
                                ? "text-blue-200"
                                : "text-red-200"
                              : "text-amber-200"
                          }`}
                        >
                          {generatedPassword ? (
                            <>
                              <p>
                                ✓{" "}
                                {accountExists
                                  ? "Password updated for existing account"
                                  : "New account created with login credentials"}
                              </p>
                              <p>✓ User can now log in with the new password</p>
                              <p>• Role: {selectedUser.role}</p>
                              <p>
                                • Permissions:{" "}
                                {
                                  getRolePermissions(
                                    selectedUser.role as UserRole
                                  ).length
                                }{" "}
                                assigned
                              </p>
                            </>
                          ) : accountExists ? (
                            getAccountStatusInfo().isActive ? (
                              <>
                                <p>✓ Account exists and is active</p>
                                <p>• Role: {getAccountStatusInfo().role}</p>
                                <p>
                                  • Permissions:{" "}
                                  {getAccountStatusInfo().permissions} assigned
                                </p>
                                <p>
                                  • Last login:{" "}
                                  {getAccountStatusInfo().lastLogin
                                    ? formatDate(
                                        getAccountStatusInfo().lastLogin || ""
                                      )
                                    : "Never logged in"}
                                </p>
                                <p>
                                  • Account created:{" "}
                                  {formatDate(
                                    getAccountStatusInfo().accountCreated || ""
                                  )}
                                </p>
                                <p className="text-blue-300">
                                  • Generate new credentials to reset password
                                </p>
                              </>
                            ) : (
                              <>
                                <p>⚠ Account exists but is disabled</p>
                                <p>• Role: {getAccountStatusInfo().role}</p>
                                <p>
                                  • Account created:{" "}
                                  {formatDate(
                                    getAccountStatusInfo().accountCreated || ""
                                  )}
                                </p>
                                <p>
                                  • Last login:{" "}
                                  {getAccountStatusInfo().lastLogin
                                    ? formatDate(
                                        getAccountStatusInfo().lastLogin || ""
                                      )
                                    : "Never logged in"}
                                </p>
                                <p className="text-red-300">
                                  • Restore access to enable login
                                </p>
                              </>
                            )
                          ) : (
                            <>
                              <p>
                                • Click "Generate New Credentials" to create
                                account
                              </p>
                              <p>
                                • This will create login access for this user
                              </p>
                              <p>• Role will be: {selectedUser.role}</p>
                              <p>
                                • Will get{" "}
                                {
                                  getRolePermissions(
                                    selectedUser.role as UserRole
                                  ).length
                                }{" "}
                                permissions
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={generateCredentials}
                      disabled={isCreatingAccount}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <FaKey className="text-sm" />
                      <span className="text-sm">
                        {accountExists ? "Reset Password" : "Create Account"}
                      </span>
                    </button>

                    <button
                      onClick={sendCredentials}
                      disabled={!generatedPassword && !accountExists}
                      className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <FaPaperPlane className="text-sm" />
                      <span className="text-sm">Send Info</span>
                    </button>

                    {(generatedPassword || accountExists) && (
                      <button
                        onClick={copyCredentials}
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <FaCopy className="text-sm" />
                        <span className="text-sm">Copy Details</span>
                      </button>
                    )}

                    {accountExists && (
                      <button
                        onClick={
                          getAccountStatusInfo().isActive
                            ? revokeAccess
                            : restoreAccess
                        }
                        className={`px-4 py-3 bg-gradient-to-r ${
                          getAccountStatusInfo().isActive
                            ? "from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                            : "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        } text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg`}
                      >
                        {getAccountStatusInfo().isActive ? (
                          <FaBan className="text-sm" />
                        ) : (
                          <FaCheckCircle className="text-sm" />
                        )}
                        <span className="text-sm">
                          {getAccountStatusInfo().isActive
                            ? "Disable"
                            : "Enable"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Stats */}
            <div className="space-y-8">
              {/* Quick Actions Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Quick Actions
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaEdit />
                    <span>Edit User Details</span>
                  </button>

                  <button
                    onClick={generateCredentials}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaKey />
                    <span>Reset Password</span>
                  </button>

                  <button
                    onClick={sendCredentials}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaPaperPlane />
                    <span>Send Login Details</span>
                  </button>

                  <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                    <FaBan />
                    <span>Suspend Account</span>
                  </button>
                </div>
              </div>

              {/* User Statistics Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  User Statistics
                </h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-blue-400 mb-1">
                      {selectedUser.projectsCount || 0}
                    </div>
                    <p className="text-gray-400 text-sm">Total Projects</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold text-green-400 mb-1">
                        {selectedUser.completedProjects || 0}
                      </div>
                      <p className="text-gray-400 text-xs">Completed</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-yellow-400 mb-1">
                        {selectedUser.activeProjects || 0}
                      </div>
                      <p className="text-gray-400 text-xs">Active</p>
                    </div>
                  </div>

                  {selectedUser.totalEarnings && (
                    <div className="text-center pt-4 border-t border-white/10">
                      <div className="text-2xl font-semibold text-emerald-400 mb-1">
                        ${selectedUser.totalEarnings.toLocaleString()}
                      </div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this after other useEffects
  useEffect(() => {
    const fetchDevProfiles = async () => {
      try {
        const response = await fetch("/api/developer-profile");
        if (response.ok) {
          const data = await response.json();
          console.log("Raw dev profile data:", data);

          // If data is an object, wrap it in an array
          const profiles = Array.isArray(data) ? data : [data];

          // Filter out any invalid profiles and transform them
          const validProfiles = profiles
            .filter(
              (profile) =>
                profile && profile.personalInfo && profile.personalInfo.email
            )
            .map((profile) => ({
              ...profile,
              email: profile.personalInfo.email.toLowerCase(),
            }));

          console.log("Processed dev profiles:", validProfiles);
          console.log("Current users:", users);

          setDevProfiles(validProfiles);
        }
      } catch (err) {
        console.error("Failed to fetch developer profiles:", err);
      }
    };
    fetchDevProfiles();
  }, [users]);

  useEffect(() => {
    if (selectedUser && viewMode === "edit") {
      setEditingUser({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        role: selectedUser.role,
        company: selectedUser.company || "",
        phone: selectedUser.phone || "",
        status: selectedUser.status,
        skills: (selectedUser.skills || []).join(", "),
        hourlyRate: selectedUser.hourlyRate?.toString() || "",
      });
    }
  }, [selectedUser, viewMode]);

  // Main render based on view mode
  if (viewMode === "create") {
    return renderCreateForm();
  }

  if (viewMode === "edit") {
    return renderEditForm();
  }

  if (viewMode === "detail") {
    return renderUserDetails();
  }

  return (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white mb-2">
            {activeTab === "clients"
              ? "Client Management"
              : activeTab === "dev profiles"
              ? "Developer Management"
              : "User Management"}
          </h2>
          <p className="text-gray-400 mt-1">
            {activeTab === "clients"
              ? "Manage client accounts and information"
              : activeTab === "dev profiles"
              ? "Manage developer accounts and profiles"
              : "Manage all user accounts and permissions"}
          </p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FaPlus />
          <span>Add User</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* User Filters */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === "users" && (
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option value="all" className="bg-gray-800">
                  All Roles
                </option>
                <option value="admin" className="bg-gray-800">
                  Admin
                </option>
                <option value="developer" className="bg-gray-800">
                  Developer
                </option>
                <option value="client" className="bg-gray-800">
                  Client
                </option>
              </select>
            )}
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all" className="bg-gray-800">
                All Status
              </option>
              <option value="active" className="bg-gray-800">
                Active
              </option>
              <option value="inactive" className="bg-gray-800">
                Inactive
              </option>
              <option value="suspended" className="bg-gray-800">
                Suspended
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {getFilteredUsers().length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {getFilteredUsers().map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-500">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.company || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setViewMode("detail");
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditingUser({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              role: user.role,
                              company: user.company || "",
                              phone: user.phone || "",
                              status: user.status,
                              skills: (user.skills || []).join(", "),
                              hourlyRate: user.hourlyRate?.toString() || "",
                            });
                            setViewMode("edit");
                          }}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            toggleUserStatus(user._id, user.status)
                          }
                          className={`p-1 ${
                            user.status === "active"
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-green-400 hover:text-green-300"
                          }`}
                          title={
                            user.status === "active"
                              ? "Deactivate User"
                              : "Activate User"
                          }
                          disabled={loading}
                        >
                          {user.status === "active" ? <FaLock /> : <FaUnlock />}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete User"
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-semibold text-white">
            {users.length}
          </div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-semibold text-green-400">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-sm text-gray-400">Active Users</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-semibold text-blue-400">
            {users.filter((u) => u.role === "client").length}
          </div>
          <div className="text-sm text-gray-400">Clients</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-semibold text-purple-400">
            {users.filter((u) => u.role === "developer").length}
          </div>
          <div className="text-sm text-gray-400">Developers</div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
