export const getImpressions = (data) => {
  const weeklyImpressions = data.find((insight) => insight.period === "week");

  const weeklyValues = weeklyImpressions.values;

  const totalImpressionsPastWeek = weeklyValues.reduce(
    (total, value) => total + value.value,
    0
  );

  return totalImpressionsPastWeek;
};

export const getReachImpressions = (data) => {
  const metrics = {
    reach: 0,
    impressions: 0,
  };

  data.forEach((item) => {
    if (item.name === "reach" || item.name === "impressions") {
      item.values.forEach((value) => {
        metrics[item.name] += value.value;
      });
    }
  });

  return metrics;
};

export const getWeeklyRange = () => {
  const currentDate = new Date();

  // Calculate the start of the last week (7 days ago)
  const startOfLastWeek = new Date(currentDate);
  startOfLastWeek.setDate(currentDate.getDate() - 7);

  // Convert dates to UNIX timestamps (in seconds)
  const startTimestamp = Math.floor(startOfLastWeek.getTime() / 1000);
  const endTimestamp = Math.floor(currentDate.getTime() / 1000);

  return { startTimestamp, endTimestamp };
};

export const getProfileVisits = (data) => {
  const profileViewsData = data.find((item) => item.name === "profile_views");

  if (!profileViewsData || !profileViewsData.values) {
    return 0;
  }

  const lastWeekProfileViews = profileViewsData.values.reduce(
    (total, value) => total + value.value,
    0
  );

  return lastWeekProfileViews;
};
