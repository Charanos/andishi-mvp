"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/app/components/ToastContainer";
import { ToastNotification } from "@/app/components/ToastNotification";
import {
  Code,
  Users,
  Briefcase,
  Star,
  Save,
  Send,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface DeveloperEvaluationFormProps {
  assessmentId?: string;
  developerId?: string;
  onComplete?: () => void;
}

export default function DeveloperEvaluationForm({
  assessmentId,
  developerId,
  onComplete,
}: DeveloperEvaluationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("technical");
  
  // Custom toast notifications state
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  
  const addNotification = (notification: Omit<ToastNotification, "id">) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Form state
  const [formData, setFormData] = useState({
    evaluationType: "initial" as "initial" | "periodic" | "project_based",
    technicalSkills: {
      specialty: "",
      primaryStack: [] as string[],
      skillRatings: [] as any[],
      overallTechnicalScore: 0,
    },
    professionalSkills: {
      communication: 0,
      teamwork: 0,
      problemSolving: 0,
      timeManagement: 0,
      clientInteraction: 0,
      overallProfessionalScore: 0,
    },
    experienceAssessment: {
      relevantExperience: false,
      projectComplexity: "junior" as "junior" | "mid" | "senior" | "lead",
      industryKnowledge: [] as string[],
      portfolioQuality: 0,
    },
    evaluation: {
      overallScore: 0,
      recommendation: "needs_review" as
        | "approved"
        | "rejected"
        | "needs_review"
        | "probation",
      techPoolEligible: false,
      suggestedRate: 0,
      suggestedProjects: [] as string[],
      strengths: [] as string[],
      improvements: [] as string[],
      evaluatorComments: "",
    },
  });

  // Technical skill categories
  const skillCategories = [
    { name: "Frontend Development", key: "frontend" },
    { name: "Backend Development", key: "backend" },
    { name: "Database Management", key: "database" },
    { name: "DevOps & Cloud", key: "devops" },
    { name: "Testing & QA", key: "testing" },
    { name: "System Design", key: "system_design" },
    { name: "Security", key: "security" },
    { name: "Mobile Development", key: "mobile" },
  ];

  const specialties = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Engineer",
    "Security Engineer",
    "QA Engineer",
  ];

  const techStacks = [
    "React",
    "Vue",
    "Angular",
    "Next.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
  ];

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    } else if (developerId && !currentAssessment) {
      initializeAssessment();
    }
  }, [assessmentId, developerId]);

  const loadAssessment = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${id}`);
      const data = await response.json();
      setCurrentAssessment(data.assessment);
      setFormData({
        evaluationType: data.assessment.evaluationType,
        technicalSkills: data.assessment.technicalSkills,
        professionalSkills: data.assessment.professionalSkills,
        experienceAssessment: data.assessment.experienceAssessment,
        evaluation: data.assessment.evaluation,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Failed to load assessment",
        message: "Could not load assessment data. Please try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeAssessment = async () => {
    if (!developerId) return;

    setLoading(true);
    try {
      const assessment = await fetch(`/api/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          developerId,
          evaluationType: formData.evaluationType,
        }),
      });
      const data = await assessment.json();
      if (data) {
        setCurrentAssessment(data);
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Failed to initialize assessment",
        message: "Could not create a new assessment. Please try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScores = () => {
    // Validate required data
    if (formData.technicalSkills.skillRatings.length === 0) {
      addNotification({
        type: "warning",
        title: "Missing Technical Skills",
        message: "Please add at least one technical skill rating before calculating scores.",
        duration: 5000
      });
      return;
    }

    // Calculate technical score
    const techRatings = formData.technicalSkills.skillRatings;
    const techAvg =
      techRatings.length > 0
        ? techRatings.reduce((sum, r) => sum + r.rating, 0) / techRatings.length
        : 0;
    const technicalScore = Math.round(techAvg * 10);

    // Calculate professional score
    const profSkills = formData.professionalSkills;
    const profSum =
      profSkills.communication +
      profSkills.teamwork +
      profSkills.problemSolving +
      profSkills.timeManagement +
      profSkills.clientInteraction;
    const professionalScore = Math.round((profSum / 5) * 10);

    // Calculate overall score
    const overallScore = Math.round((technicalScore + professionalScore) / 2);

    // Determine recommendation
    let recommendation: "approved" | "rejected" | "needs_review" | "probation";
    if (overallScore >= 75) recommendation = "approved";
    else if (overallScore >= 60) recommendation = "probation";
    else if (overallScore >= 40) recommendation = "needs_review";
    else recommendation = "rejected";

    setFormData((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        overallTechnicalScore: technicalScore,
      },
      professionalSkills: {
        ...prev.professionalSkills,
        overallProfessionalScore: professionalScore,
      },
      evaluation: {
        ...prev.evaluation,
        overallScore,
        recommendation,
        techPoolEligible: overallScore >= 75,
      },
    }));

    addNotification({
      type: "success",
      title: "Scores Calculated",
      message: `Overall score: ${overallScore}% (${recommendation.replace('_', ' ')})`,
      duration: 4000
    });
  };

  const handleSaveDraft = async () => {
    if (!currentAssessment) {
      addNotification({
        type: "error",
        title: "No Assessment Found",
        message: "Please initialize an assessment first.",
        duration: 5000
      });
      return;
    }

    setLoading(true);
    addNotification({
      type: "info",
      title: "Saving Draft",
      message: "Saving assessment draft...",
      duration: 2000
    });

    try {
      const response = await fetch(`/api/assessments/${currentAssessment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, status: "draft" }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      addNotification({
        type: "success",
        title: "Draft Saved",
        message: "Assessment draft saved successfully. You can continue editing later.",
        duration: 4000
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Failed to Save Draft",
        message: "Could not save assessment draft. Please check your connection and try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentAssessment) {
      addNotification({
        type: "error",
        title: "No Assessment Found",
        message: "Please initialize an assessment first.",
        duration: 5000
      });
      return;
    }

    // Validation checks
    if (!formData.technicalSkills.specialty) {
      addNotification({
        type: "warning",
        title: "Missing Specialty",
        message: "Please select a developer specialty before submitting.",
        duration: 5000
      });
      return;
    }

    if (formData.technicalSkills.skillRatings.length === 0) {
      addNotification({
        type: "warning",
        title: "Missing Technical Skills",
        message: "Please add at least one technical skill rating before submitting.",
        duration: 5000
      });
      return;
    }

    if (!formData.evaluation.evaluatorComments.trim()) {
      addNotification({
        type: "warning",
        title: "Missing Comments",
        message: "Please add evaluator comments before submitting.",
        duration: 5000
      });
      return;
    }

    setLoading(true);
    addNotification({
      type: "info",
      title: "Submitting Assessment",
      message: "Submitting assessment for review...",
      duration: 3000
    });

    try {
      const response = await fetch(`/api/assessments/${currentAssessment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, status: "submitted" }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      addNotification({
        type: "success",
        title: "Assessment Submitted",
        message: "Assessment successfully submitted for review. You will be notified of the outcome.",
        duration: 5000
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Failed to Submit",
        message: "Could not submit assessment. Please check your connection and try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!currentAssessment) {
      addNotification({
        type: "error",
        title: "No Assessment Found",
        message: "Please initialize an assessment first.",
        duration: 5000
      });
      return;
    }

    // Comprehensive validation
    const validationErrors = [];
    
    if (!formData.technicalSkills.specialty) {
      validationErrors.push("Developer specialty");
    }
    
    if (formData.technicalSkills.skillRatings.length === 0) {
      validationErrors.push("Technical skill ratings");
    }
    
    if (!formData.evaluation.evaluatorComments.trim()) {
      validationErrors.push("Evaluator comments");
    }
    
    if (formData.evaluation.suggestedRate <= 0) {
      validationErrors.push("Suggested hourly rate");
    }
    
    if (validationErrors.length > 0) {
      addNotification({
        type: "warning",
        title: "Incomplete Assessment",
        message: `Please complete: ${validationErrors.join(", ")} before finalizing.`,
        duration: 7000
      });
      return;
    }

    setLoading(true);
    addNotification({
      type: "info",
      title: "Finalizing Assessment",
      message: "Processing final assessment and updating developer status...",
      duration: 3000
    });

    try {
      const result = await fetch(
        `/api/assessments/${currentAssessment.id}/finalize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updateDeveloperStatus: true,
            addToTechPool: formData.evaluation.techPoolEligible,
            suggestedRate: formData.evaluation.suggestedRate,
            comments: formData.evaluation.evaluatorComments,
          }),
        }
      );
      
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }
      
      const data = await result.json();
      
      addNotification({
        type: "success",
        title: "Assessment Finalized",
        message: data.message || "Assessment finalized successfully. Developer status has been updated.",
        duration: 5000,
        action: {
          label: "View Assessments",
          onClick: () => {
            if (onComplete) onComplete();
            if (router) router.push("/admin-dashboard");
          }
        }
      });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        if (onComplete) onComplete();
        if (router) router.push("/admin-dashboard");
      }, 3000);
      
    } catch (error) {
      addNotification({
        type: "error",
        title: "Failed to Finalize",
        message: "Could not finalize assessment. Please check your connection and try again.",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkillRating = (category: string) => {
    const newRating = { category, rating: 5, notes: "" };
    setFormData((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        skillRatings: [...prev.technicalSkills.skillRatings, newRating],
      },
    }));
  };

  const updateSkillRating = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        skillRatings: prev.technicalSkills.skillRatings.map((r, i) =>
          i === index ? { ...r, [field]: value } : r
        ),
      },
    }));
  };

  const removeSkillRating = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: {
        ...prev.technicalSkills,
        skillRatings: prev.technicalSkills.skillRatings.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          Developer Evaluation Form
        </h1>
        <p className="text-blue-100">
          Complete the assessment to evaluate the developer's skills and
          eligibility for the tech talent pool
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["technical", "professional", "experience", "evaluation"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Form Content */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-lg p-6">
        {activeTab === "technical" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Skills Assessment
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Specialty
              </label>
              <select
                value={formData.technicalSkills.specialty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    technicalSkills: {
                      ...prev.technicalSkills,
                      specialty: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select specialty...</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Tech Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {techStacks.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => {
                      const stack = formData.technicalSkills.primaryStack;
                      if (stack.includes(tech)) {
                        setFormData((prev) => ({
                          ...prev,
                          technicalSkills: {
                            ...prev.technicalSkills,
                            primaryStack: stack.filter((t) => t !== tech),
                          },
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          technicalSkills: {
                            ...prev.technicalSkills,
                            primaryStack: [...stack, tech],
                          },
                        }));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.technicalSkills.primaryStack.includes(tech)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skill Ratings
              </label>
              <div className="space-y-3">
                {formData.technicalSkills.skillRatings.map((rating, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
                  >
                    <span className="flex-1">{rating.category}</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating.rating}
                      onChange={(e) =>
                        updateSkillRating(
                          index,
                          "rating",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-32"
                    />
                    <span className="w-8 text-center font-semibold">
                      {rating.rating}
                    </span>
                    <button
                      onClick={() => removeSkillRating(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSkillRating(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Add skill category...</option>
                  {skillCategories.map((cat) => (
                    <option key={cat.key} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "professional" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Professional Skills Assessment
            </h2>

            {Object.entries(formData.professionalSkills).map(([key, value]) => {
              if (key === "overallProfessionalScore") return null;
              return (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professionalSkills: {
                            ...prev.professionalSkills,
                            [key]: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-semibold text-lg">
                      {value}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience Assessment
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Relevant Experience
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      formData.experienceAssessment.relevantExperience === true
                    }
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        experienceAssessment: {
                          ...prev.experienceAssessment,
                          relevantExperience: true,
                        },
                      }))
                    }
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={
                      formData.experienceAssessment.relevantExperience === false
                    }
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        experienceAssessment: {
                          ...prev.experienceAssessment,
                          relevantExperience: false,
                        },
                      }))
                    }
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Complexity Level
              </label>
              <select
                value={formData.experienceAssessment.projectComplexity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experienceAssessment: {
                      ...prev.experienceAssessment,
                      projectComplexity: e.target.value as any,
                    },
                  }))
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Portfolio Quality
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.experienceAssessment.portfolioQuality}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceAssessment: {
                        ...prev.experienceAssessment,
                        portfolioQuality: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-lg">
                  {formData.experienceAssessment.portfolioQuality}/10
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-5 h-5" />
              Final Evaluation
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Suggested Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.evaluation.suggestedRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      evaluation: {
                        ...prev.evaluation,
                        suggestedRate: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tech Pool Eligible
                </label>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.evaluation.techPoolEligible}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          evaluation: {
                            ...prev.evaluation,
                            techPoolEligible: e.target.checked,
                          },
                        }))
                      }
                    />
                    Eligible for Tech Talent Pool
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Evaluator Comments
              </label>
              <textarea
                value={formData.evaluation.evaluatorComments}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    evaluation: {
                      ...prev.evaluation,
                      evaluatorComments: e.target.value,
                    },
                  }))
                }
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Add your evaluation comments..."
              />
            </div>

            {/* Score Summary */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Score Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Technical Score:</span>
                  <span className="font-semibold">
                    {formData.technicalSkills.overallTechnicalScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Score:</span>
                  <span className="font-semibold">
                    {formData.professionalSkills.overallProfessionalScore}%
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Overall Score:</span>
                  <span
                    className={
                      formData.evaluation.overallScore >= 75
                        ? "text-green-400"
                        : formData.evaluation.overallScore >= 60
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {formData.evaluation.overallScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendation:</span>
                  <span className="font-semibold capitalize">
                    {formData.evaluation.recommendation.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={calculateOverallScores}
          className="cursor-pointer px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Calculate Scores
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading || !currentAssessment}
            className="cursor-pointer px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !currentAssessment}
            className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>

          <button
            onClick={handleFinalize}
            disabled={loading || !currentAssessment}
            className="cursor-pointer px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Finalize Assessment
          </button>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
        position="top-right"
      />
    </div>
  );
}
