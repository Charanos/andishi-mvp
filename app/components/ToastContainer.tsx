"use client";

import React from "react";
import ToastNotification, { ToastNotification as ToastType } from "./ToastNotification";

interface ToastContainerProps {
  notifications: ToastType[];
  onRemoveNotification: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemoveNotification,
  position = "top-right",
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      default:
        return "top-4 right-4";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionStyles()} z-[9999] pointer-events-none`}>
      <div className="pointer-events-auto space-y-2">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={onRemoveNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
