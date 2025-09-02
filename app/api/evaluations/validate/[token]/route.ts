import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify and decode the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_AUTH_SECRET || 'your-secret-key');
    
    try {
      const decoded = jwtVerify(token, secret) as any;
      
      // Check if token has expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { error: "Evaluation link has expired" },
          { status: 400 }
        );
      }

      // Fetch the assessment
      const assessment = await prisma.developerAssessment.findUnique({
        where: { id: decoded.assessmentId },
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

      // Check if already submitted
      if (assessment.status === 'finalized' || assessment.status === 'reviewed') {
        return NextResponse.json(
          { error: "This evaluation has already been completed" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        assessment: {
          id: assessment.id,
          developerName: assessment.developer?.user?.name || '',
          developerEmail: assessment.developer?.user?.email || '',
          evaluationType: assessment.evaluationType,
          createdAt: assessment.createdAt,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired evaluation link" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error validating evaluation token:", error);
    return NextResponse.json(
      { error: "Failed to validate evaluation link" },
      { status: 500 }
    );
  }
}
