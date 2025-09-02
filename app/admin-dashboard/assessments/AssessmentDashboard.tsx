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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Developer Assessments</h1>
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
                <p className="text-xl font-semibold">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6">Assessment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Draft",
                        value: sourceAssessments.filter(
                          (a) => a.status === "draft"
                        ).length,
                      },
                      {
                        name: "Submitted",
                        value: sourceAssessments.filter(
                          (a) => a.status === "submitted"
                        ).length,
                      },
                      {
                        name: "Reviewed",
                        value: sourceAssessments.filter(
                          (a) => a.status === "reviewed"
                        ).length,
                      },
                      {
                        name: "Finalized",
                        value: sourceAssessments.filter(
                          (a) => a.status === "finalized"
                        ).length,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.85)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score Trend */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6">Score Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={sourceAssessments.map((a, idx) => ({
                    name: a.developerName || `Assessment ${idx + 1}`,
                    score: a.evaluation?.overallScore || 0,
                  }))}
                >
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="name" stroke="#9CA3AF" hide />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.85)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATIONS TAB (List + Filters) */}
      {activeTab === "evaluations" && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="p-6 bg-gray-800/60 border-b border-white/10 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by developer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="finalized">Finalized</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="initial">Initial</option>
                <option value="periodic">Periodic</option>
                <option value="project_based">Project Based</option>
              </select>
            </div>
          </div>

          {/* Assessments List */}
          <div className="p-6">
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
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
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
                  <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-4 space-y-4">
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
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
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
                        className="px-3 py-1 bg-gray-600/50 text-gray-300 rounded text-sm hover:bg-gray-600/70 transition-colors"
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
                      className={`bg-gray-800/70 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border border-white/10 ${
                        selectedAssessments.includes(assessment.id)
                          ? "ring-2 ring-blue-500/50 bg-blue-900/20"
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
                                  className={`font-semibold ${
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Top Skills</h3>
              <div className="space-y-3">
                {Object.entries(
                  sourceAssessments.reduce<Record<string, number>>((acc, a) => {
                    a.technicalSkills?.skillRatings?.forEach((s) => {
                      acc[s.category] = (acc[s.category] || 0) + 1;
                    });
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([skill, count]) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-300">{skill}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Soft Skills (avg)</h3>
              <div className="space-y-2 text-sm text-gray-300">
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
                        10
                    ) / 10;
                  return [
                    { label: "Communication", v: avg("communication") },
                    { label: "Teamwork", v: avg("teamwork") },
                    { label: "Problem Solving", v: avg("problemSolving") },
                    { label: "Time Mgmt", v: avg("timeManagement") },
                    {
                      label: "Client Interaction",
                      v: avg("clientInteraction"),
                    },
                  ];
                })().map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span>{row.label}</span>
                    <span className="text-white font-medium">{row.v}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Pool Eligibility</h3>
              <div className="text-4xl font-semibold">{stats.poolMembers}</div>
              <div className="text-gray-400 mt-2">
                {Math.round(
                  (stats.poolMembers / Math.max(stats.total, 1)) * 100
                )}
                % eligible
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
    </div>
  );
}
