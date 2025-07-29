import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/blogs/[id]/view - Increment blog view count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing blog id' }, { status: 400 });
  }
  
  // Validate ID format if it looks like a MongoDB ObjectId
  if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
    // This looks like a valid MongoDB ObjectId, we can proceed
  } else if (id.length < 2 || id.length > 100) {
    // If it's not a valid ObjectId format and it's too short or too long, it's likely invalid
    // We'll still try the slug lookup but log a warning
    console.warn(`Suspicious blog ID format: ${id}`);
  }
  
  try {
    // Find the blog post by slug or id
    let blog = null;
    try {
      blog = await prisma.blog.findFirst({
        where: { 
          OR: [
            { slug: id },
            { id: id }
          ]
        }
      });
    } catch (prismaError: any) {
      // Handle Prisma P2023 error (invalid ID format)
      if (prismaError?.code === 'P2023') {
        // Try again but only with slug since ID format is invalid
        blog = await prisma.blog.findFirst({
          where: { 
            slug: id
          }
        });
      } else {
        throw prismaError; // Re-throw if it's a different error
      }
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment the view count
    const updatedBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        views: updatedBlog.views
      }
    });

  } catch (error) {
    console.error('Error incrementing blog view count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
