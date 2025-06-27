"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaFlag,
  FaTrash,
  FaCheck,
  FaArrowLeft,
  FaDollarSign,
  FaArrowRight,
  FaCalendarAlt,
  FaProjectDiagram,
} from "react-icons/fa";
import {
  authenticatedStartProjectFormSchema,
  startProjectFormSchema,
} from "@/lib/formSchema";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProjectDetails {
  title: string;
  description: string;
  category?: string;
  timeline?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  techStack?: string[];
  requirements?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
}

interface PricingOption {
  type: "fixed" | "milestone" | "hourly";
  currency: "USD" | "KES";
  fixedBudget?: string;
  milestones: Milestone[];
  hourlyRate?: string;
  estimatedHours?: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

interface FormData {
  userInfo: UserInfo;
  projectDetails: ProjectDetails;
  pricing: PricingOption;
}

export default function ClientDashboardStartProject({}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState<FormData>({
    userInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      role: "client",
    },
    projectDetails: {
      title: "",
      description: "",
      category: "",
      timeline: "",
      priority: "low",
      techStack: [],
      requirements: "",
    },
    pricing: {
      type: "fixed",
      currency: "USD",
      milestones: [],
      fixedBudget: "",
      hourlyRate: "",
      estimatedHours: "",
    },
  });

  const { user } = useAuth();

  // Auto-populate user info when user data is available
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || ["", ""];
      setFormData((prev) => ({
        ...prev,
        userInfo: {
          ...prev.userInfo,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          role: "client",
        },
      }));
    }
  }, [user]);

  // Expanded tech stacks with more comprehensive options
  const techStacks = [
    "Web Development",
    "Mobile Apps (iOS/Android)",
    "React/Next.js",
    "Vue.js/Nuxt.js",
    "Angular",
    "Node.js/Express",
    "Python/Django",
    "Laravel/PHP",
    "WordPress/CMS",
    "E-commerce (Shopify/WooCommerce)",
    "AI/Machine Learning",
    "Data Analytics",
    "Blockchain/Web3",
    "DevOps/Cloud Services",
    "API Development",
    "Database Design",
    "UI/UX Design",
    "Mobile App Development",
    "Cross-platform Development",
    "SaaS Solutions",
    "Third-party Integrations",
    "Payment Gateway Integration",
    "Social Media Integration",
    "SEO Optimization",
    "Performance Optimization",
    "Security Implementation",
    "Testing & QA",
    "Maintenance & Support",
  ];

  const categories = [
    "E-commerce Platform",
    "Business Management System",
    "Mobile Application",
    "AI/ML Solution",
    "Blockchain Application",
    "SaaS Platform",
    "Custom Web Application",
    "Portfolio/Landing Page",
    "Educational Platform",
    "Healthcare Solution",
    "Financial Technology",
    "Real Estate Platform",
    "Social Media Platform",
    "Content Management System",
    "Other",
  ];

  const timelines = [
    "1-2 weeks",
    "3-4 weeks",
    "1-2 months",
    "3-6 months",
    "6+ months",
  ];

  const priorityLevels = [
    { value: "low", label: "Low - No rush" },
    { value: "medium", label: "Medium - Standard timeline" },
    { value: "high", label: "High - ASAP" },
    { value: "urgent", label: "Urgent - Emergency" },
  ];

  const steps = [
    { number: 1, title: "Project Details", icon: FaProjectDiagram },
    { number: 2, title: "Pricing Structure", icon: FaDollarSign },
    { number: 3, title: "Final Review", icon: FaCheck },
  ];

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 10,
      behavior: "smooth",
    });
  };

  const updateProjectDetails = (
    field: keyof ProjectDetails,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      projectDetails: { ...prev.projectDetails, [field]: value },
    }));
  };

  const updatePricing = (field: keyof PricingOption, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  const toggleTechStack = (tech: string) => {
    const currentTechStack = formData.projectDetails.techStack || [];
    if (currentTechStack.includes(tech)) {
      updateProjectDetails(
        "techStack",
        currentTechStack.filter((t) => t !== tech)
      );
    } else {
      updateProjectDetails("techStack", [...currentTechStack, tech]);
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "",
      description: "",
      budget: "",
      timeline: "",
    };
    const currentMilestones = formData.pricing.milestones || [];
    updatePricing("milestones", [...currentMilestones, newMilestone]);
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string
  ) => {
    const currentMilestones = formData.pricing.milestones || [];
    const updatedMilestones = currentMilestones.map((milestone) =>
      milestone.id === id ? { ...milestone, [field]: value } : milestone
    );
    updatePricing("milestones", updatedMilestones);
  };

  const removeMilestone = (id: string) => {
    const currentMilestones = formData.pricing.milestones || [];
    updatePricing(
      "milestones",
      currentMilestones.filter((m) => m.id !== id)
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.projectDetails.title.trim() !== "" &&
          formData.projectDetails.description.trim() !== "" &&
          (formData.projectDetails.techStack?.length || 0) > 0
        );
      case 2:
        if (formData.pricing.type === "fixed") {
          return formData.pricing.fixedBudget?.trim() !== "";
        } else if (formData.pricing.type === "hourly") {
          return (
            formData.pricing.hourlyRate?.trim() !== "" &&
            formData.pricing.estimatedHours?.trim() !== ""
          );
        } else {
          // For milestone type
          return (
            formData.pricing.milestones.length > 0 &&
            formData.pricing.milestones.every(
              (m) =>
                m.title.trim() !== "" &&
                m.description.trim() !== "" &&
                m.budget.trim() !== "" &&
                m.timeline.trim() !== ""
            )
          );
        }
      case 3:
        return termsAccepted;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => prev + 1);
      scrollToTop();
    } else {
      toast.error("Please fill in all required fields before proceeding.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    scrollToTop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    try {
      const token = localStorage.getItem("auth_token");
      const userEmail = localStorage.getItem("user_email");
      const firstName = localStorage.getItem("user_firstName");
      const lastName = localStorage.getItem("user_lastName");
      const company = localStorage.getItem("user_company");

      const projectData = {
        title: formData.projectDetails.title,
        description: formData.projectDetails.description,
        category: formData.projectDetails.category,
        timeline: formData.projectDetails.timeline,
        priority: formData.projectDetails.priority,
        techStack:
          formData.projectDetails.techStack?.map((tech) => tech.trim()) || [],
        requirements: formData.projectDetails.requirements,
        pricing: {
          type: formData.pricing.type,
          currency: formData.pricing.currency,
          fixedBudget: formData.pricing.fixedBudget,
          hourlyRate: formData.pricing.hourlyRate,
          estimatedHours: formData.pricing.estimatedHours,
        },
        userInfo: {
          email: userEmail,
          firstName,
          lastName,
          company,
        },
      };

      const response = await fetch("/api/client-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "user-email": userEmail || "",
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!data.success) {
        setSubmitStatus("error");
        console.error("Server validation errors:", data.errors);

        // If we have structured validation errors, show them
        if (data.errors) {
          Object.entries(data.errors).forEach(
            ([path, error]: [string, any]) => {
              if (error?._errors) {
                error._errors.forEach((err: string) => {
                  toast.error(`${path}: ${err}`, {
                    position: "top-center",
                    autoClose: 5000,
                  });
                });
              }
            }
          );
        } else {
          // Otherwise show the general error message
          toast.error(data.message || "Failed to submit project");
        }
        return;
      }

      setSubmitStatus("success");
      toast.success("Project submitted successfully!");

      // Redirect to thank you page or dashboard
      router.push("/client-dashboard");
    } catch (error) {
      setSubmitStatus("error");
      toast.error("An error occurred while submitting your project");
      console.error("Submit error:", error);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Modal Overlay */}
      <div className="space-y-6">
        {/* Header */}
        <div className="">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Create New <span className="text-purple-400">Project</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Define your project requirements and get started
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-6 py-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            ></div>

            {steps.map((step) => (
              <div key={step.number} className="relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  <step.icon className="text-sm" />
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap monty uppercase">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 bg-gray-400/5 my-16 rounded-2xl backdrop-blur-sm">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <FaProjectDiagram className="mr-3 text-blue-400" />
                Project Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.projectDetails.title}
                    onChange={(e) =>
                      updateProjectDetails("title", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="What's your project called?"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Category
                  </label>
                  <select
                    value={formData.projectDetails.category}
                    onChange={(e) =>
                      updateProjectDetails("category", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-gray-800">
                      Select project category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-gray-800"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium my-6">
                    Tech Stack/Services Needed
                  </label>
                  <p className="text-sm text-gray-400 mb-3">
                    Select all technologies and services you need for your
                    project
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 space-y-4 lg:grid-cols-4 gap-3 max-h-auto ">
                    {techStacks.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTechStack(tech)}
                        className={`px-3 hover:bg-purple-700 cursor-pointer py-2 rounded-lg border transition-all duration-300 text-sm ${
                          formData.projectDetails.techStack?.includes(tech)
                            ? "bg-blue-500/20 border-blue-400 text-blue-300"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  {/* Tech Stack Selection */}
                  <div className="mt-3 text-sm text-blue-300">
                    Selected: {formData.projectDetails.techStack?.length || 0}{" "}
                    technologies
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.projectDetails.techStack?.map((tech) => (
                      <span
                        key={tech}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.projectDetails.description}
                    onChange={(e) =>
                      updateProjectDetails("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    placeholder="Describe your project in detail. What problem does it solve? What features do you need?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-400" />
                      Timeline
                    </label>
                    <select
                      value={formData.projectDetails.timeline}
                      onChange={(e) =>
                        updateProjectDetails("timeline", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="" className="bg-gray-800">
                        Select timeline
                      </option>
                      {timelines.map((timeline) => (
                        <option
                          key={timeline}
                          value={timeline}
                          className="bg-gray-800"
                        >
                          {timeline}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className=" text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaFlag className="mr-2 text-blue-400" />
                      Priority Level
                    </label>
                    <select
                      value={formData.projectDetails.priority}
                      onChange={(e) =>
                        updateProjectDetails(
                          "priority",
                          e.target.value as "low" | "medium" | "high" | "urgent"
                        )
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="" className="bg-gray-800">
                        Select priority
                      </option>
                      {priorityLevels.map((level) => (
                        <option
                          key={level.value}
                          value={level.value}
                          className="bg-gray-800"
                        >
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    value={formData.projectDetails.requirements}
                    onChange={(e) =>
                      updateProjectDetails("requirements", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    placeholder="Any specific technologies, integrations, or requirements we should know about?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing Structure */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <FaDollarSign className="mr-3 text-blue-400" />
                Pricing Structure
              </h2>

              <div className="space-y-6">
                {/* Currency Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Preferred Currency
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => updatePricing("currency", "USD")}
                      className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                        formData.pricing.currency === "USD"
                          ? "bg-blue-500/20 border-blue-400 text-blue-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 monty uppercase"
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePricing("currency", "KES")}
                      className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                        formData.pricing.currency === "KES"
                          ? "bg-blue-500/20 border-blue-400 text-blue-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 monty uppercase"
                      }`}
                    >
                      KES (KSh)
                    </button>
                  </div>
                </div>

                {/* Pricing Options */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-4">
                    Choose Your Preferred Pricing Model
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => updatePricing("type", "fixed")}
                      className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                        formData.pricing.type === "fixed"
                          ? "bg-blue-500/20 border-blue-400"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg font-semibold text-white mb-2 monty uppercase">
                        Fixed Price
                      </div>
                      <div className="text-sm text-gray-400">
                        One total price for the entire project
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updatePricing("type", "milestone")}
                      className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                        formData.pricing.type === "milestone"
                          ? "bg-blue-500/20 border-blue-400"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg font-semibold text-white mb-2 monty uppercase">
                        Milestone Based
                      </div>
                      <div className="text-sm text-gray-400">
                        Pay as we complete project milestones
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updatePricing("type", "hourly")}
                      className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                        formData.pricing.type === "hourly"
                          ? "bg-blue-500/20 border-blue-400"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-lg font-semibold monty uppercase text-white mb-2">
                        Hourly Rate
                      </div>
                      <div className="text-sm text-gray-400">
                        Hire a dedicated developer by the hour
                      </div>
                    </button>
                  </div>
                </div>

                {/* Fixed Price Details */}
                {formData.pricing.type === "fixed" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Estimated Project Budget ({formData.pricing.currency})
                      </label>
                      <input
                        type="text"
                        value={formData.pricing.fixedBudget || ""}
                        onChange={(e) =>
                          updatePricing("fixedBudget", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder={`Enter your budget in ${formData.pricing.currency}`}
                      />
                    </div>
                  </div>
                )}

                {/* Milestone Details */}
                {formData.pricing.type === "milestone" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">
                        Project Milestones
                      </h3>
                      <button
                        type="button"
                        onClick={addMilestone}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-400 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <FaPlus className="text-sm" />
                        <span>Add Milestone</span>
                      </button>
                    </div>

                    {(formData.pricing.milestones || []).map(
                      (milestone, index) => (
                        <div
                          key={milestone.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-white font-medium">
                              Milestone {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeMilestone(milestone.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm font-medium mb-1">
                                Milestone Title
                              </label>
                              <input
                                type="text"
                                value={milestone.title}
                                onChange={(e) =>
                                  updateMilestone(
                                    milestone.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors text-[15.5px"
                                placeholder="e.g., Design & Wireframes"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-300 text-sm font-medium mb-1">
                                Budget ({formData.pricing.currency})
                              </label>
                              <input
                                type="text"
                                value={milestone.budget}
                                onChange={(e) =>
                                  updateMilestone(
                                    milestone.id,
                                    "budget",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors text-[15.5px"
                                placeholder="Amount"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">
                              Description
                            </label>
                            <textarea
                              value={milestone.description}
                              onChange={(e) =>
                                updateMilestone(
                                  milestone.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors text-[15.5px resize-none"
                              placeholder="What will be delivered in this milestone?"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">
                              Timeline
                            </label>
                            <input
                              type="text"
                              value={milestone.timeline}
                              onChange={(e) =>
                                updateMilestone(
                                  milestone.id,
                                  "timeline",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors text-[15.5px"
                              placeholder="e.g., 2 weeks"
                            />
                          </div>
                        </div>
                      )
                    )}

                    {(formData.pricing.milestones || []).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <FaProjectDiagram className="mx-auto text-3xl mb-4 opacity-50" />
                        <p>
                          No milestones added yet. Click "Add Milestone" to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hourly Rate Details */}
                {formData.pricing.type === "hourly" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-[15.5px font-medium mb-2">
                          Preferred Hourly Rate ({formData.pricing.currency})
                        </label>
                        <input
                          type="text"
                          value={formData.pricing.hourlyRate || ""}
                          onChange={(e) =>
                            updatePricing("hourlyRate", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder={`Rate per hour in ${formData.pricing.currency}`}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-[15.5px font-medium mb-2">
                          Estimated Hours per Week
                        </label>
                        <input
                          type="text"
                          value={formData.pricing.estimatedHours || ""}
                          onChange={(e) =>
                            updatePricing("estimatedHours", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                          placeholder="Hours per week"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <FaCheck className="mr-3 text-green-400" />
                Review Your Project
              </h2>

              <div className="space-y-6">
                {/* Project Details Summary */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FaProjectDiagram className="mr-2 text-blue-400" />
                    Project Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Project Title:</span>
                        <p className="text-white font-medium">
                          {formData.projectDetails.title}
                        </p>
                      </div>
                      {formData.projectDetails.category && (
                        <div>
                          <span className="text-gray-400">Category:</span>
                          <p className="text-white font-medium">
                            {formData.projectDetails.category}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-gray-400">Description:</span>
                      <p className="text-white mt-1">
                        {formData.projectDetails.description}
                      </p>
                    </div>

                    {formData.projectDetails.requirements && (
                      <div>
                        <span className="text-gray-400">
                          Special Requirements:
                        </span>
                        <p className="text-white mt-1">
                          {formData.projectDetails.requirements}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-400">Tech Stack:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.projectDetails.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.projectDetails.timeline && (
                        <div>
                          <span className="text-gray-400">Timeline:</span>
                          <p className="text-white font-medium">
                            {formData.projectDetails.timeline}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Priority:</span>
                        <p className="text-white font-medium">
                          {priorityLevels.find(
                            (level) =>
                              level.value === formData.projectDetails.priority
                          )?.label || formData.projectDetails.priority}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FaDollarSign className="mr-2 text-green-400" />
                    Pricing Structure
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400">Pricing Model:</span>
                      <p className="text-white font-medium capitalize">
                        {formData.pricing.type} Price
                      </p>
                    </div>

                    {formData.pricing.type === "fixed" &&
                      formData.pricing.fixedBudget && (
                        <div>
                          <span className="text-gray-400">Budget:</span>
                          <p className="text-white font-medium">
                            {formData.pricing.currency}{" "}
                            {formData.pricing.fixedBudget}
                          </p>
                        </div>
                      )}

                    {formData.pricing.type === "hourly" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400">Hourly Rate:</span>
                          <p className="text-white font-medium">
                            {formData.pricing.currency}{" "}
                            {formData.pricing.hourlyRate}/hr
                          </p>
                        </div>
                        {formData.pricing.estimatedHours && (
                          <div>
                            <span className="text-gray-400">
                              Estimated Hours:
                            </span>
                            <p className="text-white font-medium">
                              {formData.pricing.estimatedHours} hours
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.pricing.type === "milestone" &&
                      formData.pricing.milestones && (
                        <div className="space-y-4">
                          <span className="text-gray-400">Milestones:</span>
                          {formData.pricing.milestones.map(
                            (milestone, index) => (
                              <div
                                key={milestone.id}
                                className="p-4 bg-white/5 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-medium">
                                    {milestone.title}
                                  </h4>
                                  <span className="text-blue-300">
                                    {formData.pricing.currency}{" "}
                                    {milestone.budget}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  {milestone.description}
                                </p>
                                <div className="text-sm text-gray-500 mt-2">
                                  Timeline: {milestone.timeline}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-400 bg-transparent border-2 border-blue-400 rounded focus:ring-blue-400 focus:ring-2"
                    />
                    <label
                      htmlFor="terms"
                      className="text-gray-300 leading-relaxed"
                    >
                      I agree to Andishi's terms of service and privacy policy.
                      I understand that this is a project inquiry and final
                      pricing will be confirmed after initial consultation.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                currentStep === 1
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
              }`}
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous</span>
            </button>

            <div className="text-center text-sm text-gray-400">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  isStepValid()
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>Next</span>
                <FaArrowRight className="text-sm" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!termsAccepted}
                className={`monty uppercase flex items-center space-x-2 px-8 py-3 rounded-lg transition-all duration-300 ${
                  termsAccepted
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer"
                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaCheck className="text-sm" />
                <span>Submit Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background effects */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </>
  );
}
