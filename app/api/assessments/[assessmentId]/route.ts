import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

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

// GET single assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await params;
    const assessment = await prisma.developerAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        developer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// PUT update assessment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await params;
    const body = await request.json();
    const {
      technicalSkills,
      professionalSkills,
      experienceAssessment,
      evaluation,
      status,
    } = body;

    // Calculate overall scores if updating evaluation
    let updatedEvaluation = evaluation;
    if (technicalSkills || professionalSkills) {
      const techScore = technicalSkills?.overallTechnicalScore || 0;
      const profScore = professionalSkills?.overallProfessionalScore || 0;
      const overallScore = Math.round((techScore + profScore) / 2);
      
      updatedEvaluation = {
        ...evaluation,
        overallScore,
        techPoolEligible: overallScore >= 75,
        recommendation: overallScore >= 75 ? "approved" : overallScore >= 60 ? "probation" : "rejected",
      };
    }

    const assessment = await prisma.developerAssessment.update({
      where: { id: assessmentId },
      data: {
        ...(technicalSkills && { technicalSkills }),
        ...(professionalSkills && { professionalSkills }),
        ...(experienceAssessment && { experienceAssessment }),
        ...(updatedEvaluation && { evaluation: updatedEvaluation }),
        ...(status && { status }),
        ...(status === "reviewed" && { reviewedAt: new Date() }),
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
      message: "Assessment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// DELETE assessment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await params;
    await prisma.developerAssessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json({
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
