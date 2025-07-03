import React, { useState, useEffect } from "react";
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

// TypeScript interfaces for the analytics data
interface RevenueData {
  month: string;
  revenue: number;
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
  projects: number;
  revenue: number;
}

interface TopDeveloper {
  name: string;
  projects: number;
  rating: number;
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
  totalRevenue: number;
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

// If no data is supplied (e.g. during initial load) we fall back to mock values for a graceful skeleton.
const mockAnalytics: AnalyticsData = {
  totalUsers: 2847,
  totalProjects: 1294,
  totalRevenue: 8945600,
  monthlyGrowth: 15.3,
  projectsByStatus: {
    completed: 847,
    "in-progress": 289,
    pending: 158,
  },
  usersByRole: {
    client: 1520,
    developer: 1189,
    admin: 138,
  },
  revenueByMonth: [
    { month: "Jan", revenue: 645000 },
    { month: "Feb", revenue: 721000 },
    { month: "Mar", revenue: 698000 },
    { month: "Apr", revenue: 812000 },
    { month: "May", revenue: 889000 },
    { month: "Jun", revenue: 934000 },
    { month: "Jul", revenue: 1024000 },
    { month: "Aug", revenue: 967000 },
    { month: "Sep", revenue: 1156000 },
    { month: "Oct", revenue: 1234000 },
    { month: "Nov", revenue: 1345000 },
    { month: "Dec", revenue: 1515000 },
  ],
  topClients: [
    { name: "TechCorp Industries", projects: 45, revenue: 1240000 },
    { name: "Digital Innovations", projects: 38, revenue: 980000 },
    { name: "StartupHub", projects: 32, revenue: 750000 },
    { name: "Enterprise Solutions", projects: 28, revenue: 690000 },
    { name: "Creative Agency", projects: 24, revenue: 580000 },
  ],
  topDevelopers: [
    { name: "Alex Thompson", projects: 67, rating: 4.9 },
    { name: "Sarah Chen", projects: 54, rating: 4.8 },
    { name: "Marcus Rodriguez", projects: 48, rating: 4.7 },
    { name: "Emily Johnson", projects: 42, rating: 4.6 },
    { name: "David Kim", projects: 39, rating: 4.5 },
  ],
};

// Additional mock data for enhanced visualizations
const skillsData: SkillDemand[] = [
  { skill: "React", demand: 95, developers: 234 },
  { skill: "Node.js", demand: 87, developers: 198 },
  { skill: "Python", demand: 82, developers: 176 },
  { skill: "AWS", demand: 78, developers: 145 },
  { skill: "TypeScript", demand: 74, developers: 167 },
  { skill: "Docker", demand: 69, developers: 123 },
];

const performanceMetrics: PerformanceMetric[] = [
  { metric: "Delivery Time", value: 85, target: 90 },
  { metric: "Quality Score", value: 92, target: 95 },
  { metric: "Client Satisfaction", value: 88, target: 85 },
  { metric: "Developer Retention", value: 78, target: 80 },
  { metric: "Project Success Rate", value: 94, target: 90 },
];

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  // Fallback in case the parent hasn’t fetched analytics yet
  const safeAnalytics =
    analytics ?? (mockAnalytics as unknown as EnhancedAnalyticsData);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("12M");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Transform project status data for PieChart
  const projectStatusData: ProjectStatusData[] = Object.entries(
    safeAnalytics.projectsByStatus
  ).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace("-", " "),
    value: count,
  }));

  // Real-time activity data
  const activities: Activity[] = [
    {
      type: "project",
      message:
        'New project "E-commerce Platform" created by TechCorp Industries',
      time: "2 minutes ago",
      icon: Briefcase,
    },
    {
      type: "user",
      message: 'Sarah Chen completed project "Mobile App Development"',
      time: "5 minutes ago",
      icon: Users,
    },
    {
      type: "revenue",
      message: "Payment of $15,000 received from Digital Innovations",
      time: "12 minutes ago",
      icon: DollarSign,
    },
    {
      type: "milestone",
      message: "Monthly revenue target achieved - $1.2M",
      time: "1 hour ago",
      icon: Target,
    },
  ];

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2 b">
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(safeAnalytics.totalRevenue)}
            change="+15.3%"
            trend="up"
            color="green"
          />
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
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend - Enhanced */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
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
              <AreaChart data={safeAnalytics.revenueByMonth}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
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
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value: number) => `$${value / 1000}K`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
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
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
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
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
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
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Skills in Demand
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillsData} layout="horizontal">
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
                <Bar dataKey="demand" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Clients */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Top Clients</h3>
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="space-y-4">
              {safeAnalytics.topClients.slice(0, 5).map((client, index) => (
                <div
                  key={client.name}
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
                      <p className="text-white font-semibold">{client.name}</p>
                      <p className="text-gray-400 text-sm">
                        {client.projects} projects
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold text-lg">
                      {formatCurrency(client.revenue)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatCurrency(client.revenue / client.projects)}/project
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Developers */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Top Developers
              </h3>
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              {safeAnalytics.topDevelopers
                .slice(0, 5)
                .map((developer, index) => (
                  <div
                    key={developer.name}
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
                          {developer.projects} projects completed
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
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
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
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <activity.icon className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
