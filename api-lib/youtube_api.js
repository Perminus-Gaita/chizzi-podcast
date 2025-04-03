export const calculateAverageEngagement = (data) => {
  const { likes, views, comments } = data || {};

  // Calculate the total sum of likes, views, and comments
  const totalLikes = likes?.reduce((sum, like) => sum + like, 0);
  const totalViews = views?.reduce((sum, view) => sum + view, 0);
  const totalComments = comments?.reduce((sum, comment) => sum + comment, 0);

  // Calculate the average engagement rate
  const averageEngagementRate =
    ((totalLikes + totalComments) / totalViews) * 100;

  return averageEngagementRate.toFixed(0); // Return the average engagement rate rounded to 2 decimal places
};

export const calculateAverageRetention = (viewsData) => {
  const retentionValues = [];

  for (let i = 1; i < viewsData?.length; i++) {
    const currentViews = viewsData[i].views;
    const previousViews = viewsData[i - 1].views;

    const retention = currentViews / previousViews;
    retentionValues.push(retention);
  }

  const sumRetention = retentionValues.reduce(
    (sum, retention) => sum + retention,
    0
  );
  const averageRetention = sumRetention / retentionValues.length;

  return averageRetention;
};
