import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAvailabilityStatus } from "@/services/developerAvailabilityService";

// GET /api/project-assignments/available - Get all available developers (approved and available)
export async function GET() {
    try {
        
        
        // Query developers with their user information and assignments
        const developers = await prisma.developerProfile.findMany({
            where: {
                status: "approved",
                // Don't filter by isAvailable here since we need to check busyUntilDate
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        developerProfileStatus: true
                    }
                },
                assignments: {
                    where: {
                        status: { notIn: ["completed", "cancelled"] }
                    },
                    include: {
                        project: {
                            select: {
                                title: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        

        // Filter truly available developers (considering busyUntilDate and active assignments)
        const availableDevelopers = developers.filter(dev => {
            // Check if user is active
            if (dev.user?.status !== 'active') {
                
                return false;
            }

            // Check availability status including busyUntilDate
            const availabilityStatus = getCurrentAvailabilityStatus(
                dev.isAvailable, 
                dev.busyUntilDate
            );

            // Only include if truly available
            const isAvailable = availabilityStatus.status === 'available';
            
            if (!isAvailable) {
                
            }

            return isAvailable;
        });

        

        return NextResponse.json(availableDevelopers, { status: 200 });
    } catch (error) {
        
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
