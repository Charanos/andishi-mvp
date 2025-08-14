"use client";

import React from 'react';
import './project-rich-content.css';

interface ProjectRichContentRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export default function ProjectRichContentRenderer({ 
  content, 
  className = '', 
  compact = false 
}: ProjectRichContentRendererProps) {
  // Clean and sanitize HTML content
  const sanitizeHtml = (html: string) => {
    // Basic HTML sanitization - in production, consider using a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizedContent = sanitizeHtml(content || '');
  const compactClass = compact ? 'compact' : '';

  return (
    <div 
      className={`project-rich-content ${compactClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
