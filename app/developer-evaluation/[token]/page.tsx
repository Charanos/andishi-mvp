"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Code,
  Star,
  MessageSquare,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface EvaluationData {
  // Developer Info
  developerName: string;
  developerEmail: string;
  developerPhone?: string;

  // Technical Skills
  technicalExpertise: number;
  codeQuality: number;
  problemSolving: number;
  systemDesign: number;
  debugging: number;

  // Professional Skills
  communication: number;
  teamwork: number;
  timeManagement: number;
  clientInteraction: number;
  leadership: number;

  // Project Experience
  projectComplexity: "junior" | "mid" | "senior" | "lead";
  deliverySuccess: number;
  technicalChallenges: string;

  // Overall Assessment
  overallRating: number;
  recommendation:
    | "highly_recommend"
    | "recommend"
    | "neutral"
    | "not_recommend";
  strengths: string;
  improvements: string;
  additionalComments: string;

  // Evaluator Info
  evaluatorName: string;
  evaluatorEmail: string;
  evaluatorRole: string;
  evaluatorCompany: string;
  relationshipDuration: string;
}

export default function DeveloperEvaluationForm() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [assessmentInfo, setAssessmentInfo] = useState<any>(null);

  const [formData, setFormData] = useState<EvaluationData>({
    developerName: "",
    developerEmail: "",
    developerPhone: "",
    technicalExpertise: 0,
    codeQuality: 0,
    problemSolving: 0,
    systemDesign: 0,
    debugging: 0,
    communication: 0,
    teamwork: 0,
    timeManagement: 0,
    clientInteraction: 0,
    leadership: 0,
    projectComplexity: "mid",
    deliverySuccess: 0,
    technicalChallenges: "",
    overallRating: 0,
    recommendation: "neutral",
    strengths: "",
    improvements: "",
    additionalComments: "",
    evaluatorName: "",
    evaluatorEmail: "",
    evaluatorRole: "",
    evaluatorCompany: "",
    relationshipDuration: "",
  });

  // Validate token and fetch assessment info
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/evaluations/validate/${token}`);
        if (!response.ok) {
          throw new Error("Invalid or expired evaluation link");
        }
        const data = await response.json();
        setAssessmentInfo(data.assessment);

        // Pre-fill developer info if available
        if (data.assessment) {
          setFormData((prev) => ({
            ...prev,
            developerName: data.assessment.developerName || "",
            developerEmail: data.assessment.developerEmail || "",
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to validate evaluation link"
        );
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (field: keyof EvaluationData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/submit/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit evaluation");
      }

      setSuccess(true);
      // Redirect to thank you page after a short delay
      setTimeout(() => {
        router.push("/thank-you-evaluation");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit evaluation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
        {description && (
          <span className="block text-xs text-gray-400 mt-1">
            {description}
          </span>
        )}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`p-2 rounded-lg transition-all ${
              value >= rating
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            <Star
              className={`w-5 h-5 ${value >= rating ? "fill-current" : ""}`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-300 self-center">
          {value > 0 ? `${value}/5` : "Not rated"}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-purple-400/20 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Validating Evaluation Link</h2>
          <p className="text-gray-300">Please wait while we verify your access...</p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !assessmentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-2">
            Invalid Evaluation Link
          </h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-semibold text-white mb-4">Evaluation Submitted!</h1>
          <p className="text-gray-300 mb-4">
            Thank you for your valuable feedback. Your evaluation has been recorded successfully.
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
            <p className="text-green-200 text-sm">
              The development team will review your feedback to improve their skills and performance.
            </p>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Redirecting to confirmation page...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">
              Developer Evaluation Form
            </h1>
            <p className="text-gray-300">
              Please provide your honest feedback about the developer's
              performance
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Developer Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Developer Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Developer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.developerName}
                    onChange={(e) =>
                      handleInputChange("developerName", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Developer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.developerEmail}
                    onChange={(e) =>
                      handleInputChange("developerEmail", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </section>

            {/* Technical Skills */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Technical Skills Assessment
              </h2>
              <div className="space-y-4">
                <RatingInput
                  label="Technical Expertise"
                  description="Knowledge of programming languages, frameworks, and tools"
                  value={formData.technicalExpertise}
                  onChange={(val) =>
                    handleInputChange("technicalExpertise", val)
                  }
                />
                <RatingInput
                  label="Code Quality"
                  description="Clean, maintainable, and well-documented code"
                  value={formData.codeQuality}
                  onChange={(val) => handleInputChange("codeQuality", val)}
                />
                <RatingInput
                  label="Problem Solving"
                  description="Ability to analyze and solve complex technical problems"
                  value={formData.problemSolving}
                  onChange={(val) => handleInputChange("problemSolving", val)}
                />
                <RatingInput
                  label="System Design"
                  description="Architecture and design patterns knowledge"
                  value={formData.systemDesign}
                  onChange={(val) => handleInputChange("systemDesign", val)}
                />
                <RatingInput
                  label="Debugging Skills"
                  description="Ability to identify and fix issues efficiently"
                  value={formData.debugging}
                  onChange={(val) => handleInputChange("debugging", val)}
                />
              </div>
            </section>

            {/* Professional Skills */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Skills Assessment
              </h2>
              <div className="space-y-4">
                <RatingInput
                  label="Communication"
                  description="Clear and effective communication"
                  value={formData.communication}
                  onChange={(val) => handleInputChange("communication", val)}
                />
                <RatingInput
                  label="Teamwork"
                  description="Collaboration and team contribution"
                  value={formData.teamwork}
                  onChange={(val) => handleInputChange("teamwork", val)}
                />
                <RatingInput
                  label="Time Management"
                  description="Meeting deadlines and managing priorities"
                  value={formData.timeManagement}
                  onChange={(val) => handleInputChange("timeManagement", val)}
                />
                <RatingInput
                  label="Client Interaction"
                  description="Professional client communication and management"
                  value={formData.clientInteraction}
                  onChange={(val) =>
                    handleInputChange("clientInteraction", val)
                  }
                />
                <RatingInput
                  label="Leadership"
                  description="Initiative and team leadership abilities"
                  value={formData.leadership}
                  onChange={(val) => handleInputChange("leadership", val)}
                />
              </div>
            </section>

            {/* Project Experience */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Project Experience
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Project Complexity Level *
                  </label>
                  <select
                    required
                    value={formData.projectComplexity}
                    onChange={(e) =>
                      handleInputChange("projectComplexity", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="junior">Junior Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Architect Level</option>
                  </select>
                </div>
                <RatingInput
                  label="Delivery Success"
                  description="Successful project completion and delivery"
                  value={formData.deliverySuccess}
                  onChange={(val) => handleInputChange("deliverySuccess", val)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Technical Challenges Handled
                  </label>
                  <textarea
                    value={formData.technicalChallenges}
                    onChange={(e) =>
                      handleInputChange("technicalChallenges", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Describe any significant technical challenges the developer handled..."
                  />
                </div>
              </div>
            </section>

            {/* Overall Assessment */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5" />
                Overall Assessment
              </h2>
              <div className="space-y-4">
                <RatingInput
                  label="Overall Rating *"
                  description="Your overall rating of the developer"
                  value={formData.overallRating}
                  onChange={(val) => handleInputChange("overallRating", val)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Recommendation *
                  </label>
                  <select
                    required
                    value={formData.recommendation}
                    onChange={(e) =>
                      handleInputChange("recommendation", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="highly_recommend">Highly Recommend</option>
                    <option value="recommend">Recommend</option>
                    <option value="neutral">Neutral</option>
                    <option value="not_recommend">Do Not Recommend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Key Strengths *
                  </label>
                  <textarea
                    required
                    value={formData.strengths}
                    onChange={(e) =>
                      handleInputChange("strengths", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="What are the developer's main strengths?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Areas for Improvement
                  </label>
                  <textarea
                    value={formData.improvements}
                    onChange={(e) =>
                      handleInputChange("improvements", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="What areas could the developer improve?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={formData.additionalComments}
                    onChange={(e) =>
                      handleInputChange("additionalComments", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Any additional feedback or comments..."
                  />
                </div>
              </div>
            </section>

            {/* Evaluator Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.evaluatorName}
                    onChange={(e) =>
                      handleInputChange("evaluatorName", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.evaluatorEmail}
                    onChange={(e) =>
                      handleInputChange("evaluatorEmail", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Your Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.evaluatorRole}
                    onChange={(e) =>
                      handleInputChange("evaluatorRole", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="e.g., Project Manager, Tech Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.evaluatorCompany}
                    onChange={(e) =>
                      handleInputChange("evaluatorCompany", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Your company name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    How long have you worked with this developer? *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.relationshipDuration}
                    onChange={(e) =>
                      handleInputChange("relationshipDuration", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="e.g., 6 months, 2 years"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Evaluation
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
