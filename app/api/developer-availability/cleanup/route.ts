import { NextRequest, NextResponse } from "next/server";
import { batchUpdateExpiredBusyUntilDates } from "@/services/developerAvailabilityService";

/**
 * POST /api/developer-availability/cleanup
 * Batch update all developers whose busyUntilDate has passed
 * This endpoint should be called by a scheduled job or cron task
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check here
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const updatedCount = await batchUpdateExpiredBusyUntilDates();

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} developers`,
      updatedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    
    return NextResponse.json({
      success: false,
      message: "Failed to update developer availability",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * GET /api/developer-availability/cleanup
 * Get information about developers with expired busyUntilDate (dry run)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dry-run') === 'true';

    if (dryRun) {
      // Return info about what would be updated without actually updating
      const now = new Date();
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const expiredDevelopers = await prisma.developerProfile.findMany({
        where: {
          busyUntilDate: { lte: now }
        },
        select: {
          id: true,
          busyUntilDate: true,
          isAvailable: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          assignments: {
            where: {
              status: { notIn: ["completed", "cancelled"] }
            },
            select: {
              id: true,
              status: true,
              project: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Found ${expiredDevelopers.length} developers with expired busyUntilDate`,
        expiredDevelopers: expiredDevelopers.map((dev: any) => ({
          id: dev.id,
          user: dev.user,
          currentStatus: {
            isAvailable: dev.isAvailable,
            busyUntilDate: dev.busyUntilDate,
          },
          activeAssignments: dev.assignments.length,
          wouldBecomeAvailable: dev.assignments.length === 0
        })),
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      message: "Use POST to execute cleanup or add ?dry-run=true to see what would be updated"
    });
  } catch (error) {
    
    return NextResponse.json({
      success: false,
      message: "Failed to get developer availability info",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
