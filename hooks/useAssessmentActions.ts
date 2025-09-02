import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { gradeAssessment, TechnicalMetrics, ProfessionalMetrics } from '@/lib/assessment-grading';

export const useAssessmentActions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Send evaluation invitation
  const sendEvaluationInvite = useCallback(async (
    assessmentId: string,
    evaluatorEmail: string,
    evaluatorName?: string,
    message?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessments/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          evaluatorEmail,
          evaluatorName,
          message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send invitation');
      
      const data = await response.json();
      toast.success('Invitation sent', `Evaluation invitation sent to ${evaluatorEmail}`);
      return data;
    } catch (error) {
      toast.error('Failed to send invitation', error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create auto-assessment
  const createAutoAssessment = useCallback(async (
    developerId: string,
    evaluationType: 'initial' | 'periodic' | 'project_based',
    resumeFile?: File,
    notes?: string
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('developerId', developerId);
      formData.append('evaluationType', evaluationType);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (notes) {
        formData.append('notes', notes);
      }

      const response = await fetch('/api/assessments/auto-assess', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create auto-assessment');
      
      const data = await response.json();
      toast.success('Auto-assessment created', 'Assessment generated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to create auto-assessment', error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Grade assessment
  const gradeAndFinalizeAssessment = useCallback(async (
    assessmentId: string,
    technicalMetrics: TechnicalMetrics,
    professionalMetrics: ProfessionalMetrics,
    yearsOfExperience?: number,
    projectComplexity?: string,
    location?: string
  ) => {
    setLoading(true);
    try {
      // Calculate grades using the grading logic
      const gradingResult = gradeAssessment(
        technicalMetrics,
        professionalMetrics,
        yearsOfExperience,
        projectComplexity,
        location
      );

      // Update assessment with grading results
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicalSkills: {
            overallTechnicalScore: gradingResult.technicalScore,
          },
          professionalSkills: {
            overallProfessionalScore: gradingResult.professionalScore,
          },
          evaluation: {
            overallScore: gradingResult.overallScore,
            recommendation: gradingResult.recommendation,
            techPoolEligible: gradingResult.techPoolEligible,
            suggestedRate: gradingResult.suggestedRate,
            strengths: gradingResult.strengths,
            improvements: gradingResult.improvements,
          },
          status: 'reviewed',
        }),
      });

      if (!response.ok) throw new Error('Failed to grade assessment');
      
      const data = await response.json();
      toast.success('Assessment graded', 'Assessment has been graded and finalized');
      return { ...data, gradingResult };
    } catch (error) {
      toast.error('Failed to grade assessment', error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send assessment results
  const sendAssessmentResults = useCallback(async (
    assessmentId: string,
    recipientEmail: string,
    includeDetailedFeedback: boolean = true
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessments/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          recipientEmail,
          includeDetailedFeedback,
        }),
      });

      if (!response.ok) throw new Error('Failed to send results');
      
      const data = await response.json();
      toast.success('Results sent', `Assessment results sent to ${recipientEmail}`);
      return data;
    } catch (error) {
      toast.error('Failed to send results', error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Resend evaluation invitation
  const resendInvitation = useCallback(async (assessmentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/resend-invite`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to resend invitation');
      
      const data = await response.json();
      toast.success('Invitation resent', 'Evaluation invitation has been resent');
      return data;
    } catch (error) {
      toast.error('Failed to resend invitation', error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    sendEvaluationInvite,
    createAutoAssessment,
    gradeAndFinalizeAssessment,
    sendAssessmentResults,
    resendInvitation,
  };
};
