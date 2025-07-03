import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


// GET /api/developer-profiles/[id] – return single profile
export async function GET(_req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const rec = await prisma.developerProfile.findUnique({ where: { id: params.id } });
    if (!rec) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json({ id: rec.id, ...(rec.data as any) }, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profiles/[id]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// PUT /api/developer-profiles/[id] – update profile
export async function PUT(req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const payload = await req.json();
    
    // First check if the profile exists
    const existingProfile = await prisma.developerProfile.findUnique({
      where: { id: params.id }
    });
    
    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const rec = await prisma.developerProfile.update({
      where: { id: params.id },
      data: { data: payload },
    });
    return NextResponse.json({ id: rec.id, ...(rec.data as any) }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profiles/[id]", err);
    if (err instanceof Error && 'code' in err && err.code === 'P2025') {
      return new NextResponse("Profile not found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/developer-profiles/[id] – remove profile
export async function DELETE(_req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    await prisma.developerProfile.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[id]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}