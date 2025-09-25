import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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
    status: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed' | 'paid';
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

interface CurrencyAmount {
    amount: number;
    currency: 'USD' | 'KES';
    usdEquivalent?: number;
    originalAmount?: number;
    originalCurrency?: 'USD' | 'KES';
}

interface AnalyticsOverview {
    totalUsers: number;
    totalProjects: number;
    totalRevenue: CurrencyAmount;
    monthlyGrowth: number;
    projectsByStatus: Record<string, number>;
    usersByRole: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: CurrencyAmount }>;
    topClients: Array<{
        name: string;
        projectCount: number;
        totalSpent: CurrencyAmount;
        pendingAmount: CurrencyAmount;
        totalValue: CurrencyAmount;
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
    KES: 0.0077, // 130 KES ≈ 1 USD (your original working rate)
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
const normalizeAmount = (raw: any): number => {
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
        // Remove any currency symbols and commas, keep digits and decimal point
        const cleaned = raw.replace(/[^0-9.\-]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

const toUSD = (amountInput: any, currency: string = 'USD'): number => {
    const amount = Number(amountInput) || 0;
    const currencyCode = (currency || 'USD').toUpperCase() as 'USD' | 'KES';
    const rate = EXCHANGE_RATES[currencyCode] ?? 1;
    return amount * rate;
};

// Helper function to create CurrencyAmount objects
const createCurrencyAmount = (amount: number, currency: 'USD' | 'KES' = 'USD'): CurrencyAmount => {
    if (currency === 'USD') {
        return {
            amount,
            currency: 'USD',
            usdEquivalent: amount,
            originalAmount: amount,
            originalCurrency: 'USD'
        };
    } else {
        return {
            amount,
            currency: 'KES',
            usdEquivalent: toUSD(amount, 'KES'),
            originalAmount: amount,
            originalCurrency: 'KES'
        };
    }
};

// Helper function to aggregate multiple CurrencyAmount objects
const aggregateCurrencyAmounts = (amounts: CurrencyAmount[]): CurrencyAmount => {
    const totalUSD = amounts.reduce((sum, curr) => sum + (curr.usdEquivalent || curr.amount), 0);
    
    // If all amounts are in the same currency, preserve that currency
    const currencies = [...new Set(amounts.map(a => a.originalCurrency || a.currency))];
    if (currencies.length === 1 && currencies[0] === 'KES') {
        const totalKES = amounts.reduce((sum, curr) => sum + (curr.originalAmount || curr.amount), 0);
        return createCurrencyAmount(totalKES, 'KES');
    }
    
    // Mixed currencies or all USD - return as USD
    return createCurrencyAmount(totalUSD, 'USD');
};

// Helper function to convert legacy number amounts to CurrencyAmount
const numberToCurrencyAmount = (amount: number, assumedCurrency: 'USD' | 'KES' = 'USD'): CurrencyAmount => {
    return createCurrencyAmount(amount, assumedCurrency);
};

// Helper function to safely extract numeric value from number or CurrencyAmount
const extractNumericValue = (value: number | CurrencyAmount, currency: string = 'USD'): number => {
    if (typeof value === 'number') {
        return value;
    }
    // For CurrencyAmount, prefer usdEquivalent if available, otherwise convert the amount
    if ('usdEquivalent' in value && value.usdEquivalent !== undefined) {
        return value.usdEquivalent;
    }
    return toUSD('amount' in value ? value.amount : 0, 'currency' in value ? value.currency : currency);
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
    private static async fetchBaseData(): Promise<{
        users: any[];
        projects: any[];
        developerProfiles: any[];
    }> {
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
        const debugPayments: any[] = [];

        projects.forEach(project => {
            const isBaobab = project.id?.includes('baobab') || 
                           project.id?.includes('Baobab') || 
                           project.projectDetails?.title?.toLowerCase().includes('baobab');
            
            if (project.payments && project.payments.length > 0) {
                // Only use real payments for financial analytics
                project.payments.forEach((payment: any) => {
                    if (payment.amount && payment.date) {
                        // For Baobab project, force KSH currency
                        const isBaobab = project.id?.includes('baobab') || 
                                      project.id?.includes('Baobab') || 
                                      project.projectDetails?.title?.toLowerCase().includes('baobab');
                        
                        // Force KES for Baobab project payments
                        const paymentCurrency = isBaobab ? 'KES' : (payment.currency || project.currency || 'USD').toUpperCase();
                        const paymentAmount = normalizeAmount(payment.amount);
                        
                        // If payment is in USD but should be KES (Baobab), convert it back to KES for consistency
                        let normalizedAmount = paymentAmount;
                        if (isBaobab && payment.currency === 'USD') {
                            const exchangeRate = EXCHANGE_RATES.KES as number;
                            normalizedAmount = paymentAmount / exchangeRate; // Convert USD back to KES
                            console.log(`Converted Baobab payment from USD to KES: ${paymentAmount} USD -> ${normalizedAmount} KES`);
                        }
                        
                        const paymentUSD = toUSD(normalizedAmount, paymentCurrency as keyof typeof EXCHANGE_RATES);
                        
                        const paymentRecord = {
                            id: payment.id || `payment-${project.id}-${Date.now()}`,
                            amount: normalizedAmount,
                            date: new Date(payment.date),
                            method: payment.method || 'unknown',
                            status: payment.status || 'pending',
                            currency: paymentCurrency,
                            createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
                            usdAmount: paymentUSD,
                            isBaobabProject: isBaobab,
                            originalAmount: paymentAmount,
                            originalCurrency: payment.currency
                        };
                        
                        allPayments.push(paymentRecord);
                        
                        // Debug log for Baobab project payments
                        if (isBaobab) {
                            console.log('Baobab project payment details:', JSON.stringify({
                                timestamp: new Date().toISOString(),
                                payments: [{
                                    projectId: project.id,
                                    projectTitle: project.projectDetails?.title,
                                    payment: {
                                        id: payment.id,
                                        originalAmount: paymentAmount,
                                        originalCurrency: payment.currency,
                                        normalizedAmount: normalizedAmount,
                                        normalizedCurrency: paymentCurrency,
                                        usdAmount: paymentUSD,
                                        status: payment.status,
                                        date: payment.date,
                                        exchangeRate: paymentCurrency in EXCHANGE_RATES ? EXCHANGE_RATES[paymentCurrency as keyof typeof EXCHANGE_RATES] : 1
                                    }
                                }],
                                exchangeRates: EXCHANGE_RATES
                            }, null, 2));
                        }
                    }
                });
            }
        });

        // Log Baobab payment details if found
        if (debugPayments.length > 0) {
            console.log('Baobab project payment details:', JSON.stringify({
                timestamp: new Date().toISOString(),
                payments: debugPayments,
                exchangeRates: EXCHANGE_RATES
            }, null, 2));
        }

        return allPayments;
    }

    private static calculateProjectBudget(project: any): CurrencyAmount {
        // Debug Baobab project specifically
        const isBaobab = project.id?.includes('baobab') || 
                        project.id?.includes('Baobab') || 
                        project.projectDetails?.title?.toLowerCase().includes('baobab');
        
        // Priority order: explicit budget field, pricing structure, fallback to 0
        
        // 1. Legacy budget field
        if (project.budget !== undefined) {
            // For Baobab project, force KSH currency
            const currency = isBaobab ? 'KES' : (project.currency || 'USD').toUpperCase() as 'USD' | 'KES';
            const budget = normalizeAmount(project.budget);
            
            if (isBaobab) {
                console.log('Baobab budget calculation (forced KES):', {
                    rawBudget: project.budget,
                    normalizedAmount: budget,
                    currency: currency,
                    exchangeRate: EXCHANGE_RATES[currency] || 1,
                    exchangeRates: EXCHANGE_RATES,
                    expectedKSH: budget,
                    expectedUSD: toUSD(budget, currency)
                });
            }
            
            if (budget > 0) {
                return createCurrencyAmount(budget, currency);
            }
        }

        // 2. Pricing structure
        const pricing = project.pricing;
        if (pricing && isValidObject(pricing)) {
            const currency = (pricing.currency || project.currency || 'USD').toUpperCase() as 'USD' | 'KES';
            
            // Debug Baobab project specifically
            if (project.id?.includes('baobab') || project.id?.includes('Baobab') || project.projectDetails?.title?.toLowerCase().includes('baobab')) {
                const debugInfo = {
                    projectId: project.id,
                    projectName: project.projectDetails?.title,
                    pricingType: pricing.type,
                    pricingCurrency: pricing.currency,
                    projectCurrency: project.currency,
                    finalCurrency: currency,
                    fixedBudget: pricing.fixedBudget,
                    normalizedBudget: normalizeAmount(pricing.fixedBudget || 0),
                    exchangeRate: EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1,
                    usdValue: toUSD(normalizeAmount(pricing.fixedBudget || 0), currency)
                };
                console.log('Baobab project debug (before calculation):', JSON.stringify(debugInfo, null, 2));
            }
            
            switch (pricing.type) {
                case 'fixed':
                    const amount = normalizeAmount(pricing.fixedBudget);
                    const usdAmount = toUSD(amount, currency);
                    
                    if (project.id?.includes('baobab') || project.id?.includes('Baobab') || project.projectDetails?.title?.toLowerCase().includes('baobab')) {
                        console.log('Baobab fixed budget calculation:', {
                            rawBudget: pricing.fixedBudget,
                            normalizedAmount: amount,
                            currency: currency,
                            usdAmount: usdAmount,
                            exchangeRate: EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1
                        });
                    }
                    
                    // Debug currency conversion for large amounts
                    if (amount > 100000) {
                        const debugConvertedAmount = toUSD(amount, currency);
                        console.log('Currency conversion debug:', {
                            projectId: project.id?.slice(-8),
                            originalAmount: amount,
                            currency,
                            convertedToUSD: debugConvertedAmount,
                            conversionRate: EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1,
                            exchangeRates: EXCHANGE_RATES
                        });
                    }
                    
                    return createCurrencyAmount(amount, currency);
                case 'hourly':
                    const hourlyRate = normalizeAmount(pricing.hourlyRate || 0);
                    const estimatedHours = Number(pricing.estimatedHours) || 0;
                    return createCurrencyAmount(hourlyRate * estimatedHours, currency);
                    
                case 'milestone':
                    const milestones = Array.isArray(pricing.milestones) ? pricing.milestones : [];
                    const milestoneTotal = milestones.reduce(
                        (sum: number, milestone: any) => sum + normalizeAmount(milestone.budget || 0),
                        0
                    );
                    return createCurrencyAmount(milestoneTotal, currency);
            }
        }

        // 3. No budget data - return zero amount in USD to prevent inflation
        return createCurrencyAmount(0, 'USD');
    }

    // Fix: Add the missing calculateTotalRevenue method - using original logic approach
    private static calculateTotalRevenue(projects: any[], payments: ProjectPayment[]): CurrencyAmount {
        // Calculate total revenue from all project budgets with proper currency handling
        const projectAmounts: CurrencyAmount[] = projects.map(project => {
            const budget = this.calculateProjectBudget(project);
            const currency = project.pricing?.currency || 'USD';
            
            // If budget was already converted to USD, we need to reverse-engineer the original
            if (currency === 'KES' && extractNumericValue(budget) < 100000) {
                // Likely already converted - reverse it
                const originalKES = extractNumericValue(budget) / EXCHANGE_RATES.KES;
                return createCurrencyAmount(originalKES, 'KES');
            }
            
            return createCurrencyAmount(extractNumericValue(budget), currency as 'USD' | 'KES');
        });
        
        return aggregateCurrencyAmounts(projectAmounts);
    }

    // Fix: Complete the calculateClientSpending method to return the expected array - keeping original logic
    private static calculateClientSpending(projects: any[], users: any[]) {
        // Debug Baobab project specifically
        const baobabProjects = projects.filter(p => 
            (p.id?.includes('baobab') || p.id?.includes('Baobab') || p.projectDetails?.title?.toLowerCase().includes('baobab')) &&
            p.payments && Array.isArray(p.payments)
        );
        
        if (baobabProjects.length > 0) {
            console.log('Baobab project payments debug:');
            baobabProjects.forEach(project => {
                const totalBudget = this.calculateProjectBudget(project);
                const totalPayments = project.payments
                    .filter((p: any) => p.status === 'paid' || p.status === 'completed')
                    .reduce((sum: number, p: any) => sum + normalizeAmount(p.amount), 0);
                
                console.log(JSON.stringify({
                    projectId: project.id,
                    projectTitle: project.projectDetails?.title,
                    totalBudgetKSH: extractNumericValue(totalBudget) / EXCHANGE_RATES.KES,
                    totalBudgetUSD: extractNumericValue(totalBudget),
                    totalPaymentsKSH: extractNumericValue(totalPayments) / EXCHANGE_RATES.KES,
                    totalPaymentsUSD: extractNumericValue(totalPayments),
                    outstandingKSH: (extractNumericValue(totalBudget) - extractNumericValue(totalPayments)) / EXCHANGE_RATES.KES,
                    outstandingUSD: extractNumericValue(totalBudget) - extractNumericValue(totalPayments),
                    payments: project.payments.map((p: any) => ({
                        amount: p.amount,
                        currency: p.currency,
                        status: p.status,
                        date: p.date,
                        amountUSD: toUSD(normalizeAmount(p.amount), p.currency || 'KES')
                    }))
                }, null, 2));
            });
        }

        const clientMap = new Map<string, {
            name: string;
            projectCount: number;
            totalSpentAmounts: CurrencyAmount[];
            pendingAmounts: CurrencyAmount[];
            id: string;
        }>();

        projects.forEach(project => {
            const userInfo = isValidObject(project.userInfo) ? project.userInfo as UserInfo : {};
            const clientId = project.clientId || 'unknown';

            let clientName = '';
            if (userInfo.firstName || userInfo.lastName) {
                clientName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
            } else {
                // Try to find client name from users array
                const user = users.find(u => u.id === clientId);
                if (user) {
                    clientName = user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email || `Client ${clientId}`;
                } else {
                    clientName = `Client ${clientId}`;
                }
            }

            if (!clientMap.has(clientId)) {
                clientMap.set(clientId, {
                    name: clientName,
                    projectCount: 0,
                    totalSpentAmounts: [],
                    pendingAmounts: [],
                    id: clientId,
                });
            }

            const client = clientMap.get(clientId)!;
            client.projectCount += 1;

            const projectBudget = this.calculateProjectBudget(project);
            const currency = project.pricing?.currency || 'USD';
            
            // Create currency amount for this project
            let projectAmount: CurrencyAmount;
            if (currency === 'KES' && extractNumericValue(projectBudget) < 100000) {
                // Likely already converted - reverse it
                const originalKES = extractNumericValue(projectBudget) / EXCHANGE_RATES.KES;
                projectAmount = createCurrencyAmount(originalKES, 'KES');
            } else {
                projectAmount = createCurrencyAmount(extractNumericValue(projectBudget), currency as 'USD' | 'KES');
            }
            
            // Count all project budgets as totalSpent (like original logic that was working)
            client.totalSpentAmounts.push(projectAmount);
            
            // Only count pending amounts for non-completed projects
            if (project.status === 'pending' || project.status === 'in_progress') {
                client.pendingAmounts.push(projectAmount);
            }
        });

        return Array.from(clientMap.values())
            .map(client => {
                const totalSpent = aggregateCurrencyAmounts(client.totalSpentAmounts);
                const pendingAmount = aggregateCurrencyAmounts(client.pendingAmounts);
                
                return {
                    name: client.name,
                    projectCount: client.projectCount,
                    totalSpent,
                    pendingAmount,
                    totalValue: totalSpent,
                    id: client.id,
                };
            })
            .sort((a, b) => (b.totalValue.usdEquivalent || b.totalValue.amount) - (a.totalValue.usdEquivalent || a.totalValue.amount))
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

    private static calculatePaymentStatusBreakdown(payments: ProjectPayment[], projects: any[]) {
        const breakdown: Record<string, { count: number; amount: number }> = {};

        if (payments.length > 0) {
            // If real payments exist, show actual payment status
            payments.forEach(payment => {
                // Normalize payment status
                let status = payment.status;
                if (status === 'failed') status = 'rejected';
                if (status === 'paid') status = 'completed'; // Map 'paid' to 'completed'
                
                if (!breakdown[status]) {
                    breakdown[status] = { count: 0, amount: 0 };
                }
                breakdown[status].count += 1;
                breakdown[status].amount += toUSD(payment.amount, payment.currency as 'USD' | 'KES');
            });
        } else {
            // If no real payments exist, show outstanding amounts from project budgets
            const totalOutstanding = this.calculateOutstandingAmounts(projects, payments);
            if (totalOutstanding > 0) {
                breakdown['outstanding'] = {
                    count: projects.length,
                    amount: totalOutstanding
                };
            }
        }

        return Object.entries(breakdown).map(([status, data]) => ({
            status,
            count: data.count,
            amount: data.amount,
            color: PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || '#6B7280',
        }));
    }

    private static calculateMonthlyTrends(payments: ProjectPayment[], projects: any[]) {
        const trends: Record<string, {
            pending: number;
            approved: number;
            completed: number;
            rejected: number;
            outstanding: number;
        }> = {};
        const now = new Date();

        // Initialize last 12 months including current month
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
        
        // Ensure current month is always included
        const currentMonthKey = now.toISOString().slice(0, 7);
        if (!trends[currentMonthKey]) {
            trends[currentMonthKey] = {
                pending: 0,
                approved: 0,
                completed: 0,
                rejected: 0,
                outstanding: 0,
            };
        }

        if (payments.length > 0) {

            // Populate with actual payment data
            payments.forEach(payment => {
                const monthKey = payment.date.toISOString().slice(0, 7);
                if (trends[monthKey]) {
                    const amount = toUSD(payment.amount, payment.currency || 'USD');
                    // Normalize payment status
                    let status = payment.status;
                    if (status === 'failed') status = 'rejected';
                    if (status === 'paid') status = 'completed'; // Map 'paid' to 'completed'
                    

                    
                    if (status === 'pending' || status === 'approved' || status === 'completed' || status === 'rejected') {
                        trends[monthKey][status] = (trends[monthKey][status] || 0) + amount;
                    }
                    
                    // Count all non-rejected as outstanding
                    if (status === 'pending' || status === 'approved') {
                        trends[monthKey].outstanding = (trends[monthKey].outstanding || 0) + amount;
                    }
                }
            });
        } else {
            // If no real payments, show outstanding amounts in current month
            const currentMonthKey = now.toISOString().slice(0, 7);
            const totalOutstanding = this.calculateOutstandingAmounts(projects, payments);
            if (trends[currentMonthKey] && totalOutstanding > 0) {
                trends[currentMonthKey].outstanding = totalOutstanding;
            }
        }

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

    private static calculateOutstandingAmounts(projects: any[], payments: ProjectPayment[]): number {
        // Calculate total project budgets in USD
        const totalProjectBudgets = projects.reduce((sum, project) => {
            const budget = this.calculateProjectBudget(project);
            // Extract numeric value in USD
            return sum + extractNumericValue(budget, 'USD');
        }, 0);

        // Calculate total payments received (completed/approved/paid)
        const totalPaymentsReceived = payments
            .filter((p: any) => {
                const status = p.status === 'paid' ? 'completed' : p.status;
                return status === 'completed' || status === 'approved';
            })
            .reduce((sum: number, payment: any) => {
                // For KES payments, use the pre-calculated usdAmount if available
                const paymentCurrency = (payment.currency || 'USD').toUpperCase();
                if (paymentCurrency === 'KES' && 'usdAmount' in payment) {
                    return sum + (payment.usdAmount || 0);
                }
                return sum + toUSD(payment.amount, paymentCurrency);
            }, 0);

        // Ensure we don't return negative values
        return Math.max(0, totalProjectBudgets - totalPaymentsReceived);
    }

    private static calculateKPIs(payments: ProjectPayment[], projects: any[]) {
        const successfulPayments = payments.filter(p => {
            const status = p.status === 'paid' ? 'completed' : p.status;
            return status === 'completed' || status === 'approved';
        });
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

        const outstandingAmount = this.calculateOutstandingAmounts(projects, payments);

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
                    description: `Payment of ${payment.currency === 'KES' ? 'KSh' : '$'}${payment.amount.toFixed(2)} was received`,
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
            const paymentStatusData = this.calculatePaymentStatusBreakdown(payments, projects);
            const monthlyTrends = this.calculateMonthlyTrends(payments, projects);
            const paymentMethods = this.calculatePaymentMethods(payments);
            const kpis = this.calculateKPIs(payments, projects);
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
            const revenueByMonth = monthlyTrends.map(trend => {
                const monthlyRevenue = (trend.completed || 0) + (trend.approved || 0);
                return {
                    month: trend.month,
                    revenue: numberToCurrencyAmount(monthlyRevenue, 'USD'), // Assuming payments are tracked in USD
                };
            });

            // Calculate monthly growth
            const currentMonth = revenueByMonth[revenueByMonth.length - 1]?.revenue.usdEquivalent || 0;
            const previousMonth = revenueByMonth[revenueByMonth.length - 2]?.revenue.usdEquivalent || 0;
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
        if (error instanceof PrismaClientKnownRequestError) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}