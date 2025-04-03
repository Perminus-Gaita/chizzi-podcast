// SuccessOnboardingModal.js
"use client";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { setProfile } from "@/app/store/authSlice";
import { store } from "@/app/store";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utility function to wait for state update
const waitForStateUpdate = (predicate, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error("State update timeout"));
    }, timeout);

    // Check immediately first
    if (predicate(store.getState())) {
      clearTimeout(timeoutId);
      resolve();
      return;
    }

    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        unsubscribe();
        clearTimeout(timeoutId);
        resolve();
      }
    });
  });
};

const SuccessOnboardingModal = ({
  openOnboardingModal,
  setShowOnboardingModal,
  redirecting,
  setRedirecting,
  userProfile,
  dispatch,
}) => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleModalClose = useCallback(() => {
    if (redirecting) return;
    setShowOnboardingModal(false);
  }, [redirecting, setShowOnboardingModal]);

  const handleContinueClick = useCallback(async () => {
    try {
      setError(null);
      setRedirecting(true);

      // First, dispatch the action
      dispatch(
        setProfile({
          ...userProfile,
          onboardingStatus: "connect",
        })
      );

      // Wait for the state to be updated
      await waitForStateUpdate(
        (state) => state.auth.profile?.onboardingStatus === "connect",
        5000 // 5 second timeout
      );

      // Use setTimeout to ensure state is fully processed
      setTimeout(() => {
        router.push("/lobby");
      }, 2000);
    } catch (error) {
      console.error("Failed to update state:", error);
      setError("Failed to update profile. Please try again.");
      setRedirecting(false);
    }
  }, [dispatch, userProfile, router, setRedirecting]);

  return (
    <Dialog open={openOnboardingModal} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Welcome aboard Wufwuf!
          </DialogTitle>
          <DialogDescription className="text-center">
            {userProfile?.accountType === "personal" ? (
              <>
                Congratulations 🎉 on completing the onboarding steps! You are
                now ready to participate and engage with your favorite content
                creators.
              </>
            ) : (
              <>
                Congratulations 🎉 on completing the onboarding steps! You are
                now ready to unleash the power of social media with Wufwuf.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 mt-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            onClick={handleContinueClick}
            disabled={redirecting}
            className="w-full sm:w-auto"
          >
            {redirecting ? (
              <>
                <Image
                  src="/buttonloader.svg"
                  width={24}
                  height={24}
                  alt="Loading"
                  className="mr-2"
                />
                Redirecting to dashboard...
              </>
            ) : (
              <>
                Explore Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessOnboardingModal;
