import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/developer-profiles/[developerId] – return single profile
export async function GET(_req: NextRequest, context: { params: Promise<any> }) {
  try {
    const params = await context.params;
    const developerId = params.developerId;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400 });
    }

    const rec = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!rec) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json({ id: rec.id, ...(rec.data as any) }, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/developer-profiles/[developerId] – update profile
export async function PUT(req: NextRequest, context: { params: Promise<any> }) {
  try {
    const params = await context.params;
    const developerId = params.developerId;
    const payload = await req.json();

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400 });
    }

    // First check if the profile exists
    const existingProfile = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const rec = await prisma.developerProfile.update({
      where: { id: developerId },
      data: { data: payload },
    });

    return NextResponse.json({ id: rec.id, ...(rec.data as any) }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profiles/[developerId]", err);
    if (err instanceof Error && 'code' in err && err.code === 'P2025') {
      return new NextResponse("Profile not found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/developer-profiles/[developerId] – remove profile
export async function DELETE(_req: NextRequest, context: { params: Promise<any> }) {
  try {
    const params = await context.params;
    const developerId = params.developerId;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400 });
    }

    await prisma.developerProfile.delete({ where: { id: developerId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}