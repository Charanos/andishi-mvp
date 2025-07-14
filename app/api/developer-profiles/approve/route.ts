import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

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
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: "Missing or invalid parameters" 
            }), { status: 400, headers: corsHeaders });
        }

        console.log(`Processing ${action} for profile ${profileId}`);

        const client = await clientPromise;
        const db = client.db();
        const profilesCollection = db.collection('developerProfiles');
        const usersCollection = db.collection('users');

        // Convert profileId to ObjectId
        let objectId: ObjectId;
        try {
            objectId = new ObjectId(profileId);
        } catch (error) {
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: "Invalid profile ID format" 
            }), { status: 400, headers: corsHeaders });
        }

        // First, get the developer profile to find the associated user
        const developerProfile = await profilesCollection.findOne({ _id: objectId });

        if (!developerProfile) {
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: "Developer profile not found" 
            }), { status: 404, headers: corsHeaders });
        }

        // Update developer profile status and availability
        const profileUpdate = action === "approve"
            ? { status: "approved", isAvailable: true }
            : { status: "rejected", isAvailable: false };

        await profilesCollection.updateOne(
            { _id: objectId },
            { $set: profileUpdate }
        );

        console.log(`Updated developer profile ${profileId} with status: ${profileUpdate.status}`);

        // Update associated user status
        if (developerProfile.userId) {
            const userUpdate = action === "approve" 
                ? { 
                    status: "active", 
                    developerProfileStatus: "approved"
                  } 
                : { 
                    status: "inactive", 
                    developerProfileStatus: "rejected"
                  };

            await usersCollection.updateOne(
                { _id: developerProfile.userId },
                { $set: userUpdate }
            );

            console.log(`Updated user ${developerProfile.userId} with status: ${userUpdate.status}`);
        } else {
            console.warn(`No associated user found for developer profile ${profileId}`);
        }

        return new NextResponse(JSON.stringify({ 
            success: true,
            message: `Developer ${action}d successfully`,
            profileId,
            status: profileUpdate.status,
            isAvailable: profileUpdate.isAvailable
        }), { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Error updating developer profile status:", error);
        return new NextResponse(JSON.stringify({ 
            success: false, 
            message: "Failed to update profile", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }), { status: 500, headers: corsHeaders });
    }
}
