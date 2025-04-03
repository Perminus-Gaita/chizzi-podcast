import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { createNotification } from "@/app/store/notificationSlice";

export function useMpesaDeposit() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const userProfile = useSelector((state) => state.auth.profile);

  const initiateDeposit = async (amount) => {
    if (!amount || amount <= 0) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Please enter a valid amount",
        })
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/payments/deposit/paystack", {
        amount: Number(amount) * 100,
        currency: "KES",
        transactionBelongsTo: userProfile?.type,
        callbackUrl: `${window.location.origin}/wallet`,
      });

      if (!response.data.authorizationUrl) {
        throw new Error("No authorization URL received");
      }

      // Redirect to payment page
      window.location.href = response.data.authorizationUrl;
    } catch (error) {
      console.error("Deposit error:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: error.response?.data?.message || "Failed to process deposit",
        })
      );
      setLoading(false);
    }
  };

  return {
    loading,
    initiateDeposit,
  };
}
