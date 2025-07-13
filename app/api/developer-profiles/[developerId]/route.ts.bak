import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// GET /api/developer-profiles/[developerId] – return single profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    const rec = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!rec) return new NextResponse("Not Found", { status: 404, headers: corsHeaders });
    return new NextResponse(JSON.stringify({ id: rec.id, ...(rec.data as any) }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// PUT /api/developer-profiles/[developerId] – update profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;
    const payload = await req.json();

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    const existingProfile = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    const rec = await prisma.developerProfile.update({
      where: { id: developerId },
      data: { data: payload },
    });

    return new NextResponse(JSON.stringify({ id: rec.id, ...(rec.data as any) }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("PUT /api/developer-profiles/[developerId]", err);
    if (err instanceof Error && 'code' in err && err.code === 'P2025') {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/developer-profiles/[developerId] – remove profile
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    await prisma.developerProfile.delete({ where: { id: developerId } });
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}