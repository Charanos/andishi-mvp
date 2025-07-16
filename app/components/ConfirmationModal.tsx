"use client";

import React from "react";
import { X, AlertTriangle, Check } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  loading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          confirmBg: "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
          iconBg: "bg-red-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          confirmBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30",
          iconBg: "bg-yellow-500/20",
        };
      default:
        return {
          icon: <Check className="w-6 h-6 text-blue-400" />,
          confirmBg: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
          iconBg: "bg-blue-500/20",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="min-h-screen fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer flex-1 px-4 py-2 rounded-lg border transition-colors font-medium text-sm ${styles.confirmBg} ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className={`cursor-pointer flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition-colors font-medium text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
