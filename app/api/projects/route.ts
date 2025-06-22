import { NextResponse } from "next/server";

// Placeholder mock data – replace with real DB query later
export async function GET() {
  const projects = [
    {
      _id: "p1",
      projectDetails: { title: "Marketplace Platform" },
      userInfo: { firstName: "Alice", lastName: "Doe" },
      status: "in-progress",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "p2",
      projectDetails: { title: "Mobile App" },
      userInfo: { firstName: "Bob", lastName: "Smith" },
      status: "pending",
      priority: "medium",
      createdAt: new Date().toISOString(),
    },
  ];
  return NextResponse.json(projects, { status: 200 });
}
