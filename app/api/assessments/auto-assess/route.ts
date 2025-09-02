import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_AUTH_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Parse resume/CV text to extract skills and experience
function parseResumeData(resumeText: string) {
  const skills: string[] = [];
  const experience: any[] = [];
  
  // Basic keyword extraction for skills (can be enhanced with NLP)
  const techKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'Angular', 'Vue', 'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
    'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
  ];
  
  techKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword.toLowerCase())) {
      skills.push(keyword);
    }
  });
  
  // Extract years of experience (basic pattern matching)
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|working)/i);
  const yearsOfExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  
  return {
    skills,
    yearsOfExperience,
    rawText: resumeText
  };
}

// Calculate initial scores based on profile data
function calculateInitialScores(developerData: any, resumeData?: any) {
  // Technical score based on skills count and diversity
  const skillsCount = developerData.skills?.length || resumeData?.skills?.length || 0;
  const technicalScore = Math.min(5, Math.round((skillsCount / 10) * 5));
  
  // Professional score based on experience
  const yearsOfExperience = developerData.yearsOfExperience || resumeData?.yearsOfExperience || 0;
  const professionalScore = Math.min(5, Math.round((yearsOfExperience / 10) * 5));
  
  // Determine complexity level
  let complexity: "junior" | "mid" | "senior" | "lead" = "junior";
  if (yearsOfExperience >= 8) complexity = "lead";
  else if (yearsOfExperience >= 5) complexity = "senior";
  else if (yearsOfExperience >= 2) complexity = "mid";
  
  // Calculate suggested rate
  const baseRates = { junior: 30, mid: 50, senior: 80, lead: 120 };
  const suggestedRate = baseRates[complexity];
  
  return {
    technicalScore,
    professionalScore,
    complexity,
    suggestedRate,
    overallScore: Math.round((technicalScore + professionalScore) / 2)
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAccess(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const developerId = formData.get('developerId') as string;
    const evaluationType = formData.get('evaluationType') as string || 'initial';
    const resumeFile = formData.get('resume') as File | null;
    const additionalNotes = formData.get('notes') as string || '';

    if (!developerId) {
      return NextResponse.json(
        { error: "Developer ID is required" },
        { status: 400 }
      );
    }

    // Fetch developer profile
    const developer = await prisma.developerProfile.findUnique({
      where: { id: developerId },
      include: {
        user: true,
      },
    });

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    // Parse resume if provided
    let resumeData = null;
    if (resumeFile) {
      const resumeText = await resumeFile.text();
      resumeData = parseResumeData(resumeText);
    }

    // Extract developer data
    const developerData = developer.data as any || {};
    
    // Calculate initial scores
    const scores = calculateInitialScores(developerData, resumeData);
    
    // Prepare skills array
    const allSkills = [
      ...(developerData.skills || []),
      ...(resumeData?.skills || [])
    ].filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates

    // Create auto-assessment
    const assessment = await prisma.developerAssessment.create({
      data: {
        developerId,
        evaluationType: evaluationType as any,
        technicalSkills: {
          specialty: developerData.specialty || allSkills[0] || "General Development",
          primaryStack: allSkills.slice(0, 5),
          skillRatings: [
            { category: "Programming Languages", rating: scores.technicalScore, notes: "Auto-assessed" },
            { category: "Frameworks & Libraries", rating: scores.technicalScore, notes: "Auto-assessed" },
            { category: "Database & Storage", rating: Math.max(1, scores.technicalScore - 1), notes: "Auto-assessed" },
            { category: "Cloud & DevOps", rating: Math.max(1, scores.technicalScore - 1), notes: "Auto-assessed" },
            { category: "Architecture & Design", rating: Math.max(1, scores.technicalScore - 2), notes: "Auto-assessed" },
          ],
          overallTechnicalScore: scores.technicalScore,
        },
        professionalSkills: {
          communication: scores.professionalScore,
          teamwork: scores.professionalScore,
          problemSolving: scores.technicalScore,
          timeManagement: Math.max(1, scores.professionalScore - 1),
          clientInteraction: Math.max(1, scores.professionalScore - 1),
          overallProfessionalScore: scores.professionalScore,
        },
        experienceAssessment: {
          relevantExperience: scores.professionalScore >= 3,
          projectComplexity: scores.complexity,
          industryKnowledge: developerData.industries || [],
          portfolioQuality: Math.max(1, scores.technicalScore - 1),
        },
        evaluation: {
          overallScore: scores.overallScore,
          recommendation: scores.overallScore >= 3 ? "needs_review" : "rejected",
          techPoolEligible: scores.overallScore >= 3,
          suggestedRate: scores.suggestedRate,
          suggestedProjects: developerData.projectTypes || [],
          strengths: allSkills.slice(0, 3),
          improvements: ["Pending manual review", "Requires evaluation feedback"],
          evaluatorComments: `Auto-assessment generated on ${new Date().toLocaleDateString()}. ${additionalNotes}\n\nSkills identified: ${allSkills.join(', ')}\nYears of experience: ${developerData.yearsOfExperience || resumeData?.yearsOfExperience || 'Unknown'}`,
        },
        status: "draft",
      },
      include: {
        developer: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-assessment created successfully",
      assessment: {
        id: assessment.id,
        developerId: assessment.developerId,
        status: assessment.status,
        scores: {
          technical: scores.technicalScore,
          professional: scores.professionalScore,
          overall: scores.overallScore,
        },
        suggestedRate: scores.suggestedRate,
        complexity: scores.complexity,
        skillsIdentified: allSkills.length,
      },
    });
  } catch (error) {
    console.error("Error creating auto-assessment:", error);
    return NextResponse.json(
      { error: "Failed to create auto-assessment" },
      { status: 500 }
    );
  }
}
