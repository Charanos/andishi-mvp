"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

import "react-quill-new/dist/quill.snow.css";
import "./quill-custom.css";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type Mode = "wysiwyg" | "markdown";

export default function RichContentEditor({ value, onChange, placeholder }: Props) {
  const [mode, setMode] = useState<Mode>("wysiwyg");
  const [md, setMd] = useState("");

  // Sync markdown state when switching from html to markdown (best-effort strip tags)
  useEffect(() => {
    if (mode === "markdown") {
      // crude strip html tags
      const stripped = value.replace(/<[^>]+>/g, "");
      setMd(stripped);
    }
  }, [mode]);

  const mdHtml = useMemo(() => {
    return DOMPurify.sanitize(marked.parse(md || "") as string);
  }, [md]);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      {/* Mode switch */}
      <div className="flex text-sm font-medium divide-x divide-gray-700 bg-gray-800">
        {(
          [
            { k: "wysiwyg", label: "WYSIWYG" },
            { k: "markdown", label: "Markdown" },
          ] as { k: Mode; label: string }[]
        ).map(({ k, label }) => (
          <button
            type="button"
            key={k}
            onClick={() => setMode(k)}
            className={`px-4 py-2 flex-1 text-center transition-colors ${
              mode === k ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      {mode === "wysiwyg" ? (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={(html) => onChange(html)}
          placeholder={placeholder}
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          }}
          className="dark quill-dark" // custom dark styles in quill-custom.css
        />
      ) : (
        <div className="flex flex-col md:flex-row">
          <textarea
            value={md}
            onChange={(e) => {
              setMd(e.target.value);
              onChange(DOMPurify.sanitize(marked.parse(e.target.value) as string));
            }}
            placeholder={placeholder}
            className="w-full md:w-1/2 h-64 resize-none bg-gray-900 text-gray-200 p-4 outline-none border-r border-gray-800"
          />
          <div
            className="prose prose-invert max-w-none p-4 overflow-auto md:w-1/2"
            dangerouslySetInnerHTML={{ __html: mdHtml }}
          />
        </div>
      )}
    </div>
  );
}
