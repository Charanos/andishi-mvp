import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAuthToken } from "@/lib/auth-utils";

const prisma = new PrismaClient();

// GET - List all challenges with filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (specialty) where.specialty = specialty;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const challenges = await prisma.assessmentChallenge.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST - Create new challenge
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      problemStatement,
      specialty,
      difficulty,
      type,
      timeLimit,
      starterCode,
      sampleSolutions,
      testCases,
      constraints,
      evaluationCriteria,
      aiPrompts,
      tags,
      maxAttempts,
      createdBy,
    } = body;

    if (!title || !description || !problemStatement || !specialty || !difficulty || !type || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const challenge = await prisma.assessmentChallenge.create({
      data: {
        title,
        description,
        problemStatement,
        specialty,
        difficulty,
        type,
        timeLimit: timeLimit || 60, // Default 60 minutes
        starterCode: starterCode || {},
        sampleSolutions: sampleSolutions || {},
        testCases: testCases || [],
        constraints: constraints || [],
        evaluationCriteria: evaluationCriteria || {},
        aiPrompts: aiPrompts || {},
        tags: tags || [],
        maxAttempts: maxAttempts || 3, // Default 3 attempts
        createdBy,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}
