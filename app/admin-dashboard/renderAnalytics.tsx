import React, { useState, useEffect } from "react";
import ToastContainer from "../components/ToastContainer";
import useToast from "../../hooks/useToast";
import { EnhancedAnalyticsData } from "@/utils/admin-analytics";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  Award,
  Download,
  Filter,
  Calendar,
  Eye,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
  Target,
  Globe,
} from "lucide-react";

// Shared currency utilities
import {
  CurrencyAmount,
  extractAmount,
  formatCurrency,
} from "@/utils/currency";

// TypeScript interfaces for the analytics data
interface RevenueData {
  month: string;
  revenue: CurrencyAmount;
}

interface ProjectStatusData {
  name: string;
  value: number;
}

interface UserRoleData {
  role: string;
  count: number;
}

interface TopClient {
  name: string;
  projectCount: number;
  totalSpent: CurrencyAmount;
  pendingAmount: CurrencyAmount;
  totalValue: CurrencyAmount;
  id: string;
}

interface TopDeveloper {
  name: string;
  completedProjects: number;
  rating: number;
  skills: string[];
  id: string;
}

interface SkillDemand {
  skill: string;
  demand: number;
  developers: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
}

interface RenderAnalyticsProps {
  analytics: EnhancedAnalyticsData;
}

// Local view-specific aliases (could be removed if you re-export util types)
interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalRevenue: CurrencyAmount;
  monthlyGrowth: number;
  projectsByStatus: {
    completed: number;
    "in-progress": number;
    pending: number;
  };
  usersByRole: {
    client: number;
    developer: number;
    admin: number;
  };
  revenueByMonth: RevenueData[];
  topClients: TopClient[];
  topDevelopers: TopDeveloper[];
}

interface Activity {
  type: "project" | "user" | "revenue" | "milestone";
  message: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

type TimeRange = "7D" | "30D" | "3M" | "12M";
type TrendDirection = "up" | "down";
type MetricColor = "blue" | "green" | "purple" | "orange";

// Default structure for loading states
const defaultAnalytics: AnalyticsData = {
  totalUsers: 0,
  totalProjects: 0,
  totalRevenue: {
    amount: 0,
    currency: "USD",
    usdEquivalent: 0,
  } as CurrencyAmount,
  monthlyGrowth: 0,
  projectsByStatus: {
    completed: 0,
    "in-progress": 0,
    pending: 0,
  },
  usersByRole: {
    client: 0,
    developer: 0,
    admin: 0,
  },
  revenueByMonth: [],
  topClients: [],
  topDevelopers: [],
};

// Financial analytics data interfaces
interface PaymentStatusData {
  status: string;
  count: number;
  amount: number;
  color: string;
}

interface MonthlyPaymentData {
  month: string;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  outstanding: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  percentage: number;
}

// Real-time analytics data fetching
interface AnalyticsDataResponse {
  overview: AnalyticsData;
  financial: {
    paymentStatus: PaymentStatusData[];
    monthlyTrends: MonthlyPaymentData[];
    paymentMethods: PaymentMethodData[];
    kpis: {
      avgPaymentValue: number;
      successRate: number;
      avgProcessingTime: number;
      outstandingAmount: number;
    };
  };
  performance: {
    skills: SkillDemand[];
    metrics: PerformanceMetric[];
  };
  activities: (Omit<Activity, "icon"> & { icon: string })[];
}

// Harmonized color scheme for analytics
const ANALYTICS_COLORS = {
  primary: "#3B82F6", // Blue - for approved/completed
  success: "#10B981", // Green - for paid/successful
  warning: "#F59E0B", // Amber - for pending
  danger: "#EF4444", // Red - for rejected/failed
  info: "#8B5CF6", // Purple - for outstanding
  neutral: "#6B7280", // Gray - for inactive/neutral
};

const COLORS = [
  ANALYTICS_COLORS.primary,
  ANALYTICS_COLORS.success,
  ANALYTICS_COLORS.warning,
  ANALYTICS_COLORS.danger,
  ANALYTICS_COLORS.info,
  ANALYTICS_COLORS.neutral,
];





const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  trend: TrendDirection;
  color?: MetricColor;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl p-6 group hover:scale-105 transition-all duration-300`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center space-x-1">
            {trend === "up" ? (
              <ChevronUp className="h-4 w-4 text-green-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-400" : "text-red-400"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase monty tracking-wider">
            {label}
          </p>
          <p className="text-xl font-semibold text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface AnimatedProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "#ff004c",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white">{percentage}%</span>
      </div>
    </div>
  );
};

const AdvancedAnalyticsDashboard: React.FC<RenderAnalyticsProps> = ({
  analytics,
}) => {
  const { notifications, removeNotification, toast } = useToast();
  const [analyticsTab, setAnalyticsTab] = useState<
    "overview" | "financial" | "performance"
  >("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("12M");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsDataResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Use real analytics data from API or fallback to defaults during loading
  const safeAnalytics =
    analyticsData?.overview ?? analytics ?? defaultAnalytics;

  // Fetch comprehensive analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoadingAnalytics(true);
      try {
        const response = await fetch(
          `/api/analytics/comprehensive?timeRange=${timeRange}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          toast.error("Failed to fetch analytics data");
        }
      } catch (error) {
        toast.error(
          "Error fetching analytics data",
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        setLoadingAnalytics(false);
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Transform project status data for PieChart
  const projectStatusData: ProjectStatusData[] = Object.entries(
    safeAnalytics.projectsByStatus
  ).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace("-", " "),
    value: count,
  }));

  // Transform revenue data for charts (convert CurrencyAmount to numbers)
  const chartRevenueData = safeAnalytics.revenueByMonth.map((item) => ({
    month: item.month,
    revenue: extractAmount(item.revenue), // Convert CurrencyAmount to number for chart
    originalRevenue: item.revenue, // Keep original for tooltips
  }));

  // Transform client data for display (extract amounts for sorting/display)
  const transformedTopClients = safeAnalytics.topClients.map((client) => ({
    ...client,
    totalSpentAmount: extractAmount(client.totalSpent),
    totalValueAmount: extractAmount(client.totalValue),
    pendingAmountValue: extractAmount(client.pendingAmount),
  }));

  // Transform financial data for charts (convert CurrencyAmount objects to numbers)
  const transformedFinancialData = analyticsData?.financial ? {
    paymentStatus: (analyticsData.financial.paymentStatus || []).map((status: any) => ({
      ...status,
      amount: typeof status.amount === 'object' && status.amount !== null ? extractAmount(status.amount) : (status.amount || 0),
    })),
    monthlyTrends: (analyticsData.financial.monthlyTrends || []).map((trend: any) => {
      const transformedTrend = {
        ...trend,
        pending: typeof trend.pending === 'object' && trend.pending !== null ? extractAmount(trend.pending) : (trend.pending || 0),
        approved: typeof trend.approved === 'object' && trend.approved !== null ? extractAmount(trend.approved) : (trend.approved || 0),
        completed: typeof trend.completed === 'object' && trend.completed !== null ? extractAmount(trend.completed) : (trend.completed || 0),
        rejected: typeof trend.rejected === 'object' && trend.rejected !== null ? extractAmount(trend.rejected) : (trend.rejected || 0),
        outstanding: typeof trend.outstanding === 'object' && trend.outstanding !== null ? extractAmount(trend.outstanding) : (trend.outstanding || 0),
      };

      return transformedTrend;
    }),
    paymentMethods: (analyticsData.financial.paymentMethods || []).map((method: any) => ({
      ...method,
      amount: typeof method.amount === 'object' && method.amount !== null ? extractAmount(method.amount) : (method.amount || 0),
    })),
    kpis: analyticsData.financial.kpis ? {
      avgPaymentValue: typeof analyticsData.financial.kpis.avgPaymentValue === 'object' && analyticsData.financial.kpis.avgPaymentValue !== null
        ? extractAmount(analyticsData.financial.kpis.avgPaymentValue) 
        : (analyticsData.financial.kpis.avgPaymentValue || 0),
      successRate: analyticsData.financial.kpis.successRate || 0,
      avgProcessingTime: analyticsData.financial.kpis.avgProcessingTime || 0,
      outstandingAmount: typeof analyticsData.financial.kpis.outstandingAmount === 'object' && analyticsData.financial.kpis.outstandingAmount !== null
        ? extractAmount(analyticsData.financial.kpis.outstandingAmount)
        : (analyticsData.financial.kpis.outstandingAmount || 0),
    } : {
      avgPaymentValue: 0,
      successRate: 0,
      avgProcessingTime: 0,
      outstandingAmount: 0,
    },
  } : {
    paymentStatus: [],
    monthlyTrends: [],
    paymentMethods: [],
    kpis: {
      avgPaymentValue: 0,
      successRate: 0,
      avgProcessingTime: 0,
      outstandingAmount: 0,
    },
  };

  // Note: Backend financial analytics may be returning inflated amounts compared to overview data

  // Get activities from real data or empty array and map icons
  const iconMap = {
    Briefcase: Briefcase,
    Users: Users,
    DollarSign: DollarSign,
    Target: Target,
  };

  const activities: Activity[] = (analyticsData?.activities || []).map(
    (activity) => ({
      ...activity,
      icon: iconMap[activity.icon as keyof typeof iconMap] || Briefcase,
    })
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Analytics Command Center
            </h1>
            <p className="text-gray-300 text-lg">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-xl"
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="3M">Last 3 Months</option>
              <option value="12M">Last 12 Months</option>
            </select>
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="backdrop-blur-xl my-16 bg-white/5 border border-white/10 rounded-2xl p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setAnalyticsTab("overview")}
              className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                analyticsTab === "overview"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span className="monty uppercase text-sm">
                Overview & Projects
              </span>
            </button>
            <button
              onClick={() => setAnalyticsTab("financial")}
              className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                analyticsTab === "financial"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span className="monty uppercase text-sm">
                Financial Analytics
              </span>
            </button>
            <button
              onClick={() => setAnalyticsTab("performance")}
              className={`flex-1 cursor-pointer flex items-center justify-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                analyticsTab === "performance"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Target className="h-4 w-4" />
              <span className="monty uppercase text-sm">
                Performance & Skills
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {analyticsTab === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Users}
                label="Active Users"
                value={formatNumber(safeAnalytics.totalUsers)}
                change="+8.2%"
                trend="up"
                color="blue"
              />
              <MetricCard
                icon={Briefcase}
                label="Total Projects"
                value={formatNumber(safeAnalytics.totalProjects)}
                change="+12.1%"
                trend="up"
                color="purple"
              />
              <MetricCard
                icon={Target}
                label="Success Rate"
                value="94.2%"
                change="+2.1%"
                trend="up"
                color="orange"
              />
              <MetricCard
                icon={DollarSign}
                label="Total Revenue"
                value={formatCurrency(safeAnalytics.totalRevenue)}
                change="+15.3%"
                trend="up"
                color="green"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend - Enhanced */}
              <div className="lg:col-span-2 backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Revenue Analytics
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">Revenue</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartRevenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis
                      stroke="#9CA3AF"
                      tickFormatter={(value: number) => `$${value / 1000}K`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        // Use the original CurrencyAmount for proper formatting
                        const originalRevenue = props.payload?.originalRevenue;
                        return [
                          originalRevenue
                            ? formatCurrency(originalRevenue, true)
                            : formatCurrency(value),
                          "Revenue",
                        ];
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Project Status Distribution */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Project Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {projectStatusData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Analytics Tab */}
        {analyticsTab === "financial" && (
          <div className="space-y-6">
            {/* Payment Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {loadingAnalytics
                ? // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-xl p-4 animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-16 h-3 bg-gray-600 rounded"></div>
                      </div>
                      <div>
                        <div className="w-20 h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="w-24 h-5 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  ))
                : (transformedFinancialData?.paymentStatus || []).map(
                    (status: any, index: number) => (
                      <div
                        key={status.status}
                        className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-xl p-4 hover:bg-black/20 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <span className="text-xs text-gray-400">
                            {status.count} payments
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                            {status.status}
                          </p>
                          <p className="text-lg font-semibold text-white mt-1">
                            {formatCurrency(status.amount)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
            </div>

            {/* Financial Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  {(transformedFinancialData?.paymentMethods || []).length >
                  0 ? (
                    (transformedFinancialData?.paymentMethods || []).map(
                      (method: any, index: number) => (
                        <div
                          key={method.method}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                            <span className="text-gray-300">
                              {method.method}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {formatCurrency(method.amount)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {method.percentage}%
                            </p>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-sm mb-2">
                        No payment methods yet
                      </div>
                      <div className="text-gray-500 text-xs">
                        Payment methods will appear here once payments are
                        recorded
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Revenue</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(
                        (transformedFinancialData?.paymentMethods || []).reduce(
                          (sum: number, method: any) => sum + method.amount,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Payment Trends */}
              <div className="lg:col-span-2 backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Monthly Payment Trends
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#F59E0B" }}
                      ></div>
                      <span className="text-gray-400">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#3B82F6" }}
                      ></div>
                      <span className="text-gray-400">Approved</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#3B82F6" }}
                      ></div>
                      <span className="text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#EF4444" }}
                      ></div>
                      <span className="text-gray-400">Rejected</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#8B5CF6" }}
                      ></div>
                      <span className="text-gray-400">Outstanding</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={transformedFinancialData?.monthlyTrends || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#9CA3AF"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) =>
                        `$${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                      labelFormatter={(month: string) => `Month: ${month}`}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                      }}
                      cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                      formatter={(value: string) => (
                        <span style={{ color: "#9CA3AF" }}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="pending"
                      fill="#F59E0B"
                      radius={[2, 2, 0, 0]}
                      className="cursor-pointer"
                    />
                    <Bar
                      dataKey="approved"
                      fill="#3B82F6"
                      radius={[2, 2, 0, 0]}
                      className="cursor-pointer"
                    />
                    <Bar
                      dataKey="completed"
                      fill="#3B82F6"
                      radius={[2, 2, 0, 0]}
                      className="cursor-pointer"
                    />
                    <Bar
                      dataKey="rejected"
                      fill="#EF4444"
                      radius={[2, 2, 0, 0]}
                      className="cursor-pointer"
                    />
                    <Bar
                      dataKey="outstanding"
                      fill="#8B5CF6"
                      radius={[2, 2, 0, 0]}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Methods & Financial KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Distribution */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Payment Status Distribution
                  </h3>
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={transformedFinancialData?.paymentStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {(transformedFinancialData?.paymentStatus || []).map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Amount",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {(transformedFinancialData?.paymentStatus || []).map(
                    (item: any, index: number) => (
                      <div
                        key={item.status}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-gray-300">{item.status}</span>
                        </div>
                        <span className="text-white font-medium">
                          {item.count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Financial KPIs */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Financial KPIs
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div>
                      <p className="text-green-400 text-sm font-medium">
                        Average Payment Value
                      </p>
                      <p className="text-white text-2xl font-semibold">
                        {formatCurrency(
                          transformedFinancialData?.kpis?.avgPaymentValue || 0
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">
                        Payment Success Rate
                      </p>
                      <p className="text-white text-2xl font-semibold">
                        {Math.round(
                          (transformedFinancialData?.kpis?.successRate || 0) *
                            10
                        ) / 10}
                        %
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">
                        Avg. Processing Time
                      </p>
                      <p className="text-white text-2xl font-semibold">
                        {Math.round(
                          (transformedFinancialData?.kpis?.avgProcessingTime ||
                            0) * 10
                        ) / 10}{" "}
                        days
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Globe className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                    <div>
                      <p className="text-orange-400 text-sm font-medium">
                        Outstanding Payments
                      </p>
                      <p className="text-white text-2xl font-semibold">
                        {formatCurrency(
                          transformedFinancialData?.kpis?.outstandingAmount || 0
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Calendar className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance & Skills Tab */}
        {analyticsTab === "performance" && (
          <div className="space-y-6">
            {/* Performance Metrics Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Performance Metrics
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analyticsData?.performance?.metrics || []}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    />
                    <Radar
                      name="Current"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#10B981"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Skills Demand Chart */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Skills in Demand
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analyticsData?.performance?.skills || []}
                    layout="horizontal"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      stroke="#9CA3AF"
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "demand" ? `${value}%` : value,
                        name === "demand" ? "Demand" : "Developers",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Bar
                      dataKey="demand"
                      fill="#3B82F6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Performers Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Clients */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Top Clients
                  </h3>
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="space-y-4">
                  {transformedTopClients.slice(0, 5).map((client, index) => (
                    <div
                      key={client.id || `client-${index}`}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl hover:from-white/10 transition-all duration-300 border border-white/5"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white">
                            {index + 1}
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star className="h-3 w-3 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {client.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {client.projectCount} projects
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold text-lg">
                          {formatCurrency(client.totalSpent, true)}
                        </p>
                        <p className="text-yellow-400 text-sm">
                          {formatCurrency(client.pendingAmount, true)} pending
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatCurrency(client.totalValue, true)} total value
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Developers */}
              <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Top Developers
                  </h3>
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div className="space-y-4">
                  {(analyticsData?.overview?.topDevelopers || [])
                    .slice(0, 5)
                    .map((developer, index) => (
                      <div
                        key={developer.id || `developer-${index}`}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl hover:from-white/10 transition-all duration-300 border border-white/5"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center font-semibold text-white">
                              {index + 1}
                            </div>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Star className="h-3 w-3 text-yellow-900" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {developer.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {developer.completedProjects} projects completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white font-semibold">
                              {developer.rating}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <AnimatedProgressRing
                              percentage={developer.rating * 20}
                              size={40}
                              strokeWidth={4}
                              color="#FBBF24"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div className="backdrop-blur-xl bg-black/10 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Live Activity Feed
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                    >
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <activity.icon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
