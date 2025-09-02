import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';

export interface TechnicalSkills {
  specialty: string;
  primaryStack: string[];
  skillRatings: {
    category: string;
    rating: number;
    notes?: string;
  }[];
  overallTechnicalScore: number;
}

export interface ProfessionalSkills {
  communication: number;
  teamwork: number;
  problemSolving: number;
  timeManagement: number;
  clientInteraction: number;
  overallProfessionalScore: number;
}

export interface ExperienceAssessment {
  relevantExperience: boolean;
  projectComplexity: "junior" | "mid" | "senior" | "lead";
  industryKnowledge: string[];
  portfolioQuality: number;
}

export interface Evaluation {
  overallScore: number;
  recommendation: "approved" | "rejected" | "needs_review" | "probation";
  techPoolEligible: boolean;
  suggestedRate: number;
  suggestedProjects: string[];
  strengths: string[];
  improvements: string[];
  evaluatorComments: string;
}

export interface DeveloperAssessment {
  id: string;
  developerId: string;
  evaluatorId: string;
  evaluatorEmail?: string;
  evaluationType: "initial" | "periodic" | "project_based";
  technicalSkills: TechnicalSkills;
  professionalSkills: ProfessionalSkills;
  experienceAssessment: ExperienceAssessment;
  evaluation: Evaluation;
  status: "draft" | "submitted" | "reviewed" | "finalized";
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  expiresAt?: string;
  developerName?: string;
  developerEmail?: string;
  developerData?: any;
}

export const useAssessments = (developerId?: string) => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<DeveloperAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async (filters?: {
    developerId?: string;
    status?: string;
    evaluationType?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.developerId) params.append("developerId", filters.developerId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.evaluationType) params.append("evaluationType", filters.evaluationType);

      const response = await fetch(`/api/assessments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch assessments");
      
      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error('Failed to fetch assessments', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssessment = useCallback(async (
    developerId: string,
    evaluationType: "initial" | "periodic" | "project_based"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerId, evaluationType }),
      });

      if (!response.ok) throw new Error("Failed to create assessment");
      
      const data = await response.json();
      toast.success('Assessment created', 'Successfully created new assessment');
      return data.assessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error('Failed to create assessment', err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssessment = useCallback(async (
    assessmentId: string,
    updates: Partial<{
      technicalSkills: TechnicalSkills;
      professionalSkills: ProfessionalSkills;
      experienceAssessment: ExperienceAssessment;
      evaluation: Evaluation;
      status: string;
    }>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update assessment");
      
      const data = await response.json();
      toast.success('Assessment updated', 'Successfully updated assessment');
      
      // Update local state
      setAssessments(prev => prev.map(a => 
        a.id === assessmentId ? data.assessment : a
      ));
      
      return data.assessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error('Failed to update assessment', err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const finalizeAssessment = useCallback(async (
    assessmentId: string,
    options: {
      updateDeveloperStatus?: boolean;
      addToTechPool?: boolean;
      suggestedRate?: number;
      comments?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) throw new Error("Failed to finalize assessment");
      
      const data = await response.json();
      toast.success(data.message || "Assessment finalized successfully");
      
      // Update local state
      setAssessments(prev => prev.map(a => 
        a.id === assessmentId ? { ...a, status: "finalized" } : a
      ));
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error('Failed to finalize assessment', err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete assessment");
      
      toast.success('Assessment deleted', 'Successfully deleted assessment');
      
      // Update local state
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error('Failed to delete assessment', err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assessments,
    loading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    finalizeAssessment,
    deleteAssessment,
  };
};
