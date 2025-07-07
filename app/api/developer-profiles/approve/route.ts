import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH /api/developer-profiles/approve - Approve or reject a developer profile
export async function PATCH(req: NextRequest) {
    try {
        const { profileId, action } = await req.json();
        if (!profileId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, message: "Missing or invalid parameters" }, { status: 400 });
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
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error updating developer profile status:", error);
        return NextResponse.json({ success: false, message: "Failed to update profile", error: error instanceof Error ? error.message : error });
    }
}
