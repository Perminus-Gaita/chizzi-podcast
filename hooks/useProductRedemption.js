import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useProductRedemption(productId) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const updateRedemptionStatus = useCallback(async (newStatus) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/redeem`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update redemption status');
      }

      const data = await response.json();
      router.refresh();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [productId, router]);

  return {
    updateRedemptionStatus,
    isUpdating,
    error,
  };
}