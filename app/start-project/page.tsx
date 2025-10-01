"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPlus,
  FaFlag,
  FaTrash,
  FaPhone,
  FaCheck,
  FaEnvelope,
  FaBuilding,
  FaArrowLeft,
  FaDollarSign,
  FaArrowRight,
  FaCalendarAlt,
  FaProjectDiagram,
  FaTimes,
  FaFileContract,
  FaChevronDown,
  FaChevronUp,
  FaCode,
} from "react-icons/fa";
import { startProjectFormSchema } from "@/lib/formSchema";
import Link from "next/link";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import RichContentEditor from "../components/RichContentEditor";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  timeline: string;
  priority: "low" | "medium" | "high" | "urgent";
  techStack: string[];
  requirements: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
}

interface ContractDetails {
  engagementType: "fixed-term" | "retainer" | "ongoing";
  duration: string;
  durationUnit: "months" | "years";
  workingHoursPerWeek: string;
  monthlyRate: string;
  jobDescription: string;
  startDate?: string;
  endDate?: string;
}

interface PricingOption {
  type: "fixed" | "milestone" | "contract";
  currency: "USD" | "KES";
  fixedBudget?: string;
  milestones?: Milestone[];
  contractDetails?: ContractDetails;
}

interface FormData {
  userInfo: UserInfo;
  projectDetails: ProjectDetails;
  pricing: PricingOption;
}

export default function StartProjectForm() {
  const router = useRouter();
  const { toast, notifications, removeNotification } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientTermsAccepted, setClientTermsAccepted] = useState(false);
  const [clientPrivacyAccepted, setClientPrivacyAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    techStack: true,
    additionalDetails: false,
  });
  const [formData, setFormData] = useState<FormData>({
    userInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      role: "",
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
      contractDetails: {
        engagementType: "fixed-term",
        duration: "",
        durationUnit: "months",
        workingHoursPerWeek: "",
        monthlyRate: "",
        jobDescription: "",
        startDate: "",
        endDate: "",
      },
    },
  });

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
    "low - No rush",
    "medium - Standard timeline",
    "high - ASAP",
    "urgent - Emergency",
  ];

  const steps = [
    { number: 1, title: "User Info", icon: FaUser },
    { number: 2, title: "Project Details", icon: FaProjectDiagram },
    { number: 3, title: "Pricing & Contract", icon: FaDollarSign },
    { number: 4, title: "Final Review", icon: FaCheck },
  ];

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 10,
      behavior: "smooth",
    });
  };

  const updateUserInfo = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      userInfo: { ...prev.userInfo, [field]: value },
    }));
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

  const updateContractDetails = (field: keyof ContractDetails, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        contractDetails: {
          ...prev.pricing.contractDetails!,
          [field]: value,
        },
      },
    }));
  };

  const toggleTechStack = (tech: string) => {
    const currentTechStack = formData.projectDetails.techStack;
    if (currentTechStack.includes(tech)) {
      updateProjectDetails(
        "techStack",
        currentTechStack.filter((t) => t !== tech)
      );
    } else {
      updateProjectDetails("techStack", [...currentTechStack, tech]);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
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

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async () => {
    // Check if terms are accepted
    if (!clientPrivacyAccepted) {
      toast.error(
        "Please accept the Terms of Service and Privacy Policy before submitting."
      );
      return;
    }

    try {
      const result = await startProjectFormSchema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          toast.error(issue.message);
        });
        return;
      }

      setSubmitStatus("loading");
      toast.info("Submitting your project...");

      try {
        const res = await fetch("/api/start-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (result.success) {
          setSubmitStatus("success");
          toast.success(
            "Your project has been submitted successfully! Redirecting..."
          );

          // Redirect to thank you page after a short delay
          setTimeout(() => {
            router.push("/thank-you-start-project");
          }, 2000);
        } else {
          setSubmitStatus("error");
          toast.error(result.message || "Submission failed. Please try again.");
        }
      } catch (error) {
        setSubmitStatus("error");
        toast.error("An error occurred while submitting. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.userInfo.firstName &&
          formData.userInfo.lastName &&
          formData.userInfo.email
        );
      case 2:
        return (
          formData.projectDetails.title && formData.projectDetails.description
        );
      case 3:
        if (formData.pricing.type === "milestone") {
          return (formData.pricing.milestones?.length || 0) > 0;
        }
        if (formData.pricing.type === "contract") {
          return (
            formData.pricing.contractDetails?.duration &&
            formData.pricing.contractDetails?.workingHoursPerWeek &&
            formData.pricing.contractDetails?.monthlyRate &&
            formData.pricing.contractDetails?.jobDescription
          );
        }
        return true;
      case 4:
        return clientPrivacyAccepted;
      default:
        return true;
    }
  };

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
        position="top-right"
      />
      <section className="min-h-screen py-16 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gray-50 dark:bg-transparent"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 my-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white mb-4">
              Start Your{" "}
              <span className="text-purple-600 dark:text-purple-400">
                Project
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Share your project details, and we'll connect you with the ideal
              development team tailored to your needs.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="justify-between items-center mb-20 relative hidden md:flex">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            ></div>

            {steps.map((step) => (
              <div key={step.number} className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <step.icon className="text-lg" />
                </div>
                <div className="absolute top-14 left-1/2 -translate-x-1/2 text-sm text-gray-700 dark:text-gray-400 whitespace-nowrap monty uppercase">
                  {step.title}
                </div>
              </div>
            ))}
          </div>

          {/* Form Container */}
          <div className="backdrop-blur-md bg-white/90 dark:bg-black/10 border border-gray-200 dark:border-white/10 rounded-2xl px-8 py-10 shadow-xl">
            {/* Step 1: User Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center ">
                  <FaUser className="mr-3 text-blue-600 dark:text-blue-400" />
                  Tell us about yourself
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userInfo.firstName}
                      onChange={(e) =>
                        updateUserInfo("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userInfo.lastName}
                      onChange={(e) =>
                        updateUserInfo("lastName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-600 dark:text-blue-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.userInfo.email}
                      onChange={(e) => updateUserInfo("email", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaPhone className="mr-2 text-blue-600 dark:text-blue-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.userInfo.phone}
                      onChange={(e) => updateUserInfo("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                      <FaBuilding className="mr-2 text-blue-600 dark:text-blue-400" />
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      value={formData.userInfo.company}
                      onChange={(e) =>
                        updateUserInfo("company", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Your Role
                    </label>
                    <select
                      value={formData.userInfo.role}
                      onChange={(e) => updateUserInfo("role", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="" className="bg-white dark:bg-gray-800">
                        Select your role
                      </option>
                      <option
                        value="CEO/Founder"
                        className="bg-white dark:bg-gray-800"
                      >
                        CEO/Founder
                      </option>
                      <option value="CTO" className="bg-white dark:bg-gray-800">
                        CTO
                      </option>
                      <option
                        value="Project Manager"
                        className="bg-white dark:bg-gray-800"
                      >
                        Project Manager
                      </option>
                      <option
                        value="Product Manager"
                        className="bg-white dark:bg-gray-800"
                      >
                        Product Manager
                      </option>
                      <option
                        value="Business Owner"
                        className="bg-white dark:bg-gray-800"
                      >
                        Business Owner
                      </option>
                      <option
                        value="Other"
                        className="bg-white dark:bg-gray-800"
                      >
                        Other
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center">
                  <FaProjectDiagram className="mr-3 text-blue-600 dark:text-blue-400" />
                  Project Details
                </h2>

                <div className="space-y-8">
                  {/* Basic Information - Always Visible */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.projectDetails.title}
                        onChange={(e) =>
                          updateProjectDetails("title", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        placeholder="What's your project called?"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                          Project Category
                        </label>
                        <select
                          value={formData.projectDetails.category}
                          onChange={(e) =>
                            updateProjectDetails("category", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors cursor-pointer"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-gray-800"
                          >
                            Select category
                          </option>
                          {categories.map((category) => (
                            <option
                              key={category}
                              value={category}
                              className="bg-white dark:bg-gray-800"
                            >
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className=" text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                          Timeline
                        </label>
                        <select
                          value={formData.projectDetails.timeline}
                          onChange={(e) =>
                            updateProjectDetails("timeline", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors cursor-pointer"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-gray-800"
                          >
                            Select timeline
                          </option>
                          {timelines.map((timeline) => (
                            <option
                              key={timeline}
                              value={timeline}
                              className="bg-white dark:bg-gray-800"
                            >
                              {timeline}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Project Summary *
                      </label>
                      <textarea
                        value={formData.projectDetails.description}
                        onChange={(e) =>
                          updateProjectDetails("description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
                        placeholder="Brief overview of your project (2-3 sentences)"
                      />
                    </div>
                  </div>

                  {/* Tech Stack - Collapsible */}
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleSection("techStack")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          Tech Stack / Services Needed *
                        </span>
                        {formData.projectDetails.techStack.length > 0 && (
                          <span className="ml-2 text-sm text-blue-600 dark:text-blue-300">
                            ({formData.projectDetails.techStack.length}{" "}
                            selected)
                          </span>
                        )}
                      </div>
                      {expandedSections.techStack ? (
                        <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {expandedSections.techStack && (
                      <div className="p-4 border-t border-gray-200 dark:border-white/10">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Select all technologies and services you need for your
                          project
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {techStacks.map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => toggleTechStack(tech)}
                              className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                                formData.projectDetails.techStack.includes(tech)
                                  ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                                  : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500"
                              }`}
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Details - Collapsible */}
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleSection("additionalDetails")}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-gray-900 dark:text-white font-medium">
                        Additional Details (Optional)
                      </span>
                      {expandedSections.additionalDetails ? (
                        <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    {expandedSections.additionalDetails && (
                      <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Priority Level
                          </label>
                          <select
                            value={formData.projectDetails.priority}
                            onChange={(e) =>
                              updateProjectDetails("priority", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors cursor-pointer"
                          >
                            {priorityLevels.map((level) => (
                              <option
                                key={level}
                                value={level.split(" - ")[0]}
                                className="bg-white dark:bg-gray-800"
                              >
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Additional Requirements
                          </label>
                          <textarea
                            value={formData.projectDetails.requirements}
                            onChange={(e) =>
                              updateProjectDetails(
                                "requirements",
                                e.target.value
                              )
                            }
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
                            placeholder="Any specific requirements, constraints, or preferences..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing Structure */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FaDollarSign className="mr-3 text-blue-600 dark:text-blue-400" />
                  Pricing Structure
                </h2>

                <div className="space-y-8">
                  {/* Currency Selection */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Preferred Currency
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => updatePricing("currency", "USD")}
                        className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                          formData.pricing.currency === "USD"
                            ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 monty uppercase"
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePricing("currency", "KES")}
                        className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                          formData.pricing.currency === "KES"
                            ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 monty uppercase"
                        }`}
                      >
                        KES (KSh)
                      </button>
                    </div>
                  </div>

                  {/* Pricing Options */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
                      Choose Your Preferred Pricing Model
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => updatePricing("type", "fixed")}
                        className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                          formData.pricing.type === "fixed"
                            ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400"
                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2 monty uppercase">
                          Fixed Price
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          One total price for the entire project
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updatePricing("type", "milestone")}
                        className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                          formData.pricing.type === "milestone"
                            ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400"
                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2 monty uppercase">
                          Milestone Based
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Pay as we complete project milestones
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updatePricing("type", "contract")}
                        className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                          formData.pricing.type === "contract"
                            ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500 dark:border-blue-400"
                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="text-lg font-semibold monty uppercase text-gray-900 dark:text-white mb-2">
                          Contract-Based
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Fixed-term engagement with defined scope
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Fixed Price Details */}
                  {formData.pricing.type === "fixed" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                          Estimated Project Budget ({formData.pricing.currency})
                        </label>
                        <input
                          type="text"
                          value={formData.pricing.fixedBudget || ""}
                          onChange={(e) =>
                            updatePricing("fixedBudget", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          placeholder={`Enter your budget in ${formData.pricing.currency}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Milestone Details */}
                  {formData.pricing.type === "milestone" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Project Milestones
                        </h3>
                        <button
                          type="button"
                          onClick={addMilestone}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/20 border border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                        >
                          <FaPlus className="text-sm" />
                          <span>Add Milestone</span>
                        </button>
                      </div>

                      {(formData.pricing.milestones || []).map(
                        (milestone, index) => (
                          <div
                            key={milestone.id}
                            className="p-4 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-gray-900 dark:text-white font-medium">
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
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                  className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-[15.5px"
                                  placeholder="e.g., Design & Wireframes"
                                />
                              </div>

                              <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                  className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-[15.5px"
                                  placeholder="Amount"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-[15.5px resize-none"
                                placeholder="What will be delivered in this milestone?"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-[15.5px"
                                placeholder="e.g., 2 weeks"
                              />
                            </div>
                          </div>
                        )
                      )}

                      {(formData.pricing.milestones || []).length === 0 && (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                          <FaProjectDiagram className="mx-auto text-3xl mb-4 opacity-50" />
                          <p>
                            No milestones added yet. Click "Add Milestone" to
                            get started.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contract-Based Details */}
                  {formData.pricing.type === "contract" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Engagement Type *
                          </label>
                          <select
                            value={
                              formData.pricing.contractDetails
                                ?.engagementType || "fixed-term"
                            }
                            onChange={(e) =>
                              updateContractDetails(
                                "engagementType",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          >
                            <option
                              value="fixed-term"
                              className="bg-white dark:bg-gray-800"
                            >
                              Fixed-Term
                            </option>
                            <option
                              value="retainer"
                              className="bg-white dark:bg-gray-800"
                            >
                              Retainer
                            </option>
                            <option
                              value="ongoing"
                              className="bg-white dark:bg-gray-800"
                            >
                              Ongoing
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Contract Duration *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={
                                formData.pricing.contractDetails?.duration || ""
                              }
                              onChange={(e) =>
                                updateContractDetails(
                                  "duration",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                              placeholder="e.g., 3"
                              min="1"
                            />
                            <select
                              value={
                                formData.pricing.contractDetails
                                  ?.durationUnit || "months"
                              }
                              onChange={(e) =>
                                updateContractDetails(
                                  "durationUnit",
                                  e.target.value
                                )
                              }
                              className="px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            >
                              <option
                                value="months"
                                className="bg-white dark:bg-gray-800"
                              >
                                Months
                              </option>
                              <option
                                value="years"
                                className="bg-white dark:bg-gray-800"
                              >
                                Years
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Working Hours/Week *
                          </label>
                          <input
                            type="number"
                            value={
                              formData.pricing.contractDetails
                                ?.workingHoursPerWeek || ""
                            }
                            onChange={(e) =>
                              updateContractDetails(
                                "workingHoursPerWeek",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder="e.g., 40"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Monthly Rate ({formData.pricing.currency}) *
                          </label>
                          <input
                            type="text"
                            value={
                              formData.pricing.contractDetails?.monthlyRate ||
                              ""
                            }
                            onChange={(e) =>
                              updateContractDetails(
                                "monthlyRate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder={`e.g., 4000`}
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Enter the monthly rate (e.g., $4000/month)
                          </p>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Preferred Start Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={
                              formData.pricing.contractDetails?.startDate || ""
                            }
                            onChange={(e) =>
                              updateContractDetails("startDate", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                          Detailed Job Description *
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          Provide comprehensive details about the role,
                          responsibilities, requirements, and expectations for
                          this contract position
                        </p>
                        <RichContentEditor
                          value={
                            formData.pricing.contractDetails?.jobDescription ||
                            ""
                          }
                          onChange={(html) =>
                            updateContractDetails("jobDescription", html)
                          }
                          placeholder="Enter detailed job description..."
                        />
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Note:</strong> Contract details help us match
                          you with the right developers and provide accurate
                          project estimates. Final terms will be discussed
                          during consultation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center">
                  <FaCheck className="mr-3 text-green-600 dark:text-green-400" />
                  Review Your Project
                </h2>

                <div className="space-y-6">
                  {/* User Info Summary */}
                  <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15.5px">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Name:
                        </span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formData.userInfo.firstName}{" "}
                          {formData.userInfo.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Email:
                        </span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formData.userInfo.email}
                        </span>
                      </div>
                      {formData.userInfo.phone && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Phone:
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {formData.userInfo.phone}
                          </span>
                        </div>
                      )}
                      {formData.userInfo.company && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Company:
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {formData.userInfo.company}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details Summary */}
                  <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FaProjectDiagram className="mr-2 text-blue-600 dark:text-blue-400" />
                      Project Overview
                    </h3>
                    <div className="space-y-3 text-[15.5px">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Project:
                        </span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formData.projectDetails.title}
                        </span>
                      </div>
                      {formData.projectDetails.category && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Category:
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {formData.projectDetails.category}
                          </span>
                        </div>
                      )}
                      {formData.projectDetails.techStack.length > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Tech Stack:
                          </span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.projectDetails.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded text-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Summary:
                        </span>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {formData.projectDetails.description}
                        </p>
                      </div>
                      {formData.projectDetails.timeline && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Timeline:
                          </span>
                          <span className="text-gray-900 dark:text-white ml-2">
                            {formData.projectDetails.timeline}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="p-6 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FaDollarSign className="mr-2 text-green-600 dark:text-green-400" />
                      Pricing Structure
                    </h3>
                    <div className="space-y-3 text-[15.5px">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Model:
                        </span>
                        <span className="text-gray-900 dark:text-white ml-2 capitalize">
                          {formData.pricing.type} Price
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Currency:
                        </span>
                        <span className="text-gray-900 dark:text-white ml-2">
                          {formData.pricing.currency}
                        </span>
                      </div>

                      {formData.pricing.type === "fixed" &&
                        formData.pricing.fixedBudget && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Budget:
                            </span>
                            <span className="text-gray-900 dark:text-white ml-2">
                              {formData.pricing.currency}{" "}
                              {formData.pricing.fixedBudget}
                            </span>
                          </div>
                        )}

                      {formData.pricing.type === "contract" &&
                        formData.pricing.contractDetails && (
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Engagement Type:
                              </span>
                              <span className="text-gray-900 dark:text-white ml-2 capitalize">
                                {formData.pricing.contractDetails.engagementType.replace(
                                  "-",
                                  " "
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Duration:
                              </span>
                              <span className="text-gray-900 dark:text-white ml-2">
                                {formData.pricing.contractDetails.duration}{" "}
                                {formData.pricing.contractDetails.durationUnit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Working Hours/Week:
                              </span>
                              <span className="text-gray-900 dark:text-white ml-2">
                                {
                                  formData.pricing.contractDetails
                                    .workingHoursPerWeek
                                }{" "}
                                hours
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Monthly Rate:
                              </span>
                              <span className="text-gray-900 dark:text-white ml-2">
                                {formData.pricing.currency}{" "}
                                {formData.pricing.contractDetails.monthlyRate}
                                /month
                              </span>
                            </div>
                            {formData.pricing.contractDetails.startDate && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Start Date:
                                </span>
                                <span className="text-gray-900 dark:text-white ml-2">
                                  {new Date(
                                    formData.pricing.contractDetails.startDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Job Description:
                              </span>
                              <div
                                className="prose dark:prose-invert max-w-none mt-2 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    formData.pricing.contractDetails
                                      .jobDescription,
                                }}
                              />
                            </div>
                          </div>
                        )}

                      {formData.pricing.type === "milestone" &&
                        formData.pricing.milestones &&
                        formData.pricing.milestones.length > 0 && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Milestones:
                            </span>
                            <div className="mt-2 space-y-2">
                              {formData.pricing.milestones.map(
                                (milestone, index) => (
                                  <div
                                    key={milestone.id}
                                    className="p-3 bg-gray-50 dark:bg-white/5 rounded border-l-2 border-blue-500 dark:border-blue-400"
                                  >
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {milestone.title ||
                                        `Milestone ${index + 1}`}
                                    </div>
                                    {milestone.budget && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Budget: {formData.pricing.currency}{" "}
                                        {milestone.budget}
                                      </div>
                                    )}
                                    {milestone.timeline && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Timeline: {milestone.timeline}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Client Terms and Privacy Policy */}

                  <div className="p-6 bg-blue-50 dark:bg-indigo-400/5 border border-blue-200 dark:border-white/10 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={clientPrivacyAccepted}
                        onChange={(e) =>
                          setClientPrivacyAccepted(e.target.checked)
                        }
                        className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-transparent border-2 border-blue-600 dark:border-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        I agree to the{" "}
                        <Link
                          href="/legal/client-terms-of-service"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/legal/client-privacy-policy"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Privacy Policy
                        </Link>
                        . I understand that this is a project inquiry and final
                        pricing will be confirmed after initial consultation.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-16 pt-6 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  currentStep === 1
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                }`}
              >
                <FaArrowLeft className="text-[15.5px" />
                <span>Previous</span>
              </button>

              <div className="text-center text-[15.5px] text-gray-700 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    isStepValid()
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                      : "bg-gray-300 dark:bg-gray-500/20 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span>Next</span>
                  <FaArrowRight className="text-[15.5px" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="cursor-pointer monty uppercase flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <FaCheck className="text-[15.5px" />
                  <span>Submit Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ambient background effects */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </section>
    </>
  );
}
