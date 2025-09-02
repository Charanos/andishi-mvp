// Assessment Grading and Scoring Logic

export interface GradingResult {
  technicalScore: number;
  professionalScore: number;
  overallScore: number;
  recommendation: 'approved' | 'rejected' | 'needs_review' | 'probation';
  techPoolEligible: boolean;
  suggestedRate: number;
  strengths: string[];
  improvements: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead';
}

export interface TechnicalMetrics {
  technicalExpertise: number;
  codeQuality: number;
  problemSolving: number;
  systemDesign: number;
  debugging: number;
}

export interface ProfessionalMetrics {
  communication: number;
  teamwork: number;
  timeManagement: number;
  clientInteraction: number;
  leadership: number;
}

// Weights for different skill categories
const TECHNICAL_WEIGHTS = {
  technicalExpertise: 0.25,
  codeQuality: 0.25,
  problemSolving: 0.20,
  systemDesign: 0.15,
  debugging: 0.15,
};

const PROFESSIONAL_WEIGHTS = {
  communication: 0.25,
  teamwork: 0.20,
  timeManagement: 0.20,
  clientInteraction: 0.20,
  leadership: 0.15,
};

// Calculate weighted technical score
export function calculateTechnicalScore(metrics: TechnicalMetrics): number {
  let weightedSum = 0;
  
  for (const [key, weight] of Object.entries(TECHNICAL_WEIGHTS)) {
    weightedSum += (metrics[key as keyof TechnicalMetrics] || 0) * weight;
  }
  
  return Math.round(weightedSum * 10) / 10; // Round to 1 decimal place
}

// Calculate weighted professional score
export function calculateProfessionalScore(metrics: ProfessionalMetrics): number {
  let weightedSum = 0;
  
  for (const [key, weight] of Object.entries(PROFESSIONAL_WEIGHTS)) {
    weightedSum += (metrics[key as keyof ProfessionalMetrics] || 0) * weight;
  }
  
  return Math.round(weightedSum * 10) / 10;
}

// Determine developer level based on scores and experience
export function determineDeveloperLevel(
  technicalScore: number,
  professionalScore: number,
  yearsOfExperience?: number,
  projectComplexity?: string
): 'junior' | 'mid' | 'senior' | 'lead' {
  const avgScore = (technicalScore + professionalScore) / 2;
  
  // Consider project complexity if provided
  if (projectComplexity === 'lead' && avgScore >= 4) {
    return 'lead';
  }
  if (projectComplexity === 'senior' && avgScore >= 3.5) {
    return 'senior';
  }
  
  // Determine based on scores and experience
  if (avgScore >= 4.5 && (yearsOfExperience === undefined || yearsOfExperience >= 7)) {
    return 'lead';
  } else if (avgScore >= 3.5 && (yearsOfExperience === undefined || yearsOfExperience >= 4)) {
    return 'senior';
  } else if (avgScore >= 2.5 && (yearsOfExperience === undefined || yearsOfExperience >= 2)) {
    return 'mid';
  } else {
    return 'junior';
  }
}

// Calculate suggested hourly rate based on level and scores
export function calculateSuggestedRate(
  level: 'junior' | 'mid' | 'senior' | 'lead',
  overallScore: number,
  location?: string
): number {
  // Base rates (USD/hour)
  const baseRates = {
    junior: 25,
    mid: 50,
    senior: 85,
    lead: 125,
  };
  
  // Location multipliers (can be expanded)
  const locationMultipliers: { [key: string]: number } = {
    'US': 1.2,
    'EU': 1.1,
    'UK': 1.15,
    'CA': 1.1,
    'AU': 1.1,
    'default': 1.0,
  };
  
  const baseRate = baseRates[level];
  const scoreMultiplier = 0.8 + (overallScore / 5) * 0.4; // 0.8 to 1.2 based on score
  const locationMultiplier = locationMultipliers[location || 'default'] || 1.0;
  
  return Math.round(baseRate * scoreMultiplier * locationMultiplier);
}

// Generate recommendation based on scores
export function generateRecommendation(
  technicalScore: number,
  professionalScore: number,
  overallScore: number
): 'approved' | 'rejected' | 'needs_review' | 'probation' {
  if (overallScore >= 4 && technicalScore >= 3.5 && professionalScore >= 3.5) {
    return 'approved';
  } else if (overallScore >= 3 && (technicalScore >= 3 || professionalScore >= 3)) {
    return 'probation';
  } else if (overallScore < 2 || (technicalScore < 2 && professionalScore < 2)) {
    return 'rejected';
  } else {
    return 'needs_review';
  }
}

// Identify strengths based on scores
export function identifyStrengths(
  technicalMetrics: TechnicalMetrics,
  professionalMetrics: ProfessionalMetrics
): string[] {
  const strengths: string[] = [];
  
  // Technical strengths
  if (technicalMetrics.technicalExpertise >= 4) {
    strengths.push('Strong technical expertise');
  }
  if (technicalMetrics.codeQuality >= 4) {
    strengths.push('Excellent code quality');
  }
  if (technicalMetrics.problemSolving >= 4) {
    strengths.push('Outstanding problem-solving skills');
  }
  if (technicalMetrics.systemDesign >= 4) {
    strengths.push('Strong system design capabilities');
  }
  if (technicalMetrics.debugging >= 4) {
    strengths.push('Excellent debugging skills');
  }
  
  // Professional strengths
  if (professionalMetrics.communication >= 4) {
    strengths.push('Excellent communication');
  }
  if (professionalMetrics.teamwork >= 4) {
    strengths.push('Strong team player');
  }
  if (professionalMetrics.timeManagement >= 4) {
    strengths.push('Excellent time management');
  }
  if (professionalMetrics.clientInteraction >= 4) {
    strengths.push('Great client interaction skills');
  }
  if (professionalMetrics.leadership >= 4) {
    strengths.push('Strong leadership qualities');
  }
  
  return strengths.slice(0, 5); // Return top 5 strengths
}

// Identify areas for improvement
export function identifyImprovements(
  technicalMetrics: TechnicalMetrics,
  professionalMetrics: ProfessionalMetrics
): string[] {
  const improvements: string[] = [];
  
  // Technical improvements
  if (technicalMetrics.technicalExpertise < 3) {
    improvements.push('Enhance technical expertise');
  }
  if (technicalMetrics.codeQuality < 3) {
    improvements.push('Improve code quality and documentation');
  }
  if (technicalMetrics.problemSolving < 3) {
    improvements.push('Develop problem-solving skills');
  }
  if (technicalMetrics.systemDesign < 3) {
    improvements.push('Study system design patterns');
  }
  if (technicalMetrics.debugging < 3) {
    improvements.push('Improve debugging techniques');
  }
  
  // Professional improvements
  if (professionalMetrics.communication < 3) {
    improvements.push('Enhance communication skills');
  }
  if (professionalMetrics.teamwork < 3) {
    improvements.push('Improve team collaboration');
  }
  if (professionalMetrics.timeManagement < 3) {
    improvements.push('Better time management needed');
  }
  if (professionalMetrics.clientInteraction < 3) {
    improvements.push('Develop client interaction skills');
  }
  if (professionalMetrics.leadership < 3) {
    improvements.push('Build leadership capabilities');
  }
  
  return improvements.slice(0, 5); // Return top 5 improvements
}

// Main grading function
export function gradeAssessment(
  technicalMetrics: TechnicalMetrics,
  professionalMetrics: ProfessionalMetrics,
  yearsOfExperience?: number,
  projectComplexity?: string,
  location?: string
): GradingResult {
  const technicalScore = calculateTechnicalScore(technicalMetrics);
  const professionalScore = calculateProfessionalScore(professionalMetrics);
  const overallScore = Math.round((technicalScore + professionalScore) / 2 * 10) / 10;
  
  const level = determineDeveloperLevel(
    technicalScore,
    professionalScore,
    yearsOfExperience,
    projectComplexity
  );
  
  const recommendation = generateRecommendation(
    technicalScore,
    professionalScore,
    overallScore
  );
  
  const suggestedRate = calculateSuggestedRate(level, overallScore, location);
  const strengths = identifyStrengths(technicalMetrics, professionalMetrics);
  const improvements = identifyImprovements(technicalMetrics, professionalMetrics);
  const techPoolEligible = recommendation === 'approved' || recommendation === 'probation';
  
  return {
    technicalScore,
    professionalScore,
    overallScore,
    recommendation,
    techPoolEligible,
    suggestedRate,
    strengths,
    improvements,
    level,
  };
}

// Validate assessment scores
export function validateScores(scores: any): boolean {
  const requiredFields = [
    'technicalExpertise',
    'codeQuality',
    'problemSolving',
    'communication',
    'teamwork',
  ];
  
  for (const field of requiredFields) {
    if (typeof scores[field] !== 'number' || scores[field] < 0 || scores[field] > 5) {
      return false;
    }
  }
  
  return true;
}

// Calculate completion percentage of an assessment
export function calculateAssessmentCompletion(assessment: any): number {
  let totalFields = 0;
  let completedFields = 0;
  
  // Check technical skills
  const technicalFields = ['technicalExpertise', 'codeQuality', 'problemSolving', 'systemDesign', 'debugging'];
  technicalFields.forEach(field => {
    totalFields++;
    if (assessment.technicalSkills?.[field] > 0) completedFields++;
  });
  
  // Check professional skills
  const professionalFields = ['communication', 'teamwork', 'timeManagement', 'clientInteraction', 'leadership'];
  professionalFields.forEach(field => {
    totalFields++;
    if (assessment.professionalSkills?.[field] > 0) completedFields++;
  });
  
  // Check evaluation fields
  if (assessment.evaluation?.evaluatorComments) completedFields++;
  totalFields++;
  
  if (assessment.evaluation?.strengths?.length > 0) completedFields++;
  totalFields++;
  
  if (assessment.evaluation?.improvements?.length > 0) completedFields++;
  totalFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}
