export const formatNumber = (num) => {
  // Check if num is null, undefined, or not a number
  if (num === null || num === undefined || isNaN(num)) {
    return "-"; // You can return any placeholder, like "-", "N/A", or "0"
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
};
