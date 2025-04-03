export const getOnboardingStatus = (onboardingStatus) => {
  switch (onboardingStatus) {
    case "discover":
      return "/onboarding/discover";
    case "done":
      return "/lobby";
    default:
      return null;
  }
};
