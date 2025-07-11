import { useState } from 'react';

interface PaymentActionData {
  action: 'approve' | 'reject';
  projectId: string;
  paymentId: string;
  rejectionReason?: string;
}

interface PaymentActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export function usePaymentActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performPaymentAction = async (actionData: PaymentActionData): Promise<PaymentActionResult> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payment-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(actionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform payment action');
      }

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (projectId: string, paymentId: string): Promise<PaymentActionResult> => {
    return performPaymentAction({
      action: 'approve',
      projectId,
      paymentId,
    });
  };

  const rejectPayment = async (projectId: string, paymentId: string, rejectionReason: string): Promise<PaymentActionResult> => {
    return performPaymentAction({
      action: 'reject',
      projectId,
      paymentId,
      rejectionReason,
    });
  };

  return {
    loading,
    error,
    approvePayment,
    rejectPayment,
  };
}
