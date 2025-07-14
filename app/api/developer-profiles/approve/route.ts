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
            ? { 
                status: "approved", 
                isAvailable: true,
                updatedAt: new Date()
              }
            : { 
                status: "rejected", 
                isAvailable: false,
                updatedAt: new Date()
              };

        const profileUpdateResult = await profilesCollection.updateOne(
            { _id: objectId },
            { $set: profileUpdate }
        );

        if (profileUpdateResult.modifiedCount === 0) {
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: "Failed to update developer profile" 
            }), { status: 500, headers: corsHeaders });
        }

        console.log(`Updated developer profile ${profileId} with status: ${profileUpdate.status}`);

        // Update associated user status with comprehensive data
        if (developerProfile.userId) {
            const userUpdate = action === "approve" 
                ? { 
                    status: "active", 
                    isActive: true,
                    developerProfileStatus: "approved",
                    updatedAt: new Date()
                  } 
                : { 
                    status: "inactive", 
                    isActive: false,
                    developerProfileStatus: "rejected",
                    updatedAt: new Date()
                  };

            const userUpdateResult = await usersCollection.updateOne(
                { _id: developerProfile.userId },
                { $set: userUpdate }
            );

            if (userUpdateResult.modifiedCount === 0) {
                console.warn(`No user found or updated for developer profile ${profileId}`);
            } else {
                console.log(`Updated user ${developerProfile.userId} with status: ${userUpdate.status}`);
            }
        } else {
            console.warn(`No associated user found for developer profile ${profileId}`);
        }

        // Verify the update by fetching the updated profile
        const updatedProfile = await profilesCollection.findOne({ _id: objectId });
        const updatedUser = developerProfile.userId ? 
            await usersCollection.findOne({ _id: developerProfile.userId }) : null;

        return new NextResponse(JSON.stringify({ 
            success: true,
            message: `Developer ${action}d successfully`,
            profileId,
            status: profileUpdate.status,
            isAvailable: profileUpdate.isAvailable,
            profile: updatedProfile,
            user: updatedUser
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
