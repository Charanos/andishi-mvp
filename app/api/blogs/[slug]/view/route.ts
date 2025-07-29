import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/blogs/[slug]/view - Increment blog view count
export async function POST(
  request: NextRequest,
  context: { params?: { slug?: string } } = {}
) {
  const params = await context.params;
  const slug = params?.slug;
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing blog slug' }, { status: 400 });
  }
  
  try {
    // Find the blog post
    const blog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment the view count
    const updatedBlog = await prisma.blog.update({
      where: { slug },
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
