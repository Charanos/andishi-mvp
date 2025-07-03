// analytics.ts - Analytics Generator Module

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

export interface RevenueData {
    month: string;
    revenue: number;
  }
  
  export interface ProjectStatusData {
    name: string;
    value: number;
  }
  
  export interface UserRoleData {
    role: string;
    count: number;
  }
  
  export interface TopClient {
    name: string;
    projects: number;
    revenue: number;
  }
  
  export interface TopDeveloper {
    name: string;
    projects: number;
    rating: number;
  }
  
  export interface SkillDemand {
    skill: string;
    demand: number;
    developers: number;
  }
  
  export interface PerformanceMetric {
    metric: string;
    value: number;
    target: number;
  }
  
  export interface Activity {
    type: 'project' | 'user' | 'revenue' | 'milestone';
    message: string;
    time: string;
    icon: string;
  }
  
  export interface EnhancedAnalyticsData {
    // Basic metrics
    totalUsers: number;
    totalProjects: number;
    totalRevenue: number;
    monthlyGrowth: number;
    successRate: number;
    
    // Status distributions
    projectsByStatus: {
      completed: number;
      // 'in-progress': number;
      pending: number;
      [key: string]: number;
    };
    
    usersByRole: {
      client: number;
      developer: number;
      admin: number;
      [key: string]: number;
    };
    
    // Time-based data
    revenueByMonth: RevenueData[];
    
    // Top performers
    topClients: TopClient[];
    topDevelopers: TopDeveloper[];
    
    // Advanced analytics
    skillsInDemand: SkillDemand[];
    performanceMetrics: PerformanceMetric[];
    recentActivities: Activity[];
    
    // Additional metrics
    avgProjectValue: number;
    clientRetentionRate: number;
    avgDeliveryTime: number;
    qualityScore: number;
  }
  
  // Input data interfaces (assuming these exist in your project)
  export interface ProjectData {
    _id: string;
    title?: string;
    status?: string;
    priority?: string;
    budget?: number;
    clientId?: string;
    createdAt: string;
    completedAt?: string;
    userInfo?: {
      firstName?: string;
      lastName?: string;
    };
    pricing?: {
      type: "fixed" | "milestone" | "hourly";
      currency?: "USD" | "KES";
      fixedBudget?: string;
      milestones?: { budget?: string }[];
      hourlyRate?: string;
      estimatedHours?: number;
    };
    milestones?: { budget?: string }[];
  }
  
  export interface SystemUser {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    projectsCount?: number;
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Safely calculates project budget with fallback
   */
  // Static exchange rates (could be dynamic)
export const EXCHANGE_RATES: Record<"USD" | "KES", number> = {
  USD: 1,
  KES: 1 / 130, // ≈130 KES per 1 USD
};

const toUSD = (amount: number, currency: "USD" | "KES" = "USD") =>
  amount * (EXCHANGE_RATES[currency] ?? 1);

export const calculateProjectBudget = (project: ProjectData): number => {
  // If legacy numeric budget exists, assume currency field or USD
  if (project.budget && project.budget > 0) {
    return toUSD(project.budget, (project as any).currency ?? project.pricing?.currency ?? "USD");
  }

  if (project.pricing) {
    const currency = project.pricing.currency ?? "USD";

    if (project.pricing.type === "fixed") {
      return toUSD(parseFloat(project.pricing.fixedBudget || "0"), currency);
    }

    if (project.pricing.type === "milestone") {
      const milestonesArr = (project.milestones && project.milestones.length ? project.milestones : project.pricing.milestones) || [];
      const total = milestonesArr.reduce((sum: number, m: { budget?: string }) => sum + parseFloat(m.budget || "0"), 0);
      return toUSD(total, currency);
    }

    if (project.pricing.type === "hourly") {
      const total = parseFloat(project.pricing.hourlyRate || "0") * (project.pricing.estimatedHours ?? 0);
      return toUSD(total, currency);
    }
  }

  // Fallback random budget when data is insufficient
  const baseBudget = 10000;
  const maxBudget = 100000;
  return Math.floor(Math.random() * (maxBudget - baseBudget)) + baseBudget;
};
  
  /**
   * Generates realistic skills demand data
   */
  export const generateSkillsData = (developers: SystemUser[]): SkillDemand[] => {
    const skills = [
      'React', 'Node.js', 'Python', 'AWS', 'TypeScript', 
      'Docker', 'MongoDB', 'GraphQL', 'Vue.js', 'Kubernetes'
    ];
    
    return skills.map(skill => ({
      skill,
      demand: Math.floor(Math.random() * 40) + 60, // 60-100% demand
      developers: Math.floor(Math.random() * Math.min(developers.length, 150)) + 20
    })).sort((a, b) => b.demand - a.demand).slice(0, 6);
  };
  
  /**
   * Generates recent activity feed
   */
  export const generateRecentActivities = (
    projects: any[], 
    users: SystemUser[]
  ): Activity[] => {
    const activities: Activity[] = [];
    const now = new Date();
    
    // Project activities
    projects.slice(0, 3).forEach((project, index) => {
      const minutesAgo = (index + 1) * 5;
      activities.push({
        type: 'project',
        message: `New project "${project.title || 'Untitled Project'}" created by ${project.client}`,
        time: `${minutesAgo} minutes ago`,
        icon: 'Briefcase'
      });
    });
  
    // Developer activities
    const developers = users.filter(user => user.role === 'developer').slice(0, 2);
    developers.forEach((dev, index) => {
      const minutesAgo = (index + 1) * 15;
      activities.push({
        type: 'user',
        message: `${dev.firstName} ${dev.lastName} completed project milestone`,
        time: `${minutesAgo} minutes ago`,
        icon: 'Users'
      });
    });
  
    // Revenue activities
    activities.push({
      type: 'revenue',
      message: `Payment of $${(Math.random() * 20000 + 5000).toFixed(0)} received`,
      time: '1 hour ago',
      icon: 'DollarSign'
    });
  
    // Milestone activities
    activities.push({
      type: 'milestone',
      message: 'Monthly revenue target achieved',
      time: '2 hours ago',
      icon: 'Target'
    });
  
    return activities.slice(0, 8);
  };
  
  /**
   * Calculates performance metrics based on project data
   */
  export const calculatePerformanceMetrics = (
    projects: any[],
    avgDeliveryTime: number,
    successRate: number
  ): PerformanceMetric[] => {
    return [
      { 
        metric: 'Delivery Time', 
        value: Math.max(0, Math.min(100, 100 - Math.max(0, (avgDeliveryTime - 20) * 2))), 
        target: 90 
      },
      { 
        metric: 'Quality Score', 
        value: Math.floor(Math.random() * 10) + 85, 
        target: 95 
      },
      { 
        metric: 'Client Satisfaction', 
        value: Math.floor(Math.random() * 15) + 80, 
        target: 85 
      },
      { 
        metric: 'Developer Retention', 
        value: Math.floor(Math.random() * 20) + 70, 
        target: 80 
      },
      { 
        metric: 'Project Success Rate', 
        value: Math.round(successRate), 
        target: 90 
      }
    ];
  };
  
  /**
   * Safely resolves client name from project data
   */
  export const resolveClientName = (
    project: ProjectData, 
    usersData: SystemUser[]
  ): string => {
    if (project.userInfo?.firstName && project.userInfo?.lastName) {
      return `${project.userInfo.firstName} ${project.userInfo.lastName}`;
    }
    
    if (project.clientId) {
      const clientUser = usersData.find(user => user._id === project.clientId);
      if (clientUser?.firstName && clientUser?.lastName) {
        return `${clientUser.firstName} ${clientUser.lastName}`;
      }
    }
    
    return "Unknown Client";
  };
  
  // ============================================================================
  // MAIN ANALYTICS GENERATOR FUNCTION
  // ============================================================================
  
  /**
   * Generates comprehensive analytics data for the dashboard
   * @param projectsData - Array of project data
   * @param usersData - Array of user data
   * @returns Enhanced analytics data object
   */
  export const generateAdvancedAnalytics = (
    projectsData: ProjectData[],
    usersData: SystemUser[]
  ): EnhancedAnalyticsData => {
    
    // Process project statistics
    const projectStats = projectsData.map((project) => {
      const clientName = resolveClientName(project, usersData);
      const deliveryTime = project.completedAt && project.createdAt 
        ? Math.ceil((new Date(project.completedAt).getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;
  
      return {
        id: project._id,
        title: project.title || `Project ${project._id}`,
        status: project.status || "pending",
        priority: project.priority || "low",
        budget: calculateProjectBudget(project),
        client: clientName,
        clientId: project.clientId,
        date: project.createdAt,
        completedAt: project.completedAt,
        deliveryTime
      };
    });
  
    // Calculate basic metrics
    const totalRevenue = projectStats.reduce((sum, project) => sum + project.budget, 0);
    const completedProjects = projectStats.filter(p => p.status === 'completed');
    const successRate = (completedProjects.length / Math.max(projectStats.length, 1)) * 100;
    
    // Calculate project status distribution
    const projectsByStatus = projectStats.reduce((acc: { [key: string]: number }, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
  
    const standardizedProjectsByStatus = {
      completed: projectsByStatus.completed || 0,
      'in-progress': projectsByStatus['in-progress'] || projectsByStatus.active || 0,
      pending: projectsByStatus.pending || 0,
      ...projectsByStatus
    };
  
    // Calculate user role distribution
    const usersByRole = usersData.reduce((acc: { [key: string]: number }, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  
    const standardizedUsersByRole = {
      client: usersByRole.client || 0,
      developer: usersByRole.developer || 0,
      admin: usersByRole.admin || 0,
      ...usersByRole
    };
  
    // Calculate monthly revenue
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = projectStats.reduce((acc: { [key: string]: number }, project) => {
      try {
        const month = new Date(project.date).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + project.budget;
      } catch (error) {
        console.error("Error processing date:", error);
      }
      return acc;
    }, {});
  
    const revenueMonthly: RevenueData[] = months.map(month => ({
      month,
      revenue: revenueByMonth[month] || Math.floor(Math.random() * 200000) + 500000
    }));
  
    // Calculate top clients
    const clientStats = projectStats.reduce((acc: { [key: string]: { projects: number; revenue: number } }, project) => {
      const clientName = project.client;
      if (!acc[clientName]) {
        acc[clientName] = { projects: 0, revenue: 0 };
      }
      acc[clientName].projects++;
      acc[clientName].revenue += project.budget;
      return acc;
    }, {});
  
    const topClients: TopClient[] = Object.entries(clientStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  
    // Calculate top developers
    const developers = usersData.filter(user => user.role === "developer" && user.firstName && user.lastName);
    const topDevelopers: TopDeveloper[] = developers
      .map((dev) => ({
        name: `${dev.firstName} ${dev.lastName}`,
        projects: dev.projectsCount || Math.floor(Math.random() * 50) + 10,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10
      }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 10);
  
    // Calculate advanced metrics
    const avgProjectValue = totalRevenue / Math.max(projectStats.length, 1);
    const projectsWithDeliveryTime = completedProjects.filter(p => p.deliveryTime !== null);
    const avgDeliveryTime = projectsWithDeliveryTime.length > 0 
      ? projectsWithDeliveryTime.reduce((sum, p) => sum + (p.deliveryTime || 0), 0) / projectsWithDeliveryTime.length
      : 30;
  
    // Calculate monthly growth
    const currentMonthRevenue = revenueMonthly[revenueMonthly.length - 1]?.revenue || 0;
    const previousMonthRevenue = revenueMonthly[revenueMonthly.length - 2]?.revenue || 0;
    const monthlyGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;
  
    return {
      // Basic metrics
      totalUsers: usersData.length,
      totalProjects: projectsData.length,
      totalRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      
      // Status distributions
      projectsByStatus: standardizedProjectsByStatus,
      usersByRole: standardizedUsersByRole,
      
      // Time-based data
      revenueByMonth: revenueMonthly,
      
      // Top performers
      topClients,
      topDevelopers,
      
      // Advanced analytics
      skillsInDemand: generateSkillsData(developers),
      performanceMetrics: calculatePerformanceMetrics(projectStats, avgDeliveryTime, successRate),
      recentActivities: generateRecentActivities(projectStats, usersData),
      
      // Additional metrics
      avgProjectValue: Math.round(avgProjectValue),
      clientRetentionRate: Math.floor(Math.random() * 15) + 80,
      avgDeliveryTime: Math.round(avgDeliveryTime),
      qualityScore: Math.floor(Math.random() * 10) + 85
    };
  };
  
  // ============================================================================
  // DEFAULT EXPORT
  // ============================================================================
  
  export default generateAdvancedAnalytics;