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

// POST finalize assessment and update developer status
export async function POST(
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
      updateDeveloperStatus = true,
      addToTechPool,
      suggestedRate,
      comments,
    } = body;

    // Get the assessment
    const assessment = await prisma.developerAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        developer: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Parse evaluation data
    const evaluation = assessment.evaluation as any;
    const techPoolEligible = addToTechPool !== undefined 
      ? addToTechPool 
      : evaluation.techPoolEligible;

    // Update assessment to finalized
    const updatedAssessment = await prisma.developerAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "finalized",
        reviewedAt: new Date(),
        evaluation: {
          ...evaluation,
          techPoolEligible,
          suggestedRate: suggestedRate || evaluation.suggestedRate,
          evaluatorComments: comments || evaluation.evaluatorComments,
        },
      },
    });

    // Update developer profile if requested
    let developerUpdated = false;
    let poolStatus = false;

    if (updateDeveloperStatus && assessment.developer) {
      const updateData: any = {
        lastAssessmentDate: new Date(),
        assessmentScore: evaluation.overallScore,
      };

      // Update tech pool membership
      if (techPoolEligible && evaluation.overallScore >= 75) {
        updateData.techPoolMember = true;
        updateData.poolJoinedDate = new Date();
        updateData.status = "approved";
        poolStatus = true;
      } else if (evaluation.recommendation === "rejected") {
        updateData.techPoolMember = false;
        updateData.poolJoinedDate = null;
        updateData.status = "rejected";
      }

      // Update availability based on assessment
      if (evaluation.recommendation === "approved") {
        updateData.isAvailable = true;
      }

      await prisma.developerProfile.update({
        where: { id: assessment.developerId },
        data: updateData,
      });

      // Also update user status if profile status changed
      if (assessment.developer.userId) {
        await prisma.user.update({
          where: { id: assessment.developer.userId },
          data: {
            developerProfileStatus: updateData.status || "pending",
          },
        });
      }

      developerUpdated = true;
    }

    return NextResponse.json({
      assessment: updatedAssessment,
      developerUpdated,
      poolStatus,
      message: poolStatus
        ? "Developer successfully added to tech talent pool"
        : "Assessment finalized successfully",
    });
  } catch (error) {
    console.error("Error finalizing assessment:", error);
    return NextResponse.json(
      { error: "Failed to finalize assessment" },
      { status: 500 }
    );
  }
}
