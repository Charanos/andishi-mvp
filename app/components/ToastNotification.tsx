"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const duration = notification.duration || 5000;
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          bgColor: "bg-green-500/20 border-green-500/30",
          iconBg: "bg-green-500/20",
        };
      case "error":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          bgColor: "bg-red-500/20 border-red-500/30",
          iconBg: "bg-red-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
          bgColor: "bg-yellow-500/20 border-yellow-500/30",
          iconBg: "bg-yellow-500/20",
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bgColor: "bg-blue-500/20 border-blue-500/30",
          iconBg: "bg-blue-500/20",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        transform transition-all z-[9999] duration-300 ease-in-out
        ${
          isVisible && !isExiting
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        ${styles.bgColor}
        backdrop-blur-md border rounded-lg p-4 mb-3 shadow-lg
        max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`${styles.iconBg} rounded-full p-1 flex-shrink-0`}>
          {styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
          )}

          {/* Action Button */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
