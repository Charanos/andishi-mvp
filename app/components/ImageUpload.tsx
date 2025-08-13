"use client";

import React, { useState, useRef } from "react";
import { FaUpload, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import ToastNotification from "@/app/components/ToastNotification";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (imageUrl: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  accept?: string;
  type?: 'cover' | 'author';
}

export default function ImageUpload({
  label,
  value,
  onChange,
  placeholder = "Upload an image...",
  icon = <FaImage />,
  accept = "image/*",
  type = 'cover'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({type: 'error', message: 'Please select a valid image file'});
      setTimeout(() => setToast(null), 5000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({type: 'error', message: 'File size must be less than 5MB'});
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload to Cloudinary via our API endpoint
      const response = await fetch('/api/image-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onChange(result.url);
        setToast({type: 'success', message: 'Image uploaded successfully!'});
        setTimeout(() => setToast(null), 5000);
      } else {
        const error = await response.json();
        setToast({type: 'error', message: error.message || 'Upload failed'});
        setTimeout(() => setToast(null), 5000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({type: 'error', message: 'Upload failed. Please try again.'});
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
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="absolute top-4 right-4 z-50">
              <ToastNotification 
                notification={{
                  id: 'image-upload-toast',
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
              <img
                src={value}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm font-medium">Image uploaded</p>
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
