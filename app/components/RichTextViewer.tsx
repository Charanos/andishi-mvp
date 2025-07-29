'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from "react";

interface RichTextViewerProps {
  html: string;
  enhanced?: boolean;
}

export default function RichTextViewer({ html, enhanced = false }: RichTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Post-process images for performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
    imgs.forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.classList.add("max-w-full", "h-auto", "rounded-lg");
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-invert max-w-none ${
        enhanced ? 'rich-content-enhanced' : ''
      }`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
