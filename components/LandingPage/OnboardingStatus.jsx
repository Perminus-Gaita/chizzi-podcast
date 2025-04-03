"use client";
import { useSelector } from "react-redux";
import { getOnboardingStatus } from "@/utils/onboarding";
import { useEffect } from "react";

const OnboardingStatus = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  useEffect(() => {
    if (userProfile) {
      if (
        userProfile?.onboardingStatus === "discover" &&
        userProfile?.discovery === null
      ) {
        getOnboardingStatus(userProfile?.onboardingStatus);
      }
    }
  }, [userProfile]);

  return;
};

export default OnboardingStatus;
