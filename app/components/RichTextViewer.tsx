'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextViewerProps {
  html: string;
}

export default function RichTextViewer({ html }: RichTextViewerProps) {
  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
