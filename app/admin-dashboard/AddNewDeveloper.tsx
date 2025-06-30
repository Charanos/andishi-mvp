"use client";

import React, { useState } from "react";
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
  FaUserPlus,
  FaArrowLeft,
} from "react-icons/fa";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

import type { DeveloperProfile } from "../../lib/types";
import { IoMdArrowBack, IoMdArrowDropleftCircle } from "react-icons/io";

interface Props {
  onCreate: (newProfile: DeveloperProfile) => void;
  onCancel: () => void;
}

const AddNewDeveloper: React.FC<Props> = ({ onCreate, onCancel }) => {
  // Initialize with empty profile structure
  const [profile, setProfile] = useState<DeveloperProfile>({
    id: `dev_${Date.now()}`, // Temporary ID, will be replaced by backend
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      portfolio: "",
      tagline: "",
      bio: "",
    },
    professionalInfo: {
      title: "",
      experienceLevel: "Mid-level",
      availability: "Full-time",
      hourlyRate: 50,
      bio: "",
      languages: [],
      certifications: [],
      preferredWorkType: [],
    },
    technicalSkills: {
      primarySkills: [],
      frameworks: [],
      databases: [],
      tools: [],
      cloudPlatforms: [],
      specializations: [],
    },
    stats: {
      totalProjects: 0,
      averageRating: 0,
      totalEarnings: 0,
      clientRetention: 0,
    },
    projects: [],
    recentActivity: [],
  });

  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Custom toast notification functions
  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message };
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

  const handleChange = (section: string, field: string, value: any) => {
    setProfile((prev) => {
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
    setProfile((prev) => {
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
    setProfile((prev) => {
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
    setProfile((prev) => {
      const updated: DeveloperProfile = JSON.parse(JSON.stringify(prev));
      // @ts-ignore
      updated[section][field].splice(index, 1);
      return updated;
    });
  };

  const validateProfile = (): boolean => {
    const { personalInfo, professionalInfo, technicalSkills } = profile;

    // Required fields validation
    if (!personalInfo.firstName.trim()) {
      toast.error("First name is required");
      setActiveTab("personal");
      return false;
    }

    if (!personalInfo.lastName.trim()) {
      toast.error("Last name is required");
      setActiveTab("personal");
      return false;
    }

    if (!personalInfo.email.trim()) {
      toast.error("Email is required");
      setActiveTab("personal");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      toast.error("Please enter a valid email address");
      setActiveTab("personal");
      return false;
    }

    if (!professionalInfo.title.trim()) {
      toast.error("Professional title is required");
      setActiveTab("professional");
      return false;
    }

    if (technicalSkills.primarySkills.length === 0) {
      toast.error("At least one primary skill is required");
      setActiveTab("skills");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateProfile()) return;

    setCreating(true);
    try {
      console.log("Creating new developer profile...");
      const res = await fetch("/api/developer-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error(`Creation failed: ${res.status} ${res.statusText}`);
      }

      const newProfile = await res.json();
      console.log("Developer profile created successfully:", newProfile);
      toast.success("Developer profile created successfully!");

      onCreate(newProfile as DeveloperProfile);
    } catch (err) {
      console.error("Error creating profile:", err);
      toast.error("Error creating developer profile");
    } finally {
      setCreating(false);
    }
  };

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
        <span className="text-red-400 text-sm ml-2">* Required</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(profile.personalInfo).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2 capitalize flex items-center gap-1">
              {key.replace(/([A-Z])/g, " $1")}
              {["firstName", "lastName", "email"].includes(key) && (
                <span className="text-red-400">*</span>
              )}
            </label>
            {key === "bio" ? (
              <textarea
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white min-h-[100px] resize-vertical focus:border-blue-400 focus:outline-none transition-colors"
                value={(value as string) || ""}
                onChange={(e) =>
                  handleChange("personalInfo", key, e.target.value)
                }
                placeholder="Tell us about yourself..."
              />
            ) : (
              <input
                className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                type={key === "email" ? "email" : "text"}
                value={(value as string) || ""}
                onChange={(e) =>
                  handleChange("personalInfo", key, e.target.value)
                }
                placeholder={
                  key === "firstName"
                    ? "John"
                    : key === "lastName"
                    ? "Doe"
                    : key === "email"
                    ? "john.doe@example.com"
                    : key === "location"
                    ? "New York, NY"
                    : key === "portfolio"
                    ? "https://johndoe.dev"
                    : key === "tagline"
                    ? "Full-stack developer with passion for clean code"
                    : ""
                }
                required={["firstName", "lastName", "email"].includes(key)}
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
        <span className="text-red-400 text-sm ml-2">* Title Required</span>
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
                <label className="text-sm text-gray-300 mb-2 capitalize flex items-center gap-1">
                  {key.replace(/([A-Z])/g, " $1")}
                  {key === "title" && <span className="text-red-400">*</span>}
                </label>
                {key === "bio" ? (
                  <textarea
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white min-h-[120px] resize-vertical focus:border-blue-400 focus:outline-none transition-colors"
                    value={(value as string) || ""}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                    placeholder="Describe your professional experience and expertise..."
                  />
                ) : key === "experienceLevel" ? (
                  <select
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
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
                ) : key === "hourlyRate" ? (
                  <input
                    type="number"
                    min="0"
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                    value={value as number}
                    onChange={(e) =>
                      handleChange(
                        "professionalInfo",
                        key,
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="50"
                  />
                ) : (
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                    value={(value as string) || ""}
                    onChange={(e) =>
                      handleChange("professionalInfo", key, e.target.value)
                    }
                    placeholder={key === "title" ? "Full Stack Developer" : ""}
                    required={key === "title"}
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
                  className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1 focus:border-blue-400 focus:outline-none transition-colors"
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
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem("professionalInfo", "languages", "")}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1 focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded transition-colors"
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
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1 focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded transition-colors"
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
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
          {skillKey === "primarySkills" && (
            <span className="text-red-400 text-sm ml-2">
              * At least one required
            </span>
          )}
        </h4>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Skill Name{" "}
                    {skillKey === "primarySkills" && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <input
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none transition-colors"
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
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded text-sm transition-colors"
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
            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
        <span className="text-red-400 text-sm ml-2">
          * At least one primary skill required
        </span>
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
                      className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1 focus:border-blue-400 focus:outline-none transition-colors"
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
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded transition-colors"
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
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
                      className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white flex-1 focus:border-blue-400 focus:outline-none transition-colors"
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
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded transition-colors"
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
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
        Initial Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(profile.stats).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
              {key === "averageRating" && " (0-5)"}
              {key === "clientRetention" && " (0-100%)"}
            </label>
            <input
              type="number"
              min="0"
              max={
                key === "averageRating"
                  ? 5
                  : key === "clientRetention"
                  ? 100
                  : undefined
              }
              step={key === "averageRating" ? "0.1" : "1"}
              className="bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
              value={value}
              onChange={(e) =>
                handleChange(
                  "stats",
                  key,
                  key === "averageRating"
                    ? parseFloat(e.target.value) || 0
                    : parseInt(e.target.value) || 0
                )
              }
              placeholder={
                key === "totalProjects"
                  ? "0"
                  : key === "averageRating"
                  ? "0.0"
                  : key === "totalEarnings"
                  ? "0"
                  : key === "clientRetention"
                  ? "0"
                  : "0"
              }
            />
          </div>
        ))}
      </div>
    </section>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalInfo();
      case "professional":
        return renderProfessionalInfo();
      case "skills":
        return renderTechnicalSkills();
      case "stats":
        return renderStats();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center gap-3 max-w-sm animate-slide-in ${
              notification.type === "success"
                ? "bg-green-900/90 border-green-400 text-green-100"
                : notification.type === "error"
                ? "bg-red-900/90 border-red-400 text-red-100"
                : "bg-blue-900/90 border-blue-400 text-blue-100"
            }`}
          >
            {notification.type === "success" && (
              <FaCheck className="text-green-400" />
            )}
            {notification.type === "error" && (
              <FaTimes className="text-red-400" />
            )}
            {notification.type === "info" && (
              <FaInfoCircle className="text-blue-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="bg-gray-500/5  hover:bg-gray-500/40 text-gray-300 px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer transition-colors"
              >
                <IoMdArrowBack className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Add New Developer
              <FaUserPlus className="text-blue-400" />
            </h1>
          </div>
          <p className="text-gray-300">
            Create a comprehensive profile for a new developer. Fill in all
            required fields marked with *.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 rounded-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <IconComponent />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">{renderTabContent()}</div>

        {/* Action Buttons */}
        <div className="bg-white/5 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={creating}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes />
                Cancel
              </button>
            )}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
            >
              {creating ? (
                <>
                  <FaSyncAlt className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaSave />
                  Create Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddNewDeveloper;
