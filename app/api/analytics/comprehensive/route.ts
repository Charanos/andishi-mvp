
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession, Session } from '@/lib/getSession';
import { Db, Collection } from 'mongodb';

// Type definitions
interface User {
    _id?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;
    lastLogin?: Date;
    isActive?: boolean;
}

interface Project {
    _id?: string;
    title: string;
    status: string;
    clientId?: string;
    assignedDevelopers?: string[];
    budget?: number;
    startDate?: Date;
    endDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface Payment {
    _id?: string;
    projectId?: string;
    amount: number;
    status: string;
    method?: string;
    date?: Date;
    createdAt?: Date;
}

interface DeveloperProfile {
    _id?: string;
    userId?: string;
    skills: string[];
    experience?: string;
    hourlyRate?: number;
    completedProjects?: number;
    rating?: number;
    status?: string;
    createdAt?: Date;
}

interface Activity {
    timestamp: Date;
    description: string;
    type: string;
    userId?: string;
    projectId?: string;
}

interface AnalyticsResponse {
    revenues: number;
    projectStatuses: Record<string, number>;
    userRoles: Record<string, number>;
    topClients: Array<{
        name: string;
        projectCount: number;
        totalSpent: number;
    }>;
    topDevelopers: Array<{
        name: string;
        completedProjects: number;
        rating: number;
        skills: string[];
    }>;
    paymentStatusBreakdown: Record<string, number>;
    monthlyPaymentTrends: Record<string, number[]>;
    performanceMetrics: {
        totalProjects: number;
        completedProjects: number;
        activeUsers: number;
        averageProjectDuration: number;
    };
    skillsDemand: Array<{
        skill: string;
        count: number;
        percentage: number;
    }>;
    activityFeed: Activity[];
}

async function fetchAnalyticsData(db: Db): Promise<AnalyticsResponse> {
    const usersCollection: Collection<User> = db.collection('users');
    const projectsCollection: Collection<Project> = db.collection('projects');
    const paymentsCollection: Collection<Payment> = db.collection('payments');
    const developersCollection: Collection<DeveloperProfile> = db.collection('developerProfiles');

    try {
        // Fetch data concurrently
        const [users, projects, payments, developers] = await Promise.all([
            usersCollection.find({}).toArray(),
            projectsCollection.find({}).toArray(),
            paymentsCollection.find({}).toArray(),
            developersCollection.find({}).toArray()
        ]);

        // Calculate revenues
        const revenues = payments.reduce((sum, payment) =>
            payment.status === 'completed' || payment.status === 'paid' ? sum + (payment.amount || 0) : sum
            , 0);

        // Project statuses
        const projectStatuses = projects.reduce((acc, project) => {
            const status = project.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // User roles
        const userRoles = users.reduce((acc, user) => {
            const role = user.role || 'unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Top clients (by project count and spending)
        const clientSpending = new Map<string, { name: string; projects: number; total: number }>();
        projects.forEach(project => {
            if (project.clientId) {
                const client = users.find(u => u._id === project.clientId);
                const clientName = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email : 'Unknown Client';
                if (!clientSpending.has(project.clientId)) {
                    clientSpending.set(project.clientId, { name: clientName, projects: 0, total: 0 });
                }
                const clientData = clientSpending.get(project.clientId)!;
                clientData.projects += 1;
                const projectPayments = payments.filter(p => p.projectId === project._id);
                clientData.total += projectPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            }
        });

        const topClients = Array.from(clientSpending.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(client => ({
                name: client.name,
                projectCount: client.projects,
                totalSpent: client.total
            }));

        // Top developers
        const topDevelopers = developers
            .map(dev => {
                const user = users.find(u => u._id === dev.userId);
                return {
                    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown Developer',
                    completedProjects: dev.completedProjects || 0,
                    rating: dev.rating || 0,
                    skills: dev.skills || []
                };
            })
            .sort((a, b) => b.completedProjects - a.completedProjects)
            .slice(0, 5);

        // Payment status breakdown
        const paymentStatusBreakdown = payments.reduce((acc, payment) => {
            const status = payment.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Monthly payment trends (last 12 months)
        const monthlyPaymentTrends: Record<string, number[]> = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = month.toISOString().slice(0, 7);
            const monthPayments = payments.filter(p => {
                const paymentDate = p.date || p.createdAt;
                return paymentDate &&
                    paymentDate.getFullYear() === month.getFullYear() &&
                    paymentDate.getMonth() === month.getMonth();
            });
            monthlyPaymentTrends[monthKey] = [
                monthPayments.length,
                monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
            ];
        }

        // Performance metrics
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const activeUsers = users.filter(u => u.isActive !== false).length;
        const completedProjectsWithDates = projects.filter(p =>
            p.status === 'completed' && p.startDate && p.endDate
        );
        const averageProjectDuration = completedProjectsWithDates.length > 0
            ? completedProjectsWithDates.reduce((sum, p) => {
                const duration = p.endDate!.getTime() - p.startDate!.getTime();
                return sum + (duration / (1000 * 60 * 60 * 24)); // Convert to days
            }, 0) / completedProjectsWithDates.length
            : 0;

        const performanceMetrics = {
            totalProjects: projects.length,
            completedProjects,
            activeUsers,
            averageProjectDuration: Math.round(averageProjectDuration)
        };

        // Skills demand
        const skillCounts = new Map<string, number>();
        let totalSkills = 0;
        developers.forEach(dev => {
            dev.skills.forEach(skill => {
                skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
                totalSkills++;
            });
        });

        const skillsDemand = Array.from(skillCounts.entries())
            .map(([skill, count]) => ({
                skill,
                count,
                percentage: Math.round((count / totalSkills) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Activity feed (mock data)
        const activityFeed: Activity[] = [
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
                description: `New project "${projects[0]?.title || 'Unknown Project'}" was created`,
                type: 'project_created'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                description: `Payment of $${payments[0]?.amount || 0} was received`,
                type: 'payment_received'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                description: `New developer profile was approved`,
                type: 'developer_approved'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                description: `Project status updated to completed`,
                type: 'project_completed'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
                description: `New user registered`,
                type: 'user_registered'
            }
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return {
            revenues,
            projectStatuses,
            userRoles,
            topClients,
            topDevelopers,
            paymentStatusBreakdown,
            monthlyPaymentTrends,
            performanceMetrics,
            skillsDemand,
            activityFeed
        };

    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return {
            revenues: 0,
            projectStatuses: { 'active': 0, 'completed': 0, 'pending': 0 },
            userRoles: { 'admin': 0, 'client': 0, 'developer': 0 },
            topClients: [],
            topDevelopers: [],
            paymentStatusBreakdown: { 'pending': 0, 'completed': 0, 'failed': 0 },
            monthlyPaymentTrends: {},
            performanceMetrics: {
                totalProjects: 0,
                completedProjects: 0,
                activeUsers: 0,
                averageProjectDuration: 0
            },
            skillsDemand: [],
            activityFeed: []
        };
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session: Session | null = await getSession(request);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if user has admin role
        if (session.user.role !== 'admin') {
            return new NextResponse('Forbidden - Admin access required', { status: 403 });
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db();

        // Fetch analytics data
        const analyticsData = await fetchAnalyticsData(db);

        return NextResponse.json(analyticsData);

    } catch (error) {
        console.error('Analytics API error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}