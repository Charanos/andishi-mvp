import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const prisma = new PrismaClient();

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// GET all assessments or filter by developerId
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const developerId = searchParams.get("developerId");
    const status = searchParams.get("status");
    const evaluationType = searchParams.get("evaluationType");

    const where: any = {};
    if (developerId) where.developerId = developerId;
    if (status) where.status = status;
    if (evaluationType) where.evaluationType = evaluationType;

    const assessments = await prisma.developerAssessment.findMany({
      where,
      include: {
        developer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format assessments with developer info
    const formattedAssessments = assessments.map((assessment) => ({
      ...assessment,
      developerName: assessment.developer?.user?.name || "Unknown",
      developerEmail: assessment.developer?.user?.email || "",
      developerData: assessment.developer?.data || {},
    }));

    return NextResponse.json({ assessments: formattedAssessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST create new assessment
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { developerId, evaluationType, technicalSkills, professionalSkills } = body;

    if (!developerId || !evaluationType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle temporary developer ID for new assessments
    let actualDeveloperId = developerId;
    let developer = null;
    
    if (developerId === 'temp-dev-id') {
      // Generate a temporary ObjectId for placeholder assessments
      actualDeveloperId = new ObjectId().toString();
    } else {
      try {
        developer = await prisma.developerProfile.findUnique({
          where: { id: developerId },
        });

        if (!developer) {
          return NextResponse.json(
            { error: "Developer not found" },
            { status: 404 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid developer ID format" },
          { status: 400 }
        );
      }
    }

    // Create assessment with default structure
    const assessment = await prisma.developerAssessment.create({
      data: {
        developerId: actualDeveloperId,
        evaluationType,
        technicalSkills: technicalSkills || {
          specialty: "",
          primaryStack: [],
          skillRatings: [],
          overallTechnicalScore: 0,
        },
        professionalSkills: professionalSkills || {
          communication: 0,
          teamwork: 0,
          problemSolving: 0,
          timeManagement: 0,
          clientInteraction: 0,
          overallProfessionalScore: 0,
        },
        experienceAssessment: {
          relevantExperience: false,
          projectComplexity: "junior",
          industryKnowledge: [],
          portfolioQuality: 0,
        },
        evaluation: {
          overallScore: 0,
          recommendation: "needs_review",
          techPoolEligible: false,
          suggestedRate: 0,
          suggestedProjects: [],
          strengths: [],
          improvements: [],
          evaluatorComments: "",
        },
        status: "draft",
      },
      include: {
        developer: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      assessment,
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
