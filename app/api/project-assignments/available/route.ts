import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/project-assignments/available - Get all available developers (approved and available)
export async function GET() {
    try {
        // Query real developer profiles from the database
        const developers = await prisma.developerProfile.findMany({
            where: {
                isAvailable: true,
                status: "approved",
            },
        });
        return NextResponse.json(developers, { status: 200 });
    } catch (error) {
        console.error("GET /api/project-assignments/available", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
