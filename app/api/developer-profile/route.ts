import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mockDeveloperProfile } from "@/lib/mockDeveloperProfile";

export const dynamic = 'force-dynamic'


// NOTE: Proper authentication / RBAC is not yet wired. For now, we only allow writes
// if NODE_ENV is not production. Replace this with real admin checks later.
const isReadOnly = process.env.NODE_ENV === "production";

export async function GET() {
  try {
    let record = await prisma.developerProfile.findFirst();

    // If no profile yet, seed with dummy data so the dashboard has something to show
    if (!record) {
      record = await prisma.developerProfile.create({
        data: {
          data: mockDeveloperProfile as unknown as object,
        },
      });
    }

    return NextResponse.json(record.data, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const payload = await req.json();

    const existing = await prisma.developerProfile.findFirst();

    let record;
    if (existing) {
      record = await prisma.developerProfile.update({
        where: { id: existing.id },
        data: { data: payload },
      });
    } else {
      record = await prisma.developerProfile.create({
        data: { data: payload },
      });
    }

    return NextResponse.json(record.data, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
