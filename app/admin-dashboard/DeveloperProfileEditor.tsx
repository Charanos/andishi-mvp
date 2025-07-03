"use client";

import React, { useEffect, useState } from "react";
import {
  FaSave,
  FaSyncAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaStar,
  FaTrophy,
  FaCode,
  FaUsers,
  FaCalendar,
  FaClock,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

import type { DeveloperProfile, ToastNotification } from "../../lib/types";

interface Props {
  profileId?: string;
  initialProfile?: DeveloperProfile;
  onSaveSuccess?: (updated: DeveloperProfile) => void;
  onCancel?: () => void;
}

const DeveloperProfileEditor: React.FC<Props> = ({
  profileId,
  initialProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const [profile, setProfile] = useState<DeveloperProfile | null>(
    initialProfile ?? null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Custom toast notification functions
  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    const notification: ToastNotification = { id, type, message };
    setNotifications((prev) => [...prev, notification]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toast = {
    success: (message: string) => addNotification("success", message),
    error: (message: string) => addNotification("error", message),
    info: (message: string) => addNotification("info", message),
  };

  // Load initial or fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (initialProfile) {
        setLoading(false);
        return;
      }

      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching profile for ID: ${profileId}...`);
        const res = await fetch(`/api/developer-profiles?id=${profileId}`);
        if (!res.ok) {
          if (res.status === 404) {
            // Profile not found yet – start with blank template seeded from initialProfile if possible
            const seed: DeveloperProfile | null = initialProfile ?? null;
            if (seed) {
              setProfile(seed);
            }
            setLoading(false);
            return;
          }
          throw new Error(
            `Failed to fetch profile: ${res.status} ${res.statusText}`
          );
        }
        const profileData = await res.json();
        console.log("Received profile data:", profileData);

        // Initialize missing nested objects with default structures
        const initializedProfile: DeveloperProfile = {
          ...profileData,
          personalInfo: {
            firstName: "",
            lastName: "",
            email: "",
            location: "",
            tagline: "",
            ...profileData.personalInfo,
          },
          professionalInfo: {
            title: "",
            experienceLevel: "Mid-level",
            availability: "Full-time",
            hourlyRate: 50,
            languages: [],
            certifications: [],
            preferredWorkType: [],
            ...profileData.professionalInfo,
          },
          technicalSkills: {
            primarySkills: [],
            frameworks: [],
            databases: [],
            tools: [],
            cloudPlatforms: [],
            specializations: [],
            ...profileData.technicalSkills,
          },
          stats: {
            totalProjects: 0,
            averageRating: 0,
            totalEarnings: 0,
            clientRetention: 0,
            ...profileData.stats,
          },
          projects: profileData.projects || [],
          recentActivity: profileData.recentActivity || [],
        };

        setProfile(initializedProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Error loading developer profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  const handleChange = (section: string, field: string, value: any) => {
    if (!profile) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updated: DeveloperProfile = JSON.parse(JSON.stringify(prev));
      // @ts-ignore – dynamic indexing
      updated[section][field] = value;
      return updated;
    });
  };

  const handleArrayChange = (
    section: string,
    field: string,
    index: number,
    value: any
  ) => {
    if (!profile) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updated: DeveloperProfile = JSON.parse(JSON.stringify(prev));
      // @ts-ignore
      updated[section][field][index] = value;
      return updated;
    });
  };

  const isValidSection = (
    section: string
  ): section is keyof DeveloperProfile => {
    return [
      "personalInfo",
      "professionalInfo",
      "technicalSkills",
      "stats",
    ].includes(section);
  };

  const addArrayItem = (section: string, field: string, defaultItem: any) => {
    if (!profile) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updated: DeveloperProfile = JSON.parse(JSON.stringify(prev));

      if (!isValidSection(section)) return prev;
      const sectionObj = updated[section] as Record<string, any>;

      if (!sectionObj[field]) {
        sectionObj[field] = [];
      }
      sectionObj[field].push(defaultItem);
      return updated;
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    if (!profile) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updated: DeveloperProfile = JSON.parse(JSON.stringify(prev));
      // @ts-ignore
      updated[section][field].splice(index, 1);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!profile || !profileId) return;
    setSaving(true);
    try {
      console.log(`Saving profile to /api/developer-profiles/${profileId}...`);
      const res = await fetch(`/api/developer-profiles/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        throw new Error(`Save failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Profile saved successfully:", data);
      toast.success("Profile updated successfully");
      if (onSaveSuccess) {
        onSaveSuccess(data as DeveloperProfile);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        {/* Custom Toast Notifications */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md transition-all transform ${
              notification.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : notification.type === "error"
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-blue-500/20 border-blue-500/30 text-blue-400"
            }`}
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                {notification.type === "success" && <FaCheck />}
                {notification.type === "error" && <FaTimes />}
                {notification.type === "info" && <FaInfoCircle />}
                <span className="font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center min-h-screen bg-white/5 backdrop-blur-none">
          <div className="text-center">
            <FaSyncAlt className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading developer profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        {/* Custom Toast Notifications */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md transition-all transform ${
              notification.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : notification.type === "error"
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-blue-500/20 border-blue-500/30 text-blue-400"
            }`}
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                {notification.type === "success" && <FaCheck />}
                {notification.type === "error" && <FaTimes />}
                {notification.type === "info" && <FaInfoCircle />}
                <span className="font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
        <div className="min-h-screen bg-white/5 backdrop-blur-none">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">No developer profile found.</p>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: FaUsers },
    { id: "professional", label: "Professional", icon: FaCode },
    { id: "skills", label: "Technical Skills", icon: FaStar },
    { id: "stats", label: "Statistics", icon: FaCalendar },
  ];

  const renderPersonalInfo = () => (
    <section className="bg-white/5 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <FaUsers className="text-blue-400" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(profile.personalInfo).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            {key === "bio" ? (
              <textarea
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white min-h-[100px] resize-vertical"
                value={(value as string) || ""}
                onChange={(e) =>
                  handleChange("personalInfo", key, e.target.value)
                }
              />
            ) : (
              <input
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                value={(value as string) || ""}
                onChange={(e) =>
                  handleChange("personalInfo", key, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const renderProfessionalInfo = () => (
    <section className="bg-white/5 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <FaCode className="text-green-400" />
        Professional Information
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(profile.professionalInfo)
            .filter(
              ([key]) =>
                !["languages", "certifications", "preferredWorkType"].includes(
                  key
                )
            )
            .map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm text-gray-300 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                {key === "bio" ? (
                  <textarea
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white min-h-[120px] resize-vertical"
                    value={(value as string) || ""}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                  />
                ) : key === "experienceLevel" ? (
                  <select
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                    value={(value as string) || "Mid-level"}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Architect">Architect</option>
                  </select>
                ) : key === "availability" ? (
                  <select
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                    value={(value as string) || "Full-time"}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Not available">Not available</option>
                  </select>
                ) : key === "professionalInfo" ? (
                  <input
                    type="number"
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                    value={value as number}
                    onChange={(e) =>
                      handleChange(
                        "professionalInfo",
                        key,
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                ) : (
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                    value={(value as string) || ""}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
        </div>

        {/* Languages */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-2">Languages</label>
          <div className="space-y-2">
            {(profile.professionalInfo.languages || []).map((lang, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1"
                  value={lang}
                  onChange={(e) =>
                    handleArrayChange(
                      "professionalInfo",
                      "languages",
                      index,
                      e.target.value
                    )
                  }
                  placeholder="e.g., English (Native)"
                />
                <button
                  onClick={() =>
                    removeArrayItem("professionalInfo", "languages", index)
                  }
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("professionalInfo", "languages", "")}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPlus /> Add Language
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-2">Certifications</label>
          <div className="space-y-2">
            {(profile.professionalInfo.certifications || []).map(
              (cert, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1"
                    value={cert}
                    onChange={(e) =>
                      handleArrayChange(
                        "professionalInfo",
                        "certifications",
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g., AWS Certified Developer"
                  />
                  <button
                    onClick={() =>
                      removeArrayItem(
                        "professionalInfo",
                        "certifications",
                        index
                      )
                    }
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              )
            )}
            <button
              onClick={() =>
                addArrayItem("professionalInfo", "certifications", "")
              }
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPlus /> Add Certification
            </button>
          </div>
        </div>

        {/* Preferred Work Type */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-2">
            Preferred Work Type
          </label>
          <div className="space-y-2">
            {(profile.professionalInfo.preferredWorkType || []).map(
              (workType, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1"
                    value={workType}
                    onChange={(e) =>
                      handleArrayChange(
                        "professionalInfo",
                        "preferredWorkType",
                        index,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select work type</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Travel">Travel</option>
                  </select>
                  <button
                    onClick={() =>
                      removeArrayItem(
                        "professionalInfo",
                        "preferredWorkType",
                        index
                      )
                    }
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              )
            )}
            <button
              onClick={() =>
                addArrayItem("professionalInfo", "preferredWorkType", "")
              }
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPlus /> Add Work Type
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSkillSection = (
    sectionTitle: string,
    skillKey: string,
    icon: React.ComponentType<{ className?: string }>
  ) => {
    const IconComponent = icon;
    const skills =
      (profile.technicalSkills[
        skillKey as keyof typeof profile.technicalSkills
      ] as any[]) || [];

    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <IconComponent className="text-purple-400" />
          {sectionTitle}
        </h4>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Skill Name
                  </label>
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={skill.name || ""}
                    onChange={(e) => {
                      const updatedSkill = { ...skill, name: e.target.value };
                      handleArrayChange(
                        "technicalSkills",
                        skillKey,
                        index,
                        updatedSkill
                      );
                    }}
                    placeholder="e.g., JavaScript"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Level (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={skill.level || 1}
                    onChange={(e) => {
                      const updatedSkill = {
                        ...skill,
                        level: parseInt(e.target.value) || 1,
                      };
                      handleArrayChange(
                        "technicalSkills",
                        skillKey,
                        index,
                        updatedSkill
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Category</label>
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={skill.category || ""}
                    onChange={(e) => {
                      const updatedSkill = {
                        ...skill,
                        category: e.target.value,
                      };
                      handleArrayChange(
                        "technicalSkills",
                        skillKey,
                        index,
                        updatedSkill
                      );
                    }}
                    placeholder="e.g., Frontend"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Last Used
                  </label>
                  <input
                    type="date"
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={skill.lastUsed || ""}
                    onChange={(e) => {
                      const updatedSkill = {
                        ...skill,
                        lastUsed: e.target.value,
                      };
                      handleArrayChange(
                        "technicalSkills",
                        skillKey,
                        index,
                        updatedSkill
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Endorsements
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={skill.endorsements || 0}
                    onChange={(e) => {
                      const updatedSkill = {
                        ...skill,
                        endorsements: parseInt(e.target.value) || 0,
                      };
                      handleArrayChange(
                        "technicalSkills",
                        skillKey,
                        index,
                        updatedSkill
                      );
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      removeArrayItem("technicalSkills", skillKey, index)
                    }
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded text-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              addArrayItem("technicalSkills", skillKey, {
                name: "",
                level: 1,
                category: "",
                trending: "",
                endorsements: 0,
                lastUsed: "",
              })
            }
            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Add {sectionTitle.slice(0, -1)}
          </button>
        </div>
      </div>
    );
  };

  const renderTechnicalSkills = () => (
    <section className="bg-white/5 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <FaStar className="text-yellow-400" />
        Technical Skills
      </h3>
      <div className="space-y-8">
        {renderSkillSection("Primary Skills", "primarySkills", FaStar)}
        {renderSkillSection("Frameworks", "frameworks", FaCode)}
        {renderSkillSection("Databases", "databases", FaClock)}
        {renderSkillSection("Tools", "tools", FaEdit)}

        {/* Simple array fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2">
              Cloud Platforms
            </label>
            <div className="space-y-2">
              {(profile.technicalSkills.cloudPlatforms || []).map(
                (platform, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1"
                      value={platform}
                      onChange={(e) =>
                        handleArrayChange(
                          "technicalSkills",
                          "cloudPlatforms",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., AWS"
                    />
                    <button
                      onClick={() =>
                        removeArrayItem(
                          "technicalSkills",
                          "cloudPlatforms",
                          index
                        )
                      }
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )
              )}
              <button
                onClick={() =>
                  addArrayItem("technicalSkills", "cloudPlatforms", "")
                }
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
              >
                <FaPlus /> Add Platform
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2">
              Specializations
            </label>
            <div className="space-y-2">
              {(profile.technicalSkills.specializations || []).map(
                (spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1"
                      value={spec}
                      onChange={(e) =>
                        handleArrayChange(
                          "technicalSkills",
                          "specializations",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., Machine Learning"
                    />
                    <button
                      onClick={() =>
                        removeArrayItem(
                          "technicalSkills",
                          "specializations",
                          index
                        )
                      }
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )
              )}
              <button
                onClick={() =>
                  addArrayItem("technicalSkills", "specializations", "")
                }
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2"
              >
                <FaPlus /> Add Specialization
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderStats = () => (
    <section className="bg-white/5 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <FaTrophy className="text-orange-400" />
        Statistics & Performance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(profile.stats).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            {key === "averageRating" || key === "clientRetention" ? (
              <input
                type="number"
                step="0.1"
                min="0"
                max={key === "averageRating" ? "5" : "100"}
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                value={value as number}
                onChange={(e) =>
                  handleChange("stats", key, parseFloat(e.target.value) || 0)
                }
              />
            ) : (
              <input
                type="number"
                min="0"
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                value={value as number}
                onChange={(e) =>
                  handleChange("stats", key, parseInt(e.target.value) || 0)
                }
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen ">
      {/* Custom Toast Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md transition-all transform ${
            notification.type === "success"
              ? "bg-green-500/20 border-green-500/30 text-green-400"
              : notification.type === "error"
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-blue-500/20 border-blue-500/30 text-blue-400"
          }`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              {notification.type === "success" && <FaCheck />}
              {notification.type === "error" && <FaTimes />}
              {notification.type === "info" && <FaInfoCircle />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Developer Profile Editor
                </h1>
                <p className="text-gray-300">
                  Manage your professional developer profile
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={onCancel}
                  className="bg-white/10 cursor-pointer hover:bg-white/20 text-slate-300 hover:text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <IconComponent />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {activeTab === "personal" && renderPersonalInfo()}
            {activeTab === "professional" && renderProfessionalInfo()}
            {activeTab === "skills" && renderTechnicalSkills()}
            {activeTab === "stats" && renderStats()}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Your profile information is securely stored and can be updated
                at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DeveloperProfileEditor;
