import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper function to get user name from database
async function getUserName(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, role: true },
    });
  
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return 'User';
    }
    // Handle missing firstName/lastName by falling back to email or default
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // If both names are missing, use email or default
    if (fullName) {
      return fullName;
    } else if (user.email) {
      return user.email.split('@')[0] || 'User';
    } else {
      return user.role === 'admin' ? 'Admin User' : 
             user.role === 'client' ? 'Client User' : 
             user.role === 'developer' ? 'Developer User' : 'User';
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return 'User';
  }
}

// POST /api/project-chat/fix-participants - Fix participant names with "Unknown User"
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Only allow admin to run this fix
    if (session.user.role !== 'admin') {
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    console.log('Starting participant name fix process...');

    // Find all chat participants with "Unknown User" names or undefined names
    const unknownParticipants = await prisma.chatParticipant.findMany({
      where: {
        OR: [
          { name: "Unknown User" },
          { name: "undefined undefined" },
          { name: { contains: "undefined" } },
          { name: "" },
          { name: null as any }
        ]
      },
      include: {
        chat: true
      }
    });

    console.log(`Found ${unknownParticipants.length} participants with unknown names`);

    let fixedCount = 0;
    for (const participant of unknownParticipants) {
      try {
        const correctName = await getUserName(participant.userId);
        
        await prisma.chatParticipant.update({
          where: { id: participant.id },
          data: { name: correctName }
        });
        
        console.log(`Fixed participant ${participant.userId}: "${participant.name}" -> "${correctName}"`);
        fixedCount++;
      } catch (error) {
        console.error(`Failed to fix participant ${participant.userId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} participants out of ${unknownParticipants.length} found`,
      fixedCount,
      totalFound: unknownParticipants.length
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error fixing participants:', error);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
