import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify and decode the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
    
    let decoded: any;
    try {
      decoded = jwtVerify(token, secret);
      
      // Check if token has expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { error: "Evaluation link has expired" },
          { status: 400 }
        );
      }
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired evaluation link" },
        { status: 400 }
      );
    }

    // Fetch the assessment
    const assessment = await prisma.developerAssessment.findUnique({
      where: { id: decoded.assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (assessment.status === 'finalized' || assessment.status === 'reviewed') {
      return NextResponse.json(
        { error: "This evaluation has already been completed" },
        { status: 400 }
      );
    }

    // Calculate scores from the evaluation data
    const technicalScore = (
      body.technicalExpertise +
      body.codeQuality +
      body.problemSolving +
      body.systemDesign +
      body.debugging
    ) / 5;

    const professionalScore = (
      body.communication +
      body.teamwork +
      body.timeManagement +
      body.clientInteraction +
      body.leadership
    ) / 5;

    // Determine recommendation based on scores
    let recommendation: "approved" | "rejected" | "needs_review" | "probation";
    if (body.overallRating >= 4 && body.recommendation === 'highly_recommend') {
      recommendation = "approved";
    } else if (body.overallRating >= 3 && (body.recommendation === 'recommend' || body.recommendation === 'highly_recommend')) {
      recommendation = "probation";
    } else if (body.overallRating < 2 || body.recommendation === 'not_recommend') {
      recommendation = "rejected";
    } else {
      recommendation = "needs_review";
    }

    // Calculate suggested rate based on complexity and scores
    const complexityMultiplier = {
      junior: 30,
      mid: 50,
      senior: 80,
      lead: 120
    };
    const baseRate = complexityMultiplier[body.projectComplexity as keyof typeof complexityMultiplier] || 50;
    const suggestedRate = Math.round(baseRate * (body.overallRating / 5) * 1.2);

    // Update the assessment with evaluation data
    const updatedAssessment = await prisma.developerAssessment.update({
      where: { id: decoded.assessmentId },
      data: {
        technicalSkills: {
          specialty: body.technicalChallenges || "General Development",
          primaryStack: [],
          skillRatings: [
            { category: "Technical Expertise", rating: body.technicalExpertise, notes: "" },
            { category: "Code Quality", rating: body.codeQuality, notes: "" },
            { category: "Problem Solving", rating: body.problemSolving, notes: "" },
            { category: "System Design", rating: body.systemDesign, notes: "" },
            { category: "Debugging", rating: body.debugging, notes: "" },
          ],
          overallTechnicalScore: technicalScore,
        },
        professionalSkills: {
          communication: body.communication,
          teamwork: body.teamwork,
          problemSolving: body.problemSolving,
          timeManagement: body.timeManagement,
          clientInteraction: body.clientInteraction,
          overallProfessionalScore: professionalScore,
        },
        experienceAssessment: {
          relevantExperience: body.deliverySuccess >= 3,
          projectComplexity: body.projectComplexity,
          industryKnowledge: [],
          portfolioQuality: body.deliverySuccess,
        },
        evaluation: {
          overallScore: body.overallRating,
          recommendation: recommendation,
          techPoolEligible: recommendation === "approved" || recommendation === "probation",
          suggestedRate: suggestedRate,
          suggestedProjects: [],
          strengths: body.strengths ? [body.strengths] : [],
          improvements: body.improvements ? [body.improvements] : [],
          evaluatorComments: `Evaluated by: ${body.evaluatorName} (${body.evaluatorRole} at ${body.evaluatorCompany})\nRelationship Duration: ${body.relationshipDuration}\n\n${body.additionalComments || ''}`,
        },
        status: "submitted",
      },
    });

    // Send confirmation email to evaluator (optional)
    // You can add email sending logic here using your email service

    return NextResponse.json({
      success: true,
      message: "Evaluation submitted successfully",
      assessmentId: updatedAssessment.id,
    });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      { error: "Failed to submit evaluation" },
      { status: 500 }
    );
  }
}
