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

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, evaluatorEmail, evaluatorName, message } = body;

    if (!assessmentId || !evaluatorEmail) {
      return NextResponse.json(
        { error: "Assessment ID and evaluator email are required" },
        { status: 400 }
      );
    }

    // Fetch the assessment with developer info
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

    // Generate evaluation token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_AUTH_SECRET || 'your-secret-key');
    const evaluationToken = await new SignJWT({
      assessmentId: assessment.id,
      developerId: assessment.developerId,
      evaluatorEmail: evaluatorEmail,
      type: 'evaluation',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Generate evaluation URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const evaluationUrl = `${baseUrl}/developer-evaluation/${evaluationToken}`;

    // Update assessment with invitation data
    await prisma.developerAssessment.update({
      where: { id: assessmentId },
      data: {
        evaluation: {
          evaluatorEmail,
          invitationToken: evaluationToken,
          invitedAt: new Date().toISOString(),
          invitationStatus: 'sent'
        },
        updatedAt: new Date(),
      },
    });

    // Send invitation email using existing template
    const transporter = createTransporter();
    
    const evaluationParagraphs = [
      `Dear ${evaluatorName || 'Evaluator'}, we would appreciate your valuable feedback on ${assessment.developer?.user?.name || 'our developer'}'s performance and skills.`,
      `Developer: ${assessment.developer?.user?.name || 'N/A'} | Evaluation Type: ${assessment.evaluationType.replace('_', ' ').charAt(0).toUpperCase() + assessment.evaluationType.slice(1)} | Expires: 7 days from now`,
      message || '',
      'Your evaluation will help us assess technical and professional skills, identify strengths and areas for improvement, make informed decisions about project assignments, and provide constructive feedback to the developer.',
      'This evaluation link will expire in 7 days. The evaluation should take approximately 10-15 minutes to complete.',
      'Thank you for your time and valuable input!'
    ].filter(p => p.length > 0);
    
    const emailHtml = renderMinimalNotice({
      title: 'Developer Evaluation Request',
      paragraphs: evaluationParagraphs,
      cta: {
        label: 'Complete Evaluation',
        url: evaluationUrl
      }
    });

    await transporter.sendMail({
      from: `"Andishi Team" <${process.env.EMAIL_USER}>`,
      to: evaluatorEmail,
      subject: `Developer Evaluation Request - ${assessment.developer?.user?.name || 'Developer'}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Evaluation invitation sent successfully",
      evaluationUrl: evaluationUrl,
    });
  } catch (error) {
    console.error("Error sending evaluation invitation:", error);
    return NextResponse.json(
      { error: "Failed to send evaluation invitation" },
      { status: 500 }
    );
  }
}
