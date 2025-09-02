"use client";

import { useState } from "react";
import { ArrowLeft, Mail, User, MessageSquare, Send, Loader2 } from "lucide-react";
import { useAssessmentActions } from "@/hooks/useAssessmentActions";

interface EvaluationInviteViewProps {
  onBack: () => void;
  assessment: {
    id: string;
    developerName?: string;
    developerEmail?: string;
    evaluationType: string;
  };
}

export default function EvaluationInviteView({
  onBack,
  assessment,
}: EvaluationInviteViewProps) {
  const { sendEvaluationInvite, loading } = useAssessmentActions();
  const [formData, setFormData] = useState({
    evaluatorEmail: "",
    evaluatorName: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await sendEvaluationInvite(
      assessment.id,
      formData.evaluatorEmail,
      formData.evaluatorName,
      formData.message
    );

    if (result) {
      onBack();
      setFormData({ evaluatorEmail: "", evaluatorName: "", message: "" });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Send Evaluation Invitation
          </h2>
          <p className="text-gray-400 mt-1">
            Invite external evaluator for{" "}
            {assessment.developerName || "developer"}
          </p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Assessment Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Developer:</span>
                <span className="ml-2 text-white">
                  {assessment.developerName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-white capitalize">
                  {assessment.evaluationType.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="ml-2 text-white">
                  {assessment.developerEmail || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Expires:</span>
                <span className="ml-2 text-white">7 days</span>
              </div>
            </div>
          </div>

          {/* Evaluator Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Evaluator Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Evaluator Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={formData.evaluatorEmail}
                    onChange={(e) =>
                      handleInputChange("evaluatorEmail", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="evaluator@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Evaluator Name
                </label>
                <input
                  type="text"
                  value={formData.evaluatorName}
                  onChange={(e) =>
                    handleInputChange("evaluatorName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="John Smith"
                />
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Custom Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
              placeholder="Add any specific instructions or context for the evaluator..."
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">
              Email Preview
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>To:</strong>{" "}
                {formData.evaluatorEmail || "evaluator@company.com"}
              </p>
              <p>
                <strong>Subject:</strong> Developer Evaluation Request -{" "}
                {assessment.developerName || "Developer"}
              </p>
              <p>
                <strong>Template:</strong> Professional Andishi branded email
                with evaluation link
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.evaluatorEmail}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
