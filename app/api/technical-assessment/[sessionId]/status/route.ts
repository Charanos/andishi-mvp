import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify session token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'
    );

    try {
      const { payload } = await jwtVerify(sessionId, secret);
      
      // Check if token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { error: "Assessment session has expired" },
          { status: 400 }
        );
      }

      // Get assessment details
      const assessment = await prisma.technicalAssessment.findUnique({
        where: { id: payload.assessmentId as string },
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

      // Get challenge details
      const challenge = await prisma.assessmentChallenge.findUnique({
        where: { id: assessment.challengeId },
      });

      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      // Calculate time remaining
      const timeRemaining = Math.max(0, assessment.expiresAt.getTime() - Date.now());
      const isExpired = timeRemaining === 0;

      return NextResponse.json({
        success: true,
        assessment: {
          id: assessment.id,
          status: isExpired ? 'expired' : assessment.status,
          specialty: assessment.specialty,
          difficulty: assessment.difficulty,
          timeLimit: assessment.timeLimit,
          timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
          score: assessment.score,
          maxScore: assessment.maxScore,
          completedAt: assessment.completedAt,
          challenge: {
            title: challenge.title,
            description: challenge.description,
            problemStatement: challenge.problemStatement,
            starterCode: challenge.starterCode,
            constraints: challenge.constraints,
          },
          developer: {
            name: assessment.developer?.user?.name,
            email: assessment.developer?.user?.email,
          },
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired session token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error getting assessment status:", error);
    return NextResponse.json(
      { error: "Failed to get assessment status" },
      { status: 500 }
    );
  }
}
