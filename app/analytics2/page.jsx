import Analytics from "./client";

export const metadata = {
  title: "Analytics: Wufwuf - Track Social Media Performance",
  description:
    "Dive deep into insightful analytics for Facebook, Instagram, YouTube, TikTok, and giveaway campaigns with Wufwuf.io's comprehensive reporting tools.",
  keywords: [
    "social media analytics",
    "instagram analytics",
    "facebook analytics",
    "youtube analytics",
    "tiktok analytics",
    "giveaway analytics",
    "social media marketing",
    "social media reporting",
    "wufwuf",
  ],
  openGraph: {
    title:
      "Schedule and post across multiple social media platforms with one click at Wufwuf.io",
    description:
      "Wufwuf.io is an online platform that allows you to schedule and post across multiple social media platforms with one click!",
    image: "https://www.wufwuf.io/public/wufwuf_logo_1.png", // Assuming the image path remains the same
  },
  twitter: {
    // Add Twitter-specific metadata if needed
  },
  additionalMetadata: {
    // Add any other relevant metadata here
  },
};

const Page = () => {
  return <Analytics />;
};

export default Page;
