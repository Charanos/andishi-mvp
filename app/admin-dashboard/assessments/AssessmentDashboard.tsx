"use client";

import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { useAssessments, DeveloperAssessment } from "@/hooks/useAssessments";
import { useAssessmentActions } from "@/hooks/useAssessmentActions";
import {
  ClipboardCheck,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Award,
  Target,
  DollarSign,
  Mail,
  Zap,
  UserPlus,
  Send,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  GitCompare,
  Layers,
  Activity,
  Bell,
  CheckSquare,
  Square,
  MoreHorizontal,
  ArrowUpDown,
  SlidersHorizontal,
  Bookmark,
  Star,
  AlertTriangle,
  Code,
  Trophy,
} from "lucide-react";
import EvaluationInviteView from "./components/EvaluationInviteView";
import AutoAssessView from "./components/AutoAssessView";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

type AssessmentsTab =
  | "overview"
  | "evaluations"
  | "performance"
  | "auto-assess"
  | "invite-evaluation";

type SortBy = "date" | "score" | "name" | "status";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "table";

interface DateRange {
  from: string;
  to: string;
}

interface ScoreRange {
  min: number;
  max: number;
}

interface Developer {
  id: string;
  name: string;
  email: string;
}

// Shared chart colors (aligned with analytics theme)
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#6B7280", // gray
];

// Fallback mock assessments - only used when API returns empty results
const MOCK_ASSESSMENTS: DeveloperAssessment[] = [
  {
    id: "a1",
    developerId: "dev-101",
    evaluatorId: "admin-1",
    evaluatorEmail: "lead@andishi.dev",
    evaluationType: "initial",
    technicalSkills: {
      specialty: "Frontend",
      primaryStack: ["React", "TypeScript", "Tailwind"],
      skillRatings: [
        { category: "React", rating: 85 },
        { category: "TypeScript", rating: 80 },
        { category: "UI/UX", rating: 78 },
      ],
      overallTechnicalScore: 82,
    },
    professionalSkills: {
      communication: 85,
      teamwork: 80,
      problemSolving: 78,
      timeManagement: 82,
      clientInteraction: 88,
      overallProfessionalScore: 83,
    },
    experienceAssessment: {
      relevantExperience: true,
      projectComplexity: "mid",
      industryKnowledge: ["SaaS", "FinTech"],
      portfolioQuality: 80,
    },
    evaluation: {
      overallScore: 84,
      recommendation: "approved",
      techPoolEligible: true,
      suggestedRate: 35,
      suggestedProjects: ["Marketing Site Revamp"],
      strengths: ["Clean code", "Great UX"],
      improvements: ["Unit tests"],
      evaluatorComments: "Solid candidate with strong fundamentals.",
    },
    status: "finalized",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    developerName: "Aisha K",
    developerEmail: "aisha@example.com",
  },
  {
    id: "a2",
    developerId: "dev-102",
    evaluatorId: "admin-1",
    evaluationType: "periodic",
    technicalSkills: {
      specialty: "Backend",
      primaryStack: ["Node.js", "Prisma", "PostgreSQL"],
      skillRatings: [
        { category: "Node.js", rating: 88 },
        { category: "Databases", rating: 76 },
        { category: "API Design", rating: 82 },
      ],
      overallTechnicalScore: 82,
    },
    professionalSkills: {
      communication: 72,
      teamwork: 80,
      problemSolving: 86,
      timeManagement: 75,
      clientInteraction: 70,
      overallProfessionalScore: 77,
    },
    experienceAssessment: {
      relevantExperience: true,
      projectComplexity: "senior",
      industryKnowledge: ["E‑commerce"],
      portfolioQuality: 74,
    },
    evaluation: {
      overallScore: 79,
      recommendation: "needs_review",
      techPoolEligible: false,
      suggestedRate: 40,
      suggestedProjects: ["API Gateway"],
      strengths: ["Problem solving"],
      improvements: ["Client communication"],
      evaluatorComments: "Great technically, polish soft skills.",
    },
    status: "reviewed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    developerName: "Brian O",
    developerEmail: "brian@example.com",
  },
  {
    id: "a3",
    developerId: "dev-103",
    evaluatorId: "admin-2",
    evaluationType: "project_based",
    technicalSkills: {
      specialty: "Full‑stack",
      primaryStack: ["Next.js", "tRPC", "MongoDB"],
      skillRatings: [
        { category: "Next.js", rating: 75 },
        { category: "tRPC", rating: 70 },
        { category: "MongoDB", rating: 68 },
      ],
      overallTechnicalScore: 71,
    },
    professionalSkills: {
      communication: 79,
      teamwork: 76,
      problemSolving: 70,
      timeManagement: 72,
      clientInteraction: 78,
      overallProfessionalScore: 75,
    },
    experienceAssessment: {
      relevantExperience: false,
      projectComplexity: "junior",
      industryKnowledge: ["EdTech"],
      portfolioQuality: 65,
    },
    evaluation: {
      overallScore: 73,
      recommendation: "probation",
      techPoolEligible: false,
      suggestedRate: 22,
      suggestedProjects: ["Internal tools"],
      strengths: ["Communication"],
      improvements: ["DB modelling"],
      evaluatorComments: "Potential to grow quickly.",
    },
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    developerName: "Cynthia M",
    developerEmail: "cynthia@example.com",
  },
];

export default function AssessmentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    assessments,
    loading,
    fetchAssessments,
    deleteAssessment,
    createAssessment,
  } = useAssessments();
  const { resendInvitation } = useAssessmentActions();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedAssessment, setSelectedAssessment] =
    useState<DeveloperAssessment | null>(null);
  const [activeTab, setActiveTab] = useState<AssessmentsTab>("overview");
  const [timeRange, setTimeRange] = useState("12M");
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null
  );
  const [inviteAssessment, setInviteAssessment] =
    useState<DeveloperAssessment | null>(null);

  // Enhanced state for comprehensive features
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [scoreRange, setScoreRange] = useState<ScoreRange>({
    min: 0,
    max: 100,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [bookmarkedAssessments, setBookmarkedAssessments] = useState<string[]>(
    []
  );
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Only depend on the stable fetchAssessments callback to avoid repeated fetching.
    // The hook itself already handles error toasts.
    fetchAssessments().catch(() => {
      // no-op: error handling is inside useAssessments
    });
  }, [fetchAssessments]);

  // Use API results primarily, fall back to mocks only for empty state
  const sourceAssessments = useMemo<DeveloperAssessment[]>(() => {
    // If we have real assessments from API, use them
    if (assessments && assessments.length > 0) {
      return assessments;
    }
    // Only show mock data if we're not loading and have no real data
    // This prevents showing mock data while real data is being fetched
    return loading ? [] : MOCK_ASSESSMENTS;
  }, [assessments, loading]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = sourceAssessments.length;
    const pending = sourceAssessments.filter(
      (a) => a.status === "draft" || a.status === "submitted"
    ).length;
    const completed = sourceAssessments.filter(
      (a) => a.status === "finalized"
    ).length;
    const approved = sourceAssessments.filter(
      (a) => a.evaluation?.recommendation === "approved"
    ).length;
    const poolMembers = sourceAssessments.filter(
      (a) => a.evaluation?.techPoolEligible
    ).length;
    const avgScore =
      Math.round(
        (sourceAssessments.reduce(
          (sum, a) => sum + (a.evaluation?.overallScore || 0),
          0
        ) /
          Math.max(sourceAssessments.length, 1)) *
          10
      ) / 10;

    return {
      total,
      pending,
      completed,
      approved,
      poolMembers,
      avgScore,
    };
  }, [sourceAssessments]);

  // Enhanced filtering and sorting
  const filteredAndSortedAssessments = useMemo(() => {
    let filtered = sourceAssessments.filter((assessment) => {
      const matchesSearch =
        assessment.developerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assessment.developerEmail
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assessment.technicalSkills?.specialty
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || assessment.status === filterStatus;

      const matchesType =
        filterType === "all" || assessment.evaluationType === filterType;

      // Date range filter
      const matchesDateRange =
        !dateRange.from ||
        !dateRange.to ||
        (new Date(assessment.createdAt) >= new Date(dateRange.from) &&
          new Date(assessment.createdAt) <= new Date(dateRange.to));

      // Score range filter
      const score = assessment.evaluation?.overallScore || 0;
      const matchesScoreRange =
        score >= scoreRange.min && score <= scoreRange.max;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDateRange &&
        matchesScoreRange
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "score":
          comparison =
            (a.evaluation?.overallScore || 0) -
            (b.evaluation?.overallScore || 0);
          break;
        case "name":
          comparison = (a.developerName || "").localeCompare(
            b.developerName || ""
          );
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    sourceAssessments,
    searchTerm,
    filterStatus,
    filterType,
    dateRange,
    scoreRange,
    sortBy,
    sortOrder,
  ]);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      submitted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      reviewed: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      finalized: "bg-green-500/20 text-green-300 border-green-500/30",
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getRecommendationBadge = (recommendation: string) => {
    const badges = {
      approved: "bg-green-500/20 text-green-300 border-green-500/30",
      rejected: "bg-red-500/20 text-red-300 border-red-500/30",
      needs_review: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      probation: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
    return badges[recommendation as keyof typeof badges] || badges.needs_review;
  };

  const handleCreateAssessment = async () => {
    try {
      const newAssessment = await createAssessment("temp-dev-id", "initial");
      if (newAssessment) {
        setInviteAssessment(newAssessment);
        setActiveTab("invite-evaluation");
      }
    } catch (error) {
      toast.error("Failed to create assessment", "Please try again later");
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this assessment? This action cannot be undone."
      )
    ) {
      const success = await deleteAssessment(id);
      if (success) {
        await fetchAssessments();
        toast.success(
          "Assessment deleted",
          "Assessment has been removed successfully"
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (
      confirm(
        `Delete ${selectedAssessments.length} selected assessments? This cannot be undone.`
      )
    ) {
      try {
        for (const id of selectedAssessments) {
          await deleteAssessment(id);
        }
        setSelectedAssessments([]);
        await fetchAssessments();
        toast.success(
          "Assessments deleted",
          "Selected assessments have been removed"
        );
      } catch (error) {
        toast.error(
          "Failed to delete assessments",
          "Some assessments may not have been deleted"
        );
      }
    }
  };

  const toggleAssessmentSelection = (id: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedAssessments((prev) =>
      prev.includes(id)
        ? prev.filter((bookmarkId) => bookmarkId !== id)
        : [...prev, id]
    );
  };

  const handleExport = (format: "csv" | "json" | "pdf") => {
    const dataToExport =
      selectedAssessments.length > 0
        ? sourceAssessments.filter((a) => selectedAssessments.includes(a.id))
        : filteredAndSortedAssessments;

    if (format === "csv") {
      const csvContent = [
        // CSV Headers
        "Developer Name,Email,Status,Type,Overall Score,Recommendation,Pool Eligible,Created Date,Reviewed Date",
        // CSV Data
        ...dataToExport.map((a) =>
          [
            a.developerName || "Unknown",
            a.developerEmail || "",
            a.status,
            a.evaluationType,
            a.evaluation?.overallScore || 0,
            a.evaluation?.recommendation || "",
            a.evaluation?.techPoolEligible ? "Yes" : "No",
            new Date(a.createdAt).toLocaleDateString(),
            a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString() : "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessments-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "json") {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessments-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    setShowExportModal(false);
    toast.success(
      "Export completed",
      `${dataToExport.length} assessments exported as ${format.toUpperCase()}`
    );
  };

  const handleSelectAll = () => {
    if (selectedAssessments.length === filteredAndSortedAssessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(filteredAndSortedAssessments.map((a) => a.id));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-medium">Developer Assessments</h1>
          <p className="text-gray-300">
            Track evaluations, performance and outcomes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-xl"
          >
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="3M">Last 3 Months</option>
            <option value="12M">Last 12 Months</option>
          </select>

          <button
            onClick={() => {
              setSelectedDeveloper({
                id: "temp-dev-id",
                name: "Select Developer",
                email: "",
              });
              setActiveTab("auto-assess");
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Zap className="h-4 w-4" />
            <span>Auto-Assess</span>
          </button>

          <button
            onClick={handleCreateAssessment}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Assessment</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Inline Tabs (mirrors analytics) */}
      <div className="backdrop-blur-xl my-16 bg-white/5 border border-white/10 rounded-2xl p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Target className="h-4 w-4" />
            <span className="uppercase text-sm">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("evaluations")}
            className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "evaluations"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span className="uppercase text-sm">Evaluations</span>
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "performance"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span className="uppercase text-sm">Performance & Skills</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: Users,
                color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                color:
                  "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
              },
              {
                label: "Completed",
                value: stats.completed,
                icon: CheckCircle,
                color: "from-green-500/20 to-green-600/20 border-green-500/30",
              },
              {
                label: "Approved",
                value: stats.approved,
                icon: TrendingUp,
                color:
                  "from-purple-500/20 to-purple-600/20 border-purple-500/30",
              },
              {
                label: "Pool Eligible",
                value: stats.poolMembers,
                icon: Award,
                color:
                  "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
              },
              {
                label: "Avg Score",
                value: `${stats.avgScore}%`,
                icon: Target,
                color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${m.color} border backdrop-blur-xl p-5`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white/10">
                    <m.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-gray-300 text-xs uppercase tracking-wider">
                  {m.label}
                </p>
                <p className="text-xl font-medium">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 my-22">
            {/* Assessment Status Distribution */}
            <div className="backdrop-blur-xl bg-black/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Assessment Status Distribution
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Overview of assessment progress
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Total
                  </div>
                </div>
              </div>

              <div className="relative">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      <filter
                        id="shadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="4"
                          stdDeviation="8"
                          floodColor="rgba(0,0,0,0.3)"
                        />
                      </filter>
                    </defs>
                    <Pie
                      data={[
                        {
                          name: "Draft",
                          value: sourceAssessments.filter(
                            (a) => a.status === "draft"
                          ).length,
                          fill: "#64748B",
                        },
                        {
                          name: "Submitted",
                          value: sourceAssessments.filter(
                            (a) => a.status === "submitted"
                          ).length,
                          fill: "#3B82F6",
                        },
                        {
                          name: "Reviewed",
                          value: sourceAssessments.filter(
                            (a) => a.status === "reviewed"
                          ).length,
                          fill: "#F59E0B",
                        },
                        {
                          name: "Finalized",
                          value: sourceAssessments.filter(
                            (a) => a.status === "finalized"
                          ).length,
                          fill: "#10B981",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      filter="url(#shadow)"
                    >
                      {/* Add hover effects */}
                      <Cell
                        fill="#64748B"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      />
                      <Cell
                        fill="#3B82F6"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      />
                      <Cell
                        fill="#F59E0B"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      />
                      <Cell
                        fill="#10B981"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "16px",
                        color: "#fff",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(16px)",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "600" }}
                      formatter={(value: number) => [
                        `${value} assessments`,
                        "Count",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stats */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">
                      Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Status Legend */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  {
                    name: "Draft",
                    color: "#64748B",
                    count: sourceAssessments.filter((a) => a.status === "draft")
                      .length,
                    bgColor: "bg-white/10 backdrop-blur-2xl",
                  },
                  {
                    name: "Submitted",
                    color: "#3B82F6",
                    count: sourceAssessments.filter(
                      (a) => a.status === "submitted"
                    ).length,
                    bgColor: "bg-white/10 backdrop-blur-2xl",
                  },
                  {
                    name: "Reviewed",
                    color: "#F59E0B",
                    count: sourceAssessments.filter(
                      (a) => a.status === "reviewed"
                    ).length,
                    bgColor: "bg-white/10 backdrop-blur-2xl",
                  },
                  {
                    name: "Finalized",
                    color: "#10B981",
                    count: sourceAssessments.filter(
                      (a) => a.status === "finalized"
                    ).length,
                    bgColor: "bg-white/10 backdrop-blur-2xl",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`${item.bgColor} rounded-xl p-4 border border-white/10`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full ring-2 ring-white/20"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-200">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {item.count}
                        </div>
                        <div className="text-xs text-gray-400">
                          {stats.total > 0
                            ? Math.round((item.count / stats.total) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution & Trends */}
            <div className="backdrop-blur-xl bg-black/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Score Distribution
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Performance breakdown by score ranges
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {stats.avgScore}%
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Average
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[
                    {
                      range: "0-25%",
                      count: sourceAssessments.filter(
                        (a) => (a.evaluation?.overallScore || 0) <= 25
                      ).length,
                      fill: "#EF4444",
                      label: "Poor",
                    },
                    {
                      range: "26-50%",
                      count: sourceAssessments.filter(
                        (a) =>
                          (a.evaluation?.overallScore || 0) > 25 &&
                          (a.evaluation?.overallScore || 0) <= 50
                      ).length,
                      fill: "#F59E0B",
                      label: "Fair",
                    },
                    {
                      range: "51-75%",
                      count: sourceAssessments.filter(
                        (a) =>
                          (a.evaluation?.overallScore || 0) > 50 &&
                          (a.evaluation?.overallScore || 0) <= 75
                      ).length,
                      fill: "#3B82F6",
                      label: "Good",
                    },
                    {
                      range: "76-100%",
                      count: sourceAssessments.filter(
                        (a) => (a.evaluation?.overallScore || 0) > 75
                      ).length,
                      fill: "#10B981",
                      label: "Excellent",
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient
                      id="redGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FCA5A5" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient
                      id="orangeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FCD34D" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient
                      id="blueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#93C5FD" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <linearGradient
                      id="greenGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6EE7B7" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter
                      id="barShadow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="4"
                        floodColor="rgba(0,0,0,0.2)"
                      />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="rgba(255,255,255,0.1)"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fill: "#D1D5DB", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fill: "#D1D5DB", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "16px",
                      color: "#fff",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(16px)",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "600" }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} assessments`,
                      props.payload.label || "Score Range",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    filter="url(#barShadow)"
                  >
                    <Cell fill="url(#redGradient)" />
                    <Cell fill="url(#orangeGradient)" />
                    <Cell fill="url(#blueGradient)" />
                    <Cell fill="url(#greenGradient)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Score Range Legend */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                {[
                  {
                    range: "0-25%",
                    label: "Poor",
                    color: "#EF4444",
                    bgColor: "bg-white/10",
                  },
                  {
                    range: "26-50%",
                    label: "Fair",
                    color: "#F59E0B",
                    bgColor: "bg-white/10",
                  },
                  {
                    range: "51-75%",
                    label: "Good",
                    color: "#3B82F6",
                    bgColor: "bg-white/10",
                  },
                  {
                    range: "76-100%",
                    label: "Excellent",
                    color: "#10B981",
                    bgColor: "bg-white/10",
                  },
                ].map((item, index) => {
                  const count = [
                    sourceAssessments.filter(
                      (a) => (a.evaluation?.overallScore || 0) <= 25
                    ).length,
                    sourceAssessments.filter(
                      (a) =>
                        (a.evaluation?.overallScore || 0) > 25 &&
                        (a.evaluation?.overallScore || 0) <= 50
                    ).length,
                    sourceAssessments.filter(
                      (a) =>
                        (a.evaluation?.overallScore || 0) > 50 &&
                        (a.evaluation?.overallScore || 0) <= 75
                    ).length,
                    sourceAssessments.filter(
                      (a) => (a.evaluation?.overallScore || 0) > 75
                    ).length,
                  ][index];

                  return (
                    <div
                      key={item.range}
                      className={`${item.bgColor} rounded-xl p-3 border border-white/10`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-white/20"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs font-medium text-gray-200">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{item.range}</div>
                      <div className="text-lg font-bold text-white">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommendations Overview */}
          <div className="mb-22">
            <h3 className="text-xl font-medium text-white mb-6">
              Recommendations Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  name: "Approved",
                  count: sourceAssessments.filter(
                    (a) => a.evaluation?.recommendation === "approved"
                  ).length,
                  color: "bg-white/5 backdrop-blur-2xl",
                  icon: CheckCircle,
                  textColor: "text-green-400",
                },
                {
                  name: "Probation",
                  count: sourceAssessments.filter(
                    (a) => a.evaluation?.recommendation === "probation"
                  ).length,
                  color: "bg-white/5 backdrop-blur-2xl",
                  icon: AlertTriangle,
                  textColor: "text-orange-400",
                },
                {
                  name: "Needs Review",
                  count: sourceAssessments.filter(
                    (a) => a.evaluation?.recommendation === "needs_review"
                  ).length,
                  color: "bg-white/5 backdrop-blur-2xl",
                  icon: Eye,
                  textColor: "text-blue-400",
                },
                {
                  name: "Rejected",
                  count: sourceAssessments.filter(
                    (a) => a.evaluation?.recommendation === "rejected"
                  ).length,
                  color: "bg-white/5 backdrop-blur-2xl",
                  icon: XCircle,
                  textColor: "text-red-400",
                },
              ].map((rec) => (
                <div
                  key={rec.name}
                  className={`bg-gradient-to-br ${rec.color} border border-gray-400/10 monty uppercase rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <rec.icon className={`w-6 h-6 ${rec.textColor}`} />
                    <span className="text-2xl font-semibold text-white">
                      {rec.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{rec.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.total > 0
                      ? Math.round((rec.count / stats.total) * 100)
                      : 0}
                    % of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EVALUATIONS TAB (List + Filters) */}
      {activeTab === "evaluations" && (
        <div className="space-y-6">
          {/* Enhanced Filters and Search */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by developer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
              >
                <option value="all" className="bg-gray-800">
                  All Status
                </option>
                <option value="draft" className="bg-gray-800">
                  Draft
                </option>
                <option value="submitted" className="bg-gray-800">
                  Submitted
                </option>
                <option value="reviewed" className="bg-gray-800">
                  Reviewed
                </option>
                <option value="finalized" className="bg-gray-800">
                  Finalized
                </option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm"
              >
                <option value="all" className="bg-gray-800">
                  All Types
                </option>
                <option value="initial" className="bg-gray-800">
                  Initial
                </option>
                <option value="periodic" className="bg-gray-800">
                  Periodic
                </option>
                <option value="project_based" className="bg-gray-800">
                  Project Based
                </option>
              </select>
            </div>
          </div>

          {/* Enhanced Assessments List */}
          <div className="my-22">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">Loading assessments...</p>
              </div>
            ) : filteredAndSortedAssessments.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">
                  {assessments.length === 0
                    ? "No assessments created yet"
                    : "No assessments match your filters"}
                </p>
                {assessments.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Create your first assessment using the buttons above
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bulk Actions Bar */}
                {selectedAssessments.length > 0 && (
                  <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-300 font-medium">
                        {selectedAssessments.length} assessment
                        {selectedAssessments.length !== 1 ? "s" : ""} selected
                      </span>
                      <button
                        onClick={() => setSelectedAssessments([])}
                        className="text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        Clear selection
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        {selectedAssessments.length ===
                        filteredAndSortedAssessments.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Advanced Filters Panel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                        showAdvancedFilters
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "bg-gray-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Advanced Filters
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={`Sort ${
                          sortOrder === "asc" ? "Descending" : "Ascending"
                        }`}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="bg-transparent text-sm text-gray-400 border-none outline-none"
                      >
                        <option value="date">Date</option>
                        <option value="score">Score</option>
                        <option value="name">Name</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date From
                        </label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              from: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date To
                        </label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              to: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Min Score
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreRange.min}
                          onChange={(e) =>
                            setScoreRange((prev) => ({
                              ...prev,
                              min: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Score
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreRange.max}
                          onChange={(e) =>
                            setScoreRange((prev) => ({
                              ...prev,
                              max: parseInt(e.target.value) || 100,
                            }))
                          }
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDateRange({ from: "", to: "" });
                          setScoreRange({ min: 0, max: 100 });
                        }}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors text-sm backdrop-blur-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {filteredAndSortedAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                        selectedAssessments.includes(assessment.id)
                          ? "ring-2 ring-blue-500/50 bg-blue-500/10 border-blue-500/30"
                          : ""
                      }`}
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Selection Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAssessmentSelection(assessment.id);
                            }}
                            className="mt-1 p-1 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            {selectedAssessments.includes(assessment.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-xl font-medium">
                                {assessment.developerName ||
                                  "Unknown Developer"}
                              </h3>

                              {/* Bookmark Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(assessment.id);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  bookmarkedAssessments.includes(assessment.id)
                                    ? "text-yellow-400 hover:text-yellow-300"
                                    : "text-gray-500 hover:text-yellow-400"
                                }`}
                                title="Bookmark Assessment"
                              >
                                {bookmarkedAssessments.includes(
                                  assessment.id
                                ) ? (
                                  <Star className="w-4 h-4 fill-current" />
                                ) : (
                                  <Star className="w-4 h-4" />
                                )}
                              </button>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                  assessment.status
                                )}`}
                              >
                                {assessment.status.toUpperCase()}
                              </span>

                              <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-600 text-gray-300">
                                {assessment.evaluationType
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </div>

                            <p className="text-gray-400 mb-3">
                              {assessment.developerEmail}
                            </p>

                            {/* Assessment Progress Indicator */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Progress:</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      assessment.status === "draft"
                                        ? "bg-gray-500 w-1/4"
                                        : assessment.status === "submitted"
                                        ? "bg-blue-500 w-1/2"
                                        : assessment.status === "reviewed"
                                        ? "bg-yellow-500 w-3/4"
                                        : "bg-green-500 w-full"
                                    }`}
                                  />
                                </div>
                                <span className="text-gray-400 text-xs capitalize">
                                  {assessment.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  Overall Score:
                                </span>
                                <span
                                  className={`font-medium ${
                                    (assessment.evaluation?.overallScore ||
                                      0) >= 75
                                      ? "text-green-400"
                                      : (assessment.evaluation?.overallScore ||
                                          0) >= 60
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {assessment.evaluation?.overallScore || 0}%
                                </span>
                              </div>

                              {assessment.evaluation?.recommendation && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">
                                    Recommendation:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium border ${getRecommendationBadge(
                                      assessment.evaluation.recommendation
                                    )}`}
                                  >
                                    {assessment.evaluation.recommendation
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}

                              {assessment.evaluation?.techPoolEligible && (
                                <div className="flex items-center gap-1 text-green-400">
                                  <Award className="w-4 h-4" />
                                  <span className="text-xs font-medium">
                                    Pool Eligible
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>
                                  Created:{" "}
                                  {format(
                                    new Date(assessment.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                                {assessment.reviewedAt && (
                                  <span>
                                    Reviewed:{" "}
                                    {format(
                                      new Date(assessment.reviewedAt),
                                      "MMM dd, yyyy"
                                    )}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {assessment.technicalSkills?.skillRatings
                                    ?.length || 0}{" "}
                                  skills assessed
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/admin-dashboard/assessments/${assessment.id}`
                              );
                            }}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(assessment.status === "draft" ||
                            assessment.status === "submitted") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInviteAssessment(assessment);
                                setActiveTab("invite-evaluation");
                              }}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Send Evaluation Invite"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {assessment.evaluatorEmail &&
                            assessment.status !== "finalized" && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await resendInvitation(assessment.id);
                                }}
                                className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                                title="Resend Invitation"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                          {assessment.status !== "finalized" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/admin-dashboard/assessments/${assessment.id}`
                                );
                              }}
                              className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                              title="Edit Assessment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDeleteAssessment(assessment.id);
                            }}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Delete Assessment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Average Score
                </h3>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-semibold text-white mb-2">
                {Math.round(
                  sourceAssessments.reduce(
                    (sum, a) => sum + (a.evaluation?.overallScore || 0),
                    0
                  ) / Math.max(sourceAssessments.length, 1)
                )}
                %
              </div>
              <p className="text-sm text-gray-400">
                Across {sourceAssessments.length} assessments
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Completion Rate
                </h3>
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-semibold text-white mb-2">
                {Math.round(
                  (sourceAssessments.filter((a) => a.status === "finalized")
                    .length /
                    Math.max(sourceAssessments.length, 1)) *
                    100
                )}
                %
              </div>
              <p className="text-sm text-gray-400">
                {
                  sourceAssessments.filter((a) => a.status === "finalized")
                    .length
                }{" "}
                of {sourceAssessments.length} completed
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Pool Eligible
                </h3>
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-semibold text-white mb-2">
                {stats.poolMembers}
              </div>
              <p className="text-sm text-gray-400">
                {Math.round(
                  (stats.poolMembers / Math.max(stats.total, 1)) * 100
                )}
                % of total
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Avg Response Time
                </h3>
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-semibold text-white mb-2">
                {(() => {
                  const completedAssessments = sourceAssessments.filter(
                    (a) =>
                      a.reviewedAt && a.createdAt && a.status === "finalized"
                  );
                  if (completedAssessments.length === 0) return "0";
                  const avgDays =
                    completedAssessments.reduce((sum, a) => {
                      const created = new Date(a.createdAt);
                      const reviewed = new Date(a.reviewedAt!);
                      return (
                        sum +
                        Math.ceil(
                          (reviewed.getTime() - created.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      );
                    }, 0) / completedAssessments.length;
                  return Math.round(avgDays);
                })()}
              </div>
              <p className="text-sm text-gray-400">Days to complete</p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Skills Distribution */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-400" />
                Technical Skills Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const skillCounts = sourceAssessments.reduce<
                        Record<string, { total: number; avgScore: number }>
                      >((acc, a) => {
                        a.technicalSkills?.skillRatings?.forEach((s) => {
                          if (!acc[s.category]) {
                            acc[s.category] = { total: 0, avgScore: 0 };
                          }
                          acc[s.category].total += 1;
                          acc[s.category].avgScore += s.rating;
                        });
                        return acc;
                      }, {});

                      return Object.entries(skillCounts)
                        .map(([skill, data]) => ({
                          skill:
                            skill.length > 12
                              ? skill.substring(0, 12) + "..."
                              : skill,
                          count: data.total,
                          avgScore:
                            Math.round((data.avgScore / data.total) * 10) / 10,
                        }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 8);
                    })()}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="skill"
                      stroke="#9CA3AF"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,24,39,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value, name) => [
                        name === "count"
                          ? `${value} assessments`
                          : `${value}/5 avg`,
                        name === "count" ? "Frequency" : "Average Score",
                      ]}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Professional Skills Radar */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-400" />
                Professional Skills Average
              </h3>
              <div className="space-y-4">
                {(() => {
                  const avg = (
                    key: keyof NonNullable<
                      DeveloperAssessment["professionalSkills"]
                    >
                  ) =>
                    Math.round(
                      (sourceAssessments.reduce(
                        (sum, a) => sum + (a.professionalSkills?.[key] || 0),
                        0
                      ) /
                        Math.max(sourceAssessments.length, 1)) *
                        20
                    ) / 20;

                  const skills = [
                    {
                      label: "Communication",
                      value: avg("communication"),
                      color: "bg-blue-500",
                    },
                    {
                      label: "Teamwork",
                      value: avg("teamwork"),
                      color: "bg-green-500",
                    },
                    {
                      label: "Problem Solving",
                      value: avg("problemSolving"),
                      color: "bg-purple-500",
                    },
                    {
                      label: "Time Management",
                      value: avg("timeManagement"),
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Client Interaction",
                      value: avg("clientInteraction"),
                      color: "bg-pink-500",
                    },
                  ];

                  return skills.map((skill) => (
                    <div key={skill.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">
                          {skill.label}
                        </span>
                        <span className="text-white font-medium">
                          {skill.value}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className={`${skill.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${(skill.value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Score Trends Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(() => {
                    const monthlyData = sourceAssessments
                      .filter((a) => a.evaluation?.overallScore)
                      .sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .reduce<
                        Record<string, { scores: number[]; count: number }>
                      >((acc, assessment) => {
                        const month = format(
                          new Date(assessment.createdAt),
                          "MMM yyyy"
                        );
                        if (!acc[month]) {
                          acc[month] = { scores: [], count: 0 };
                        }
                        acc[month].scores.push(
                          assessment.evaluation!.overallScore!
                        );
                        acc[month].count += 1;
                        return acc;
                      }, {});

                    return Object.entries(monthlyData).map(([month, data]) => ({
                      month,
                      avgScore:
                        Math.round(
                          (data.scores.reduce((sum, score) => sum + score, 0) /
                            data.count) *
                            10
                        ) / 10,
                      count: data.count,
                      maxScore: Math.max(...data.scores),
                      minScore: Math.min(...data.scores),
                    }));
                  })()}
                >
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#3B82F6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value, name) => [
                      `${value}${name === "avgScore" ? "%" : ""}`,
                      name === "avgScore"
                        ? "Average Score"
                        : name === "count"
                        ? "Assessments"
                        : name === "maxScore"
                        ? "Highest Score"
                        : "Lowest Score",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {sourceAssessments
                  .filter((a) => a.evaluation?.overallScore)
                  .sort(
                    (a, b) =>
                      (b.evaluation?.overallScore || 0) -
                      (a.evaluation?.overallScore || 0)
                  )
                  .slice(0, 5)
                  .map((assessment, index) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {assessment.developerName || "Unknown"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {assessment.evaluation?.recommendation?.replace(
                              "_",
                              " "
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {assessment.evaluation?.overallScore}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Assessment Types */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Assessment Types
              </h3>
              <div className="space-y-3">
                {Object.entries(
                  sourceAssessments.reduce<Record<string, number>>((acc, a) => {
                    acc[a.evaluationType] = (acc[a.evaluationType] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">
                      {type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / sourceAssessments.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {sourceAssessments
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt || b.createdAt).getTime() -
                      new Date(a.updatedAt || a.createdAt).getTime()
                  )
                  .slice(0, 5)
                  .map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          assessment.status === "finalized"
                            ? "bg-green-400"
                            : assessment.status === "reviewed"
                            ? "bg-yellow-400"
                            : assessment.status === "submitted"
                            ? "bg-blue-400"
                            : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {assessment.developerName || "Unknown"}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {assessment.status === "finalized"
                            ? "Assessment completed"
                            : assessment.status === "reviewed"
                            ? "Under review"
                            : assessment.status === "submitted"
                            ? "Evaluation submitted"
                            : "Assessment created"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {format(
                            new Date(
                              assessment.updatedAt || assessment.createdAt
                            ),
                            "MMM dd, HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-ASSESS TAB */}
      {activeTab === "auto-assess" && selectedDeveloper && (
        <AutoAssessView
          onBack={() => setActiveTab("overview")}
          developer={selectedDeveloper}
          onAssessmentCreated={(assessment) => {
            fetchAssessments();
            toast.success(
              "Auto-assessment created",
              "Assessment generated successfully"
            );
            setActiveTab("overview");
          }}
        />
      )}

      {/* INVITE-EVALUATION TAB */}
      {activeTab === "invite-evaluation" && inviteAssessment && (
        <EvaluationInviteView
          onBack={() => {
            setActiveTab("overview");
            setInviteAssessment(null);
          }}
          assessment={inviteAssessment}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">
                Export Assessments
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                {selectedAssessments.length > 0
                  ? `Exporting ${selectedAssessments.length} selected assessments`
                  : `Exporting ${filteredAndSortedAssessments.length} filtered assessments`}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">CSV Format</div>
                      <div className="text-xs text-gray-400">
                        Spreadsheet compatible
                      </div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleExport("json")}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">JSON Format</div>
                      <div className="text-xs text-gray-400">
                        Full data structure
                      </div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600/20 text-gray-300 rounded-xl hover:bg-gray-600/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
