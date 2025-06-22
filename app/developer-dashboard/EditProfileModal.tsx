"use client";

import { DeveloperProfile } from "./page";
import { FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from "react";

interface EditProfileModalProps {
  profile: DeveloperProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: DeveloperProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<DeveloperProfile>(profile);

  // Reset formData when modal opens/closes or profile changes
  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  const handleInputChange = (
    section: keyof DeveloperProfile,
    field: string,
    value: string
  ) => {
    setFormData((prev: DeveloperProfile) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      } as (typeof prev)[typeof section],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0D0E]50 backdrop-blur-xl  flex items-center justify-center z-50">
      <div className="bg-[#0B0D0E] bg-[url('/bg-gradient-overlay.svg')] bg-center bg-cover backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Personal Information */}
          <div>
            <h3 className="text-purple-400 font-semibold mb-2 monty uppercase my-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.personalInfo.firstName}
                onChange={(e) =>
                  handleInputChange("personalInfo", "firstName", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.personalInfo.lastName}
                onChange={(e) =>
                  handleInputChange("personalInfo", "lastName", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.personalInfo.email}
                onChange={(e) =>
                  handleInputChange("personalInfo", "email", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.personalInfo.phone}
                onChange={(e) =>
                  handleInputChange("personalInfo", "phone", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.personalInfo.location}
                onChange={(e) =>
                  handleInputChange("personalInfo", "location", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Time Zone"
                value={formData.personalInfo.timeZone}
                onChange={(e) =>
                  handleInputChange("personalInfo", "timeZone", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formData.personalInfo.linkedin}
                onChange={(e) =>
                  handleInputChange("personalInfo", "linkedin", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={formData.personalInfo.github}
                onChange={(e) =>
                  handleInputChange("personalInfo", "github", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-white font-semibold mb-2">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.professionalInfo.title}
                onChange={(e) =>
                  handleInputChange("professionalInfo", "title", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Experience Level"
                value={formData.professionalInfo.experienceLevel}
                onChange={(e) =>
                  handleInputChange(
                    "professionalInfo",
                    "experienceLevel",
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Years of Experience"
                value={formData.professionalInfo.yearsOfExperience}
                onChange={(e) =>
                  handleInputChange(
                    "professionalInfo",
                    "yearsOfExperience",
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Availability"
                value={formData.professionalInfo.availability}
                onChange={(e) =>
                  handleInputChange(
                    "professionalInfo",
                    "availability",
                    e.target.value
                  )
                }
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 cursor-pointer text-gray-300 hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600/55 cursor-pointer text-white hover:bg-blue-700/55 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
