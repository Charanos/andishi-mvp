import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();

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

      // Get assessment
      const assessment = await prisma.technicalAssessment.findUnique({
        where: { id: payload.assessmentId as string },
      });

      if (!assessment) {
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      // Check if already completed
      if (assessment.status === 'completed') {
        return NextResponse.json(
          { error: "Assessment has already been completed" },
          { status: 400 }
        );
      }

      const { code, language, testResults } = body;

      if (!code || !language) {
        return NextResponse.json(
          { error: "Code and language are required" },
          { status: 400 }
        );
      }

      // Get challenge for evaluation criteria
      const challenge = await prisma.assessmentChallenge.findUnique({
        where: { id: assessment.challengeId },
      });

      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      // TODO: Integrate with AI evaluation service
      // For now, calculate a basic score based on test results
      let score = 0;
      if (testResults && Array.isArray(testResults)) {
        const passedTests = testResults.filter(result => result.passed).length;
        score = (passedTests / testResults.length) * 100;
      }

      // Update assessment with submission
      const updatedAssessment = await prisma.technicalAssessment.update({
        where: { id: assessment.id },
        data: {
          submittedCode: {
            code,
            language,
            submittedAt: new Date().toISOString(),
          },
          testResults: testResults || [],
          score,
          status: 'completed',
          completedAt: new Date(),
          // Placeholder for AI analysis - will be implemented in next phase
          aiAnalysis: {
            codeQuality: score > 80 ? 'excellent' : score > 60 ? 'good' : 'needs_improvement',
            feedback: 'AI analysis will be implemented in the next phase',
            suggestions: [],
          },
        },
      });

      // Update evaluation session
      await prisma.evaluationSession.updateMany({
        where: {
          sessionToken: sessionId,
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
          overallScore: score,
        },
      });

      return NextResponse.json({
        success: true,
        assessment: {
          id: updatedAssessment.id,
          score: updatedAssessment.score,
          status: updatedAssessment.status,
          completedAt: updatedAssessment.completedAt,
          feedback: "Assessment completed successfully. AI-powered detailed feedback will be available soon.",
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired session token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
