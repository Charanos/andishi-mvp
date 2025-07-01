import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { mockDeveloperProfile } from "@/lib/mockDeveloperProfile";

export const dynamic = 'force-dynamic';

// NOTE: Proper authentication / RBAC is not yet wired. For now, we only allow writes
// if NODE_ENV is not production. Replace this with real admin checks later.
const isReadOnly = process.env.NODE_ENV === "production";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    let record = await db.collection('developerprofiles').findOne({});

    if (!record) {
      const insertRes = await db.collection('developerprofiles').insertOne({ data: mockDeveloperProfile });
      record = await db.collection('developerprofiles').findOne({ _id: insertRes.insertedId });
    }

    return NextResponse.json(record?.data, { status: 200 });
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

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('developerprofiles').findOne({});

    let record;
    if (existing) {
      await db.collection('developerprofiles').updateOne({ _id: existing._id }, { $set: { data: payload } });
      record = await db.collection('developerprofiles').findOne({ _id: existing._id });
    } else {
      const insertRes = await db.collection('developerprofiles').insertOne({ data: payload });
      record = await db.collection('developerprofiles').findOne({ _id: insertRes.insertedId });
    }

    return NextResponse.json(record!.data, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
