"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import DeveloperEvaluationForm from "../DeveloperEvaluationForm";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  return (
    <DeveloperEvaluationForm 
      assessmentId={assessmentId}
      onComplete={() => router.push("/admin-dashboard/assessments")}
    />
  );
}
