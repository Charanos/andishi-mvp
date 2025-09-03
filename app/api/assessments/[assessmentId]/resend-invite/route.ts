import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify, SignJWT } from 'jose';
import nodemailer from 'nodemailer';
import { renderMinimalNotice } from '@/lib/emailTemplates';

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

// POST resend evaluation invitation
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

    // Fetch the assessment with developer info
    const assessment = await prisma.developerAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        developer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if assessment is already finalized
    if (assessment.status === 'finalized') {
      return NextResponse.json(
        { error: "Cannot resend invitation for finalized assessment" },
        { status: 400 }
      );
    }

    // Parse existing evaluation data to get evaluator email if available
    let evaluationData: any = {};
    if (assessment.evaluation) {
      try {
        evaluationData = typeof assessment.evaluation === 'string' 
          ? JSON.parse(assessment.evaluation) 
          : assessment.evaluation;
      } catch (e) {
        // If parsing fails, create new evaluation data
        evaluationData = {};
      }
    }

    // Get evaluator email from existing data or use developer email
    const evaluatorEmail = evaluationData.evaluatorEmail || assessment.developer?.user?.email;
    
    if (!evaluatorEmail) {
      return NextResponse.json(
        { error: "No email address found for developer" },
        { status: 400 }
      );
    }

    // Generate new JWT token for evaluation link
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_AUTH_SECRET || 'your-secret-key');
    const token = await new SignJWT({ 
      assessmentId: assessment.id,
      developerId: assessment.developerId,
      evaluatorEmail,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(secret);

    // Create evaluation link
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const evaluationLink = `${baseUrl}/developer-evaluation/${token}`;

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
      port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
      },
    });

    // Prepare email content
    const developerName = assessment.developer?.user?.name || 'Developer';
    const emailHtml = renderMinimalNotice({
      title: 'Reminder: Developer Evaluation Request',
      paragraphs: [
        `This is a reminder to complete the evaluation for ${developerName}.`,
        `Your evaluation is an important part of our assessment process and helps us maintain high quality standards for our talent pool.`,
        `The evaluation link will expire in 7 days. Please complete it at your earliest convenience.`,
        `If you have already completed this evaluation, please disregard this message.`
      ],
      cta: { 
        label: 'Complete Evaluation', 
        url: evaluationLink 
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@andishi.dev',
      to: evaluatorEmail,
      subject: `Reminder: Developer Evaluation for ${developerName}`,
      html: emailHtml,
    });

    // Update assessment with new invitation data in evaluation field
    await prisma.developerAssessment.update({
      where: { id: assessmentId },
      data: {
        evaluation: {
          ...evaluationData,
          evaluatorEmail,
          invitationToken: token,
          resentAt: new Date().toISOString(),
          resentCount: (evaluationData.resentCount || 0) + 1
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Evaluation invitation resent to ${evaluatorEmail}`,
      evaluationLink,
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
