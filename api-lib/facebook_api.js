export const generateDummyPageEngagement = () => {
  const metrics = [
    "page_fan_adds",
    "page_fan_removes",
    "page_positive_feedback_by_type",
    "page_negative_feedback_by_type",
  ];

  const dummyData = {
    data: [],
  };

  const currentDate = new Date();

  // Generate dummy data for each metric
  metrics.forEach((metric) => {
    const insights = {
      name: metric,
      period: "day",
      values: [],
    };

    // Generate data for the last 30 days
    for (let i = 30; i >= 1; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);

      // Replace this with your random data generation logic for each metric
      const value = Math.floor(Math.random() * 1000);

      insights.values.push({
        value,
        end_time: date.toISOString(),
      });
    }

    dummyData.data.push(insights);
  });

  return dummyData;
};

// Function to generate random data within a range
const getRandomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate dummy data for the specified metrics
const generateDummyData = (numDays) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numDays);

  const data = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const page_fan_adds = getRandomInRange(10, 100);
    const page_fan_removes = getRandomInRange(0, 20);
    const page_positive_feedback = getRandomInRange(50, 200);
    const page_negative_feedback = getRandomInRange(10, 50);
    const page_impressions_unique = getRandomInRange(1000, 5000);
    const page_post_engagements = getRandomInRange(200, 500);

    data.push({
      date: date.toISOString().split("T")[0],
      page_fan_adds,
      page_fan_removes,
      page_positive_feedback,
      page_negative_feedback,
      page_impressions_unique,
      page_post_engagements,
    });
  }

  return data;
};

// Usage example
const numDays = 30;
const dummyData = generateDummyData(numDays);
console.log(dummyData);
