import { NextResponse } from "next/server";

// Mock analytics data – replace with DB aggregation later
export async function GET() {
  const analytics = {
    totalUsers: 42,
    totalProjects: 12,
    totalRevenue: 275000,
    monthlyGrowth: 7,
    projectsByStatus: {
      pending: 3,
      reviewed: 2,
      approved: 5,
      rejected: 2,
    },
    usersByRole: {
      admin: 2,
      developer: 25,
      client: 15,
    },
    revenueByMonth: [
      { month: "Jan", revenue: 35000 },
      { month: "Feb", revenue: 42000 },
      { month: "Mar", revenue: 38000 },
      { month: "Apr", revenue: 50000 },
    ],
    topClients: [
      { name: "Acme Corp", projects: 4, revenue: 90000 },
      { name: "Globex", projects: 3, revenue: 70000 },
    ],
    topDevelopers: [
      { name: "Alice Doe", projects: 6, rating: 4.9 },
      { name: "Bob Smith", projects: 5, rating: 4.8 },
    ],
  };
  return NextResponse.json(analytics, { status: 200 });
}
