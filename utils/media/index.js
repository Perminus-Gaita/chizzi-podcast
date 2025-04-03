export const getCompatiblePlatformTypes = (platformCompatibility) => {
  if (!platformCompatibility || typeof platformCompatibility !== "object") {
    return [];
  }

  const compatiblePlatformTypes = [];

  Object.keys(platformCompatibility).forEach((platform) => {
    const compatibility = platformCompatibility[platform];
    if (compatibility && typeof compatibility === "object") {
      Object.keys(compatibility).forEach((postType) => {
        if (compatibility[postType]) {
          // Combine platform name and post type (e.g., facebookVideo)
          compatiblePlatformTypes.push(
            `${platform.charAt(0).toUpperCase() + platform.slice(1)}${
              postType.charAt(0).toUpperCase() + postType.slice(1)
            }`
          );
        }
      });
    }
  });

  return compatiblePlatformTypes;
};
