"use client";

import { useState } from "react";
import {
  X,
  Upload,
  FileText,
  Zap,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useAssessmentActions } from "@/hooks/useAssessmentActions";

interface AutoAssessModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: {
    id: string;
    name?: string;
    email?: string;
  };
  onAssessmentCreated?: (assessment: any) => void;
}

export default function AutoAssessModal({
  isOpen,
  onClose,
  developer,
  onAssessmentCreated,
}: AutoAssessModalProps) {
  const { createAutoAssessment, loading } = useAssessmentActions();
  const [formData, setFormData] = useState({
    evaluationType: "initial" as "initial" | "periodic" | "project_based",
    notes: "",
    resumeFile: null as File | null,
  });
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createAutoAssessment(
      developer.id,
      formData.evaluationType,
      formData.resumeFile || undefined,
      formData.notes
    );

    if (result) {
      onAssessmentCreated?.(result.assessment);
      onClose();
      setFormData({ evaluationType: "initial", notes: "", resumeFile: null });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("text/")) {
        setFormData((prev) => ({ ...prev, resumeFile: file }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, resumeFile: e.target.files![0] }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Auto-Generate Assessment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create assessment for {developer.name || "developer"} using AI
              analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Developer Info */}
          <div className="bg-gray-100/80 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Developer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {developer.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {developer.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Assessment Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "initial",
                  label: "Initial",
                  desc: "First-time evaluation",
                },
                {
                  value: "periodic",
                  label: "Periodic",
                  desc: "Regular review",
                },
                {
                  value: "project_based",
                  label: "Project-Based",
                  desc: "Specific project eval",
                },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.evaluationType === type.value
                      ? "border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-500/10"
                      : "border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="evaluationType"
                    value={type.value}
                    checked={formData.evaluationType === type.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        evaluationType: e.target.value as any,
                      }))
                    }
                    className="sr-only"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {type.label}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {type.desc}
                  </span>
                  {formData.evaluationType === type.value && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Resume/CV (Optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? "border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-500/10"
                  : "border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {formData.resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formData.resumeFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, resumeFile: null }))
                    }
                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    Drop resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PDF, TXT, DOC, DOCX up to 10MB
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-2">
              Resume will be analyzed for skills, experience, and technical
              expertise
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
              placeholder="Any specific context or requirements for this assessment..."
            />
          </div>

          {/* AI Features Preview */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-300 dark:border-purple-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Analysis Features
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Skills extraction from resume</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Experience level assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Technical score estimation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Rate suggestion based on skills</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
