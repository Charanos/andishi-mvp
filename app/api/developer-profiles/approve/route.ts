import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: corsHeaders });
}

// PATCH /api/developer-profiles/approve - Approve or reject a developer profile
export async function PATCH(req: NextRequest) {
    try {
        const { profileId, action } = await req.json();
        if (!profileId || !["approve", "reject"].includes(action)) {
            return new NextResponse(JSON.stringify({ success: false, message: "Missing or invalid parameters" }), { status: 400, headers: corsHeaders });
        }
        const client = await clientPromise;
        const db = client.db();
        const profilesCol = db.collection("developerProfiles");
        const update =
            action === "approve"
                ? { status: "approved", isAvailable: true }
                : { status: "rejected", isAvailable: false };
        const result = await profilesCol.updateOne(
            { _id: new ObjectId(profileId) },
            { $set: update }
        );

        if (result.matchedCount === 1) {
            // After updating developer profile, find the associated user and update their status
            const updatedProfile = await profilesCol.findOne({ _id: new ObjectId(profileId) });
            if (updatedProfile && updatedProfile.userId) {
                const usersCol = db.collection("users");
                const userUpdate = action === "approve" ? { status: "active" } : { status: "inactive" };
                await usersCol.updateOne(
                    { _id: new ObjectId(updatedProfile.userId) },
                    { $set: userUpdate }
                );
            }
            return new NextResponse(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
        } else {
            return new NextResponse(JSON.stringify({ success: false, message: "Profile not found" }), { status: 404, headers: corsHeaders });
        }
    } catch (error) {
        console.error("Error updating developer profile status:", error);
        return new NextResponse(JSON.stringify({ success: false, message: "Failed to update profile", error: error instanceof Error ? error.message : error }), { status: 500, headers: corsHeaders });
    }
}
