export const getOnboardingStatus = (onboardingStatus) => {
  switch (onboardingStatus) {
    case "discover":
      return "/onboarding/discover";
    case "done":
      return "/arena";
    default:
      return null;
  }
};
