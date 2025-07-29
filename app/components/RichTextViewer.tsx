'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from "react";
import BlogImage from "./BlogImage";

interface RichTextViewerProps {
  html: string;
  enhanced?: boolean;
}

export default function RichTextViewer({ html, enhanced = false }: RichTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Post-process images for performance and optimization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
    imgs.forEach((img) => {
      // Apply optimization attributes
      img.loading = "lazy";
      img.decoding = "async";
      
      // Set maximum width and responsive classes
      img.classList.add("max-w-full", "h-auto", "rounded-lg");
      
      // Set maximum dimensions to prevent oversized images
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      
      // For very large images, set a reasonable maximum height
      img.style.maxHeight = "600px";
      img.style.objectFit = "contain";
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
