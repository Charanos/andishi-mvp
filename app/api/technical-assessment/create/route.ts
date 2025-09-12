import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAuthToken } from "@/lib/auth-utils";
import { SignJWT } from 'jose';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { developerId, specialty, difficulty, assessmentType } = body;

    if (!developerId || !specialty || !difficulty || !assessmentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find suitable challenge for the assessment
    const challenge = await prisma.assessmentChallenge.findFirst({
      where: {
        specialty,
        difficulty,
        type: assessmentType,
        isActive: true,
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "No suitable challenge found for the specified criteria" },
        { status: 404 }
      );
    }

    // Create technical assessment
    const assessment = await prisma.technicalAssessment.create({
      data: {
        developerId,
        assessmentType,
        specialty,
        challengeId: challenge.id,
        difficulty,
        timeLimit: challenge.timeLimit,
        maxScore: 100, // Default max score
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate session token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'
    );
    
    const sessionToken = await new SignJWT({
      assessmentId: assessment.id,
      developerId,
      type: 'technical_assessment'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(secret);

    // Create evaluation session
    const session = await prisma.evaluationSession.create({
      data: {
        developerId,
        sessionToken,
        technicalAssessments: [assessment.id],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        sessionId: session.id,
        sessionToken,
        assessmentUrl: `/technical-assessment/${sessionToken}`,
        challenge: {
          title: challenge.title,
          description: challenge.description,
          timeLimit: challenge.timeLimit,
        },
        expiresAt: assessment.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating technical assessment:", error);
    return NextResponse.json(
      { error: "Failed to create technical assessment" },
      { status: 500 }
    );
  }
}
