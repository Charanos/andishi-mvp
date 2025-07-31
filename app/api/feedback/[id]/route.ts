import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

type Params = {
  params: {
    id: string;
  };
};

// PUT /api/feedback/[id] - Update feedback (admin only)
export async function PUT(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const session = await getSession(request);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new NextResponse(JSON.stringify({ error: "Missing feedback ID" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { read } = body;

    // Validate that at least one field is being updated
    if (read === undefined) {
      return new NextResponse(
        JSON.stringify({ error: "No fields to update" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const updatedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updatedFeedback, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`[Feedback API] PUT /api/feedback/${params.id}`, error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// DELETE /api/feedback/[id] - Delete feedback (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const session = await getSession(request);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { id } = params;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "Missing feedback ID" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Soft delete by marking as deleted
    const deletedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json(deletedFeedback, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`[Feedback API] DELETE /api/feedback/${params.id}`, error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
