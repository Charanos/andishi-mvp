"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const DEV_USERS = [
  { email: "admin@test.com", role: "Admin", password: "password123" },
  { email: "client@test.com", role: "Client", password: "password123" },
  { email: "dev@test.com", role: "Developer", password: "password123" },
];

export default function DevLoginHelper() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleQuickLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-lg font-bold mb-2">🔧 Dev Login Helper</h3>
      <p className="text-sm text-gray-300 mb-3">Quick login for development</p>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {DEV_USERS.map((user) => (
          <button
            key={user.email}
            onClick={() => handleQuickLogin(user.email, user.password)}
            disabled={isLoading}
            className="w-full text-left p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-sm"
          >
            <div className="font-medium">{user.role}</div>
            <div className="text-gray-400 text-xs">{user.email}</div>
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Password for all:{" "}
        <code className="bg-gray-700 px-1 rounded">password123</code>
      </div>
    </div>
  );
}
