import prisma from '@/lib/prisma';
import { getSession, Session } from '@/lib/getSession';
import { NextRequest, NextResponse } from 'next/server';

// Enhanced type definitions
interface UserInfo {
    firstName?: string;
    lastName?: string;
}

interface ProjectDetails {
    title?: string;
    description?: string;
    category?: string;
}

interface Pricing {
    type: 'fixed' | 'hourly' | 'milestone';
    currency: 'USD' | 'KES';
    fixedBudget?: number;
    hourlyRate?: number;
    estimatedHours?: number;
    milestones?: Array<{
        id: string;
        title: string;
        budget: number;
        status: string;
    }>;
}

interface ProjectPayment {
    id: string;
    amount: number;
    date: Date;
    method: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed';
    currency?: string;
    createdAt?: Date;
}

interface DeveloperProfileData {
    personalInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    technicalSkills?: {
        primarySkills?: Array<{ name: string } | string>;
    };
    stats?: {
        completedProjects?: number;
        averageRating?: number;
        totalProjects?: number;
    };
}

interface Activity {
    timestamp: Date;
    description: string;
    type: 'project_created' | 'payment_received' | 'user_registered' | 'developer_approved' | 'project_completed';
    userId?: string;
    projectId?: string;
}

interface AnalyticsOverview {
    totalUsers: number;
    totalProjects: number;
    totalRevenue: number;
    monthlyGrowth: number;
    projectsByStatus: Record<string, number>;
    usersByRole: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
    topClients: Array<{
        name: string;
        projectCount: number;
        totalSpent: number;
        pendingAmount: number;
        totalValue: number;
        id: string;
    }>;
    topDevelopers: Array<{
        name: string;
        completedProjects: number;
        rating: number;
        skills: string[];
        id: string;
    }>;
}

interface AnalyticsFinancial {
    paymentStatus: Array<{
        status: string;
        count: number;
        amount: number;
        color: string;
    }>;
    monthlyTrends: Array<{
        month: string;
        pending: number;
        approved: number;
        completed: number;
        rejected: number;
        outstanding: number;
    }>;
    paymentMethods: Array<{
        method: string;
        amount: number;
        percentage: number;
    }>;
    kpis: {
        avgPaymentValue: number;
        successRate: number;
        avgProcessingTime: number;
        outstandingAmount: number;
    };
}

interface AnalyticsPerformance {
    skills: Array<{
        skill: string;
        demand: number;
        developers: number;
    }>;
    metrics: Array<{
        metric: string;
        value: number;
        target: number;
    }>;
}

interface AnalyticsResponse {
    version: string;
    timestamp: string;
    overview: AnalyticsOverview;
    financial: AnalyticsFinancial;
    performance: AnalyticsPerformance;
    activities: Array<{
        type: string;
        message: string;
        time: string;
        icon: string;
    }>;
}

// Constants
const EXCHANGE_RATES = {
    USD: 1,
    KES: 0.0077, // 130 KES ≈ 1 USD
} as const;

const PAYMENT_STATUS_COLORS = {
    pending: '#F59E0B',
    approved: '#3B82F6',
    completed: '#3B82F6',
    rejected: '#EF4444',
    failed: '#EF4444',
    outstanding: '#8B5CF6',
} as const;

const ACTIVITY_ICONS = {
    project_created: 'Briefcase',
    payment_received: 'DollarSign',
    developer_approved: 'Users',
    project_completed: 'Target',
    user_registered: 'Users',
} as const;

// Utility functions
const toUSD = (amountInput: any, currency: string = 'USD'): number => {
    const amount = Number(amountInput) || 0;
    const currencyCode = (currency || 'USD').toUpperCase() as 'USD' | 'KES';
    const rate = EXCHANGE_RATES[currencyCode] ?? 1;
    return amount * rate;
};

const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
};

const getIconForActivityType = (type: string): string => {
    return ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || 'Briefcase';
};

const isValidObject = (obj: unknown): obj is Record<string, unknown> => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
};

// Data fetching functions
class AnalyticsService {
    private static async fetchBaseData() {
        try {
            const [users, projects, developerProfiles] = await Promise.all([
                prisma.user.findMany({
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                    },
                }),
                prisma.project.findMany({
                    select: {
                        id: true,
                        projectDetails: true,
                        status: true,
                        budget: true,
                        currency: true,
                        pricing: true,
                        payments: true,
                        userInfo: true,
                        clientId: true,
                        createdAt: true,
                        actualCompletionDate: true,
                        estimatedCompletionDate: true,
                    },
                }),
                prisma.developerProfile.findMany({
                    select: {
                        id: true,
                        data: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                }),
            ]);

            return { users, projects, developerProfiles };
        } catch (error) {
            console.error('Error fetching base data:', error);
            throw new Error('Failed to fetch analytics data');
        }
    }

    private static extractPaymentsFromProjects(projects: any[]): ProjectPayment[] {
        const allPayments: ProjectPayment[] = [];

        projects.forEach(project => {
            if (Array.isArray(project.payments)) {
                project.payments.forEach((payment: any) => {
                    allPayments.push({
                        id: payment.id || `${project.id}-${Date.now()}`,
                        amount: Number(payment.amount) || 0,
                        date: new Date(payment.date || payment.createdAt || Date.now()),
                        method: payment.method || 'bank_transfer',
                        status: payment.status || 'pending',
                        currency: payment.currency || 'USD',
                        createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
                    });
                });
            }
        });

        return allPayments;
    }

    private static calculateProjectBudget(project: any): number {
        let budget = 0;
        const pricing = project.pricing as Pricing | null;

        if (pricing && isValidObject(pricing)) {
            const currency = pricing.currency || 'USD';

            switch (pricing.type) {
                case 'fixed':
                    budget = toUSD(pricing.fixedBudget || 0, currency);
                    break;
                case 'hourly':
                    budget = toUSD(
                        (pricing.hourlyRate || 0) * (pricing.estimatedHours || 0),
                        currency
                    );
                    break;
                case 'milestone':
                    budget = pricing.milestones?.reduce(
                        (sum, milestone) => sum + toUSD(milestone.budget || 0, currency),
                        0
                    ) || 0;
                    break;
            }
        }

        // Fallback to legacy budget
        if (budget === 0 && project.budget) {
            budget = toUSD(project.budget, project.currency || 'USD');
        }

        // Default budget for completed projects with no pricing
        if (budget === 0 && project.status === 'completed') {
            budget = 15000;
        }

        return budget;
    }

    private static calculateTotalRevenue(projects: any[], payments: ProjectPayment[]): number {
        // Calculate from actual payments first
        const paymentRevenue = payments
            .filter(p => p.status === 'completed' || p.status === 'approved')
            .reduce((sum, payment) => sum + toUSD(payment.amount, payment.currency as 'USD' | 'KES'), 0);

        // If no payments, calculate from project budgets
        if (paymentRevenue === 0) {
            return projects.reduce((sum, project) => sum + this.calculateProjectBudget(project), 0);
        }

        return paymentRevenue;
    }

    private static calculateClientSpending(projects: any[], users: any[]) {
        const clientMap = new Map<string, {
            name: string;
            projectCount: number;
            totalSpent: number;
            pendingAmount: number;
            id: string;
        }>();

        projects.forEach(project => {
            const userInfo = isValidObject(project.userInfo) ? project.userInfo as UserInfo : {};
            const clientId = project.clientId || 'unknown';

            let clientName = '';
            if (userInfo.firstName || userInfo.lastName) {
                clientName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
            }
            if (!clientName) {
                const client = users.find(u => u.id === clientId);
                if (client) {
                    clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
                }
            }
            if (!clientName) {
                clientName = `Client ${String(clientId).slice(-6)}`;
            }

            if (!clientMap.has(clientId)) {
                clientMap.set(clientId, {
                    name: clientName,
                    projectCount: 0,
                    totalSpent: 0,
                    pendingAmount: 0,
                    id: clientId,
                });
            }

            const clientData = clientMap.get(clientId)!;
            clientData.projectCount += 1;

            // Calculate payments
            if (Array.isArray(project.payments)) {
                const paidTotal = project.payments
                    .filter((p: any) => p.status === 'completed' || p.status === 'approved')
                    .reduce((sum: number, p: any) => sum + toUSD(p.amount || 0, p.currency || 'USD'), 0);

                const pendingTotal = project.payments
                    .filter((p: any) => p.status === 'pending')
                    .reduce((sum: number, p: any) => sum + toUSD(p.amount || 0, p.currency || 'USD'), 0);

                clientData.totalSpent += paidTotal;
                clientData.pendingAmount += pendingTotal;
            } else {
                // Use project budget as fallback
                const budget = this.calculateProjectBudget(project);
                if (project.status === 'completed') {
                    clientData.totalSpent += budget;
                } else {
                    clientData.pendingAmount += budget;
                }
            }
        });

        return Array.from(clientMap.values())
            .map(client => ({
                ...client,
                totalSpent: client.totalSpent + client.pendingAmount, // include pending in displayed spend
                totalValue: client.totalSpent + client.pendingAmount,
            }))
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 5);
    }

    private static calculateTopDevelopers(developerProfiles: any[]) {
        return developerProfiles
            .map((profile, index) => {
                const data = isValidObject(profile.data) ? profile.data as DeveloperProfileData : {};
                const personalInfo = data.personalInfo || {};
                const stats = data.stats || {};
                const technicalSkills = data.technicalSkills || {};

                const name = personalInfo.firstName && personalInfo.lastName
                    ? `${personalInfo.firstName} ${personalInfo.lastName}`
                    : profile.user?.firstName && profile.user?.lastName
                        ? `${profile.user.firstName} ${profile.user.lastName}`
                        : personalInfo.email || profile.user?.email || `Developer ${index + 1}`;

                const skills = Array.isArray(technicalSkills.primarySkills)
                    ? technicalSkills.primarySkills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
                    : [];

                return {
                    name,
                    completedProjects: stats.completedProjects || 0,
                    rating: stats.averageRating || 0,
                    skills,
                    id: profile.id,
                };
            })
            .sort((a, b) => b.completedProjects - a.completedProjects)
            .slice(0, 5);
    }

    private static calculatePaymentStatusBreakdown(payments: ProjectPayment[]) {
        const breakdown: Record<string, { count: number; amount: number }> = {};

        payments.forEach(payment => {
            const status = payment.status;
            if (!breakdown[status]) {
                breakdown[status] = { count: 0, amount: 0 };
            }
            breakdown[status].count += 1;
            breakdown[status].amount += toUSD(payment.amount, payment.currency as 'USD' | 'KES');
        });

        return Object.entries(breakdown).map(([status, data]) => ({
            status,
            count: data.count,
            amount: data.amount,
            color: PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || '#6B7280',
        }));
    }

    private static calculateMonthlyTrends(payments: ProjectPayment[]) {
        const trends: Record<string, {
            pending: number;
            approved: number;
            completed: number;
            rejected: number;
            outstanding: number;
        }> = {};
        const now = new Date();

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = month.toISOString().slice(0, 7);
            trends[monthKey] = {
                pending: 0,
                approved: 0,
                completed: 0,
                rejected: 0,
                outstanding: 0,
            };
        }

        // Populate with actual data
        payments.forEach(payment => {
            const monthKey = payment.date.toISOString().slice(0, 7);
            if (trends[monthKey]) {
                const amount = toUSD(payment.amount, payment.currency as 'USD' | 'KES');
                const status = payment.status === 'failed' ? 'rejected' : payment.status;
                if (status === 'pending' || status === 'approved' || status === 'completed' || status === 'rejected') {
                    trends[monthKey][status] = (trends[monthKey][status] || 0) + amount;
                }
            }
        });

        return Object.entries(trends).map(([month, data]) => ({
            month,
            ...data,
        }));
    }

    private static calculatePaymentMethods(payments: ProjectPayment[]) {
        const methods: Record<string, { count: number; total: number }> = {};

        payments.forEach(payment => {
            const method = payment.method;
            if (!methods[method]) {
                methods[method] = { count: 0, total: 0 };
            }
            methods[method].count += 1;
            methods[method].total += toUSD(payment.amount, payment.currency as 'USD' | 'KES');
        });

        const totalAmount = Object.values(methods).reduce((sum, m) => sum + m.total, 0);

        return Object.entries(methods).map(([method, data]) => ({
            method,
            amount: data.total,
            percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
        }));
    }

    private static calculateKPIs(payments: ProjectPayment[]) {
        const successfulPayments = payments.filter(p => p.status === 'completed' || p.status === 'approved');
        const totalAmount = successfulPayments.reduce((sum, p) => sum + toUSD(p.amount, p.currency as 'USD' | 'KES'), 0);

        const avgProcessingTime = payments.length > 0
            ? payments.reduce((sum, p) => {
                if (p.createdAt) {
                    const processTime = Math.abs(p.date.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    return sum + processTime;
                }
                return sum + 3; // Default 3 days
            }, 0) / payments.length
            : 3;

        const outstandingAmount = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + toUSD(p.amount, p.currency as 'USD' | 'KES'), 0);

        return {
            avgPaymentValue: successfulPayments.length > 0 ? totalAmount / successfulPayments.length : 0,
            successRate: payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0,
            avgProcessingTime,
            outstandingAmount,
        };
    }

    private static calculateSkillsDemand(developerProfiles: any[]) {
        const skillCounts = new Map<string, number>();

        developerProfiles.forEach(profile => {
            const data = isValidObject(profile.data) ? profile.data as DeveloperProfileData : {};
            const skills = data.technicalSkills?.primarySkills || [];

            skills.forEach(skill => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                if (skillName) {
                    skillCounts.set(skillName, (skillCounts.get(skillName) || 0) + 1);
                }
            });
        });

        return Array.from(skillCounts.entries())
            .map(([skill, count]) => ({
                skill,
                demand: Math.round((count / Math.max(developerProfiles.length, 1)) * 100),
                developers: count,
            }))
            .sort((a, b) => b.developers - a.developers)
            .slice(0, 10);
    }

    private static calculatePerformanceMetrics(projects: any[], developerProfiles: any[]) {
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const totalProjects = projects.length;
        const activeDevelopers = developerProfiles.filter(p => {
            const data = isValidObject(p.data) ? p.data as DeveloperProfileData : {};
            return (data.stats?.completedProjects || 0) > 0;
        }).length;

        const onTimeProjects = projects.filter(p => {
            if (p.status === 'completed' && p.actualCompletionDate && p.estimatedCompletionDate) {
                return new Date(p.actualCompletionDate) <= new Date(p.estimatedCompletionDate);
            }
            return false;
        }).length;

        return [
            {
                metric: 'Project Completion',
                value: Math.round((completedProjects / Math.max(totalProjects, 1)) * 100),
                target: 90,
            },
            {
                metric: 'Developer Utilization',
                value: Math.round((activeDevelopers / Math.max(developerProfiles.length, 1)) * 100),
                target: 85,
            },
            {
                metric: 'On-Time Delivery',
                value: Math.round((onTimeProjects / Math.max(completedProjects, 1)) * 100),
                target: 80,
            },
        ];
    }

    private static generateActivityFeed(projects: any[], payments: ProjectPayment[], users: any[]) {
        const activities: Activity[] = [];

        // Recent projects
        projects
            .filter(p => p.createdAt)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .forEach(project => {
                const projectDetails = isValidObject(project.projectDetails) ? project.projectDetails as ProjectDetails : {};
                activities.push({
                    timestamp: new Date(project.createdAt),
                    description: `New project "${projectDetails.title || 'Untitled Project'}" was created`,
                    type: 'project_created',
                    projectId: project.id,
                });
            });

        // Recent payments
        payments
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 2)
            .forEach(payment => {
                activities.push({
                    timestamp: payment.date,
                    description: `Payment of $${payment.amount.toFixed(2)} was received`,
                    type: 'payment_received',
                });
            });

        // Recent users
        users
            .filter(u => u.createdAt)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 2)
            .forEach(user => {
                activities.push({
                    timestamp: new Date(user.createdAt),
                    description: `New ${user.role} "${user.firstName || user.email}" registered`,
                    type: 'user_registered',
                    userId: user.id,
                });
            });

        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 8)
            .map(activity => ({
                type: activity.type,
                message: activity.description,
                time: getTimeAgo(activity.timestamp),
                icon: getIconForActivityType(activity.type),
            }));
    }

    static async fetchAnalyticsData(): Promise<AnalyticsResponse> {
        try {
            const { users, projects, developerProfiles } = await this.fetchBaseData();
            const payments = this.extractPaymentsFromProjects(projects);

            // Calculate all metrics
            const totalRevenue = this.calculateTotalRevenue(projects, payments);
            const topClients = this.calculateClientSpending(projects, users);
            const topDevelopers = this.calculateTopDevelopers(developerProfiles);
            const paymentStatusData = this.calculatePaymentStatusBreakdown(payments);
            const monthlyTrends = this.calculateMonthlyTrends(payments);
            const paymentMethods = this.calculatePaymentMethods(payments);
            const kpis = this.calculateKPIs(payments);
            const skillsDemand = this.calculateSkillsDemand(developerProfiles);
            const performanceMetrics = this.calculatePerformanceMetrics(projects, developerProfiles);
            const activities = this.generateActivityFeed(projects, payments, users);

            // Calculate project and user breakdowns
            const projectsByStatus = projects.reduce((acc: Record<string, number>, project: any) => {
                const status = project.status || 'pending';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const usersByRole = users.reduce((acc: Record<string, number>, user: any) => {
                const role = user.role || 'client';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Calculate monthly revenue trends
            const revenueByMonth = monthlyTrends.map(trend => ({
                month: trend.month,
                revenue: (trend.completed || 0) + (trend.approved || 0),
            }));

            // Calculate monthly growth
            const currentMonth = revenueByMonth[revenueByMonth.length - 1]?.revenue || 0;
            const previousMonth = revenueByMonth[revenueByMonth.length - 2]?.revenue || 0;
            const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

            return {
                version: '3.0.0',
                timestamp: new Date().toISOString(),
                overview: {
                    totalUsers: users.length,
                    totalProjects: projects.length,
                    totalRevenue,
                    monthlyGrowth,
                    projectsByStatus,
                    usersByRole,
                    revenueByMonth,
                    topClients,
                    topDevelopers,
                },
                financial: {
                    paymentStatus: paymentStatusData,
                    monthlyTrends,
                    paymentMethods,
                    kpis,
                },
                performance: {
                    skills: skillsDemand,
                    metrics: performanceMetrics,
                },
                activities,
            };
        } catch (error) {
            console.error('Error in fetchAnalyticsData:', error);
            throw error;
        }
    }
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate and authorize
        const session: Session | null = await getSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Fetch analytics data
        const analyticsData = await AnalyticsService.fetchAnalyticsData();

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error('Analytics API error:', error);

        // Return appropriate error response
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}