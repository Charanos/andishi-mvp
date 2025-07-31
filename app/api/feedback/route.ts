import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// GET /api/feedback - Get all feedback (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all, read, unread
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { deleted: false };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } }
      ];
    }
    
    if (status === "read") {
      where.read = true;
    } else if (status === "unread") {
      where.read = false;
    }
    
    const [feedback, total] = await Promise.all([
      prisma.contactFeedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.contactFeedback.count({ where })
    ]);
    
    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/feedback", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/feedback - Create new feedback (public endpoint)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }
    
    // Create feedback
    const feedback = await prisma.contactFeedback.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });
    
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


