'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from "react";
import BlogImage from "./BlogImage";
import "./rich-content-enhanced.css";

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
      className={`prose max-w-none prose-gray dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-300 prose-li:text-gray-800 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-blue-700 dark:prose-a:text-blue-400 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-pre:text-gray-100 ${
        enhanced ? 'rich-content-enhanced' : ''
      }`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
