"use client";

import { useState, useCallback } from "react";
import { ToastNotification } from "../app/components/ToastNotification";

export const useToast = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [counter, setCounter] = useState(0);

  const addNotification = useCallback((notification: Omit<ToastNotification, "id">) => {
    setCounter((prevCounter) => prevCounter + 1);
    const id = `${Date.now()}-${counter}`;
    const newNotification: ToastNotification = {
      id,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "success", title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "error", title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "warning", title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      addNotification({ type: "info", title, message, duration }),
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    toast,
  };
};

export default useToast;
