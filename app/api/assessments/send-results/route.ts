import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { assessmentId, recipientEmail, includeDetailedFeedback } = await request.json();

    if (!assessmentId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Assessment ID and recipient email are required' },
        { status: 400 }
      );
    }

    // Fetch assessment data
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
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Parse evaluation data
    let evaluationData;
    try {
      evaluationData = typeof assessment.evaluation === 'string' 
        ? JSON.parse(assessment.evaluation) 
        : assessment.evaluation;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid assessment evaluation data' },
        { status: 400 }
      );
    }

    // Prepare email content
    const developerName = assessment.developer?.user?.name || 'Developer';
    const overallScore = evaluationData?.overallScore || 0;
    const recommendation = evaluationData?.recommendation || 'pending';
    const suggestedRate = evaluationData?.suggestedRate || 0;

    const emailSubject = `Assessment Results - ${developerName}`;
    
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">Assessment Results</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Developer Evaluation Summary</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Developer: ${developerName}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div>
              <strong>Overall Score:</strong> ${overallScore}%
            </div>
            <div>
              <strong>Recommendation:</strong> ${recommendation.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              <strong>Suggested Rate:</strong> $${suggestedRate}/hour
            </div>
            <div>
              <strong>Assessment Type:</strong> ${assessment.evaluationType.replace('_', ' ')}
            </div>
          </div>
        </div>
    `;

    if (includeDetailedFeedback && evaluationData) {
      emailContent += `
        <div style="background: #fff; padding: 25px; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Detailed Feedback</h3>
          
          ${evaluationData.strengths ? `
            <div style="margin-bottom: 15px;">
              <strong>Strengths:</strong>
              <p style="margin: 5px 0; color: #666;">${evaluationData.strengths}</p>
            </div>
          ` : ''}
          
          ${evaluationData.improvements ? `
            <div style="margin-bottom: 15px;">
              <strong>Areas for Improvement:</strong>
              <p style="margin: 5px 0; color: #666;">${evaluationData.improvements}</p>
            </div>
          ` : ''}
          
          ${evaluationData.evaluatorComments ? `
            <div style="margin-bottom: 15px;">
              <strong>Evaluator Comments:</strong>
              <p style="margin: 5px 0; color: #666;">${evaluationData.evaluatorComments}</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    emailContent += `
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
          <p style="margin: 0; color: #1976d2;">
            This assessment was conducted through Andishi's comprehensive evaluation system.
          </p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@andishi.dev',
      to: recipientEmail,
      subject: emailSubject,
      html: emailContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment results sent successfully',
    });

  } catch (error) {
    console.error('Error sending assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to send assessment results' },
      { status: 500 }
    );
  }
}
