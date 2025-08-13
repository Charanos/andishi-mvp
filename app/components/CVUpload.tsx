"use client";

import React, { useState, useRef } from "react";
import { FaUpload, FaFile, FaTimes, FaSpinner } from "react-icons/fa";
import ToastNotification from "@/app/components/ToastNotification";

interface CVUploadProps {
  label: string;
  value?: string;
  onChange: (cvUrl: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  accept?: string;
}

export default function CVUpload({
  label,
  value,
  onChange,
  placeholder = "Upload your CV...",
  icon = <FaFile />,
  accept = ".pdf,.doc,.docx,.txt"
}: CVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setToast({type: 'error', message: 'Please upload a valid CV file (PDF, DOC, DOCX, or TXT)'});
      setTimeout(() => setToast(null), 5000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToast({type: 'error', message: 'File size must be less than 10MB'});
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Cloudinary via our API endpoint
      const response = await fetch('/api/cv-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onChange(result.url);
        setToast({type: 'success', message: 'CV uploaded successfully!'});
        setTimeout(() => setToast(null), 5000);
      } else {
        const error = await response.json();
        setToast({type: 'error', message: error.message || 'CV upload failed'});
        setTimeout(() => setToast(null), 5000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({type: 'error', message: 'CV upload failed. Please try again.'});
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
        {icon}
        <span>{label}</span>
      </label>

      <div className="space-y-3">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {isUploading ? (
              <FaSpinner className="text-2xl text-blue-400 animate-spin" />
            ) : (
              <FaUpload className="text-2xl text-gray-400" />
            )}
            
            <div className="text-center">
              <p className="text-gray-300 font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="absolute top-4 right-4 z-50">
              <ToastNotification 
                notification={{
                  id: 'cv-upload-toast',
                  type: toast.type,
                  title: toast.type === 'success' ? 'Success' : 'Error',
                  message: toast.message
                }}
                onClose={() => setToast(null)}
              />
            </div>
          )}
        </div>

        {/* Preview */}
        {value && !isUploading && (
          <div className="relative">
            <div className="flex items-center space-x-3 p-3 bg-black/30 border border-gray-600 rounded-lg">
              <FaFile className="text-2xl text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm font-medium">CV uploaded</p>
                <p className="text-gray-500 text-xs truncate">{value}</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
