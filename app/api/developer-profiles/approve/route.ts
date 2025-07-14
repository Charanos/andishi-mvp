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

        // First, get the developer profile to find the associated user
        const developerProfile = await prisma.developerProfile.findUnique({
            where: { id: profileId },
            include: { user: true }
        });

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

        await prisma.developerProfile.update({
            where: { id: profileId },
            data: profileUpdate
        });

        console.log(`Updated developer profile ${profileId} with status: ${profileUpdate.status}`);

        // Update associated user status and developerProfileStatus
        if (developerProfile.userId) {
            const userUpdate = action === "approve" 
                ? { 
                    status: "active", 
                    developerProfileStatus: "approved" as const
                  } 
                : { 
                    status: "inactive", 
                    developerProfileStatus: "rejected" as const
                  };

            await prisma.user.update({
                where: { id: developerProfile.userId },
                data: userUpdate
            });

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
