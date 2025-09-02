import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, verifyTransport } from "@/lib/mailer";
import { renderBaseTemplate } from "@/lib/emailTemplates";

// GET /api/feedback - Get all feedback (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all, read, unread
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { deleted: false };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } }
      ];
    }
    
    if (status === "read") {
      where.read = true;
    } else if (status === "unread") {
      where.read = false;
    }
    
    const [feedback, total] = await Promise.all([
      prisma.contactFeedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.contactFeedback.count({ where })
    ]);
    
    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/feedback", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/feedback - Create new feedback (public endpoint)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }
    
    // Create feedback
    const feedback = await prisma.contactFeedback.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });

    // Attempt to dispatch notification emails (non-blocking for main result)
    (async () => {
      try {
        const ok = await verifyTransport();
        if (!ok) return;

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/admin-dashboard`
          : "https://andishiacademy.co.ke/admin-dashboard";

        // Admin notification
        const adminHtml = renderBaseTemplate({
          title: `New Contact Feedback: ${subject}`,
          intro: `A new message was submitted via the website contact form.`,
          bodyHtml: `
            <div style="font-size:14px;color:#e5e7eb">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
              <p style="white-space:pre-wrap;margin-top:10px"><strong>Message:</strong><br/>${escapeHtml(message)}</p>
            </div>
          `,
          cta: { label: "Open Admin Dashboard", url: dashboardUrl },
        });
        await sendEmail({
          to: process.env.FEEDBACK_INBOX || "evals@andishiacademy.co.ke",
          subject: `[Andishi] New Feedback: ${subject}`,
          html: adminHtml,
          text: `New feedback from ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        });

        // User autoresponder
        const firstName = String(name || "").split(" ")[0] || name;
        const userHtml = renderBaseTemplate({
          title: "Thanks for contacting Andishi Academy",
          intro: `Hi ${escapeHtml(firstName)}, we've received your message and our team will get back to you shortly.`,
          bodyHtml: `<p style="margin:0 0 10px">We’ve logged your inquiry with subject “${escapeHtml(
            subject
          )}”. Here’s a copy of your message:</p>
            <blockquote style="margin:10px 0 0;padding-left:12px;border-left:3px solid rgba(255,255,255,.2);opacity:.95">${escapeHtml(
              message
            )}</blockquote>`,
          cta: { label: "Visit Andishi Academy", url: "https://andishiacademy.co.ke" },
        });
        await sendEmail({
          to: email,
          subject: `We received your message: ${subject}`,
          html: userHtml,
          text: `Hi ${firstName}, we received your message and will reply soon.\n\nYour message:\n${message}`,
        });
      } catch (e) {
        console.error("[feedback] email dispatch failed", e);
      }
    })();

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function escapeHtml(input: string) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


