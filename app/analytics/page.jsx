import Analytics from "./client";

export const metadata = {
  title: "Analytics - Wufwuf: Track Your Gaming Performance & Growth",
  description:
    "Monitor your gaming metrics, track revenue, analyze participant engagement, and view tournament statistics in real-time. Get comprehensive insights into your gaming performance with Wufwuf analytics.",
  keywords: [
    "gaming analytics",
    "tournament metrics",
    "player engagement",
    "revenue tracking",
    "participant statistics",
    "gaming performance",
    "wufwuf",
    "tournament analytics",
    "gaming insights"
  ],
  openGraph: {
    title: "Wufwuf Analytics - Track Your Gaming Performance & Growth",
    description:
      "Get comprehensive insights into your gaming metrics, tournament performance, and participant engagement with Wufwuf's analytics dashboard.",
    image: "https://www.wufwuf.io/public/wufwuf_logo_1.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wufwuf Analytics - Track Your Gaming Performance & Growth",
    description: "Get comprehensive insights into your gaming metrics, tournament performance, and participant engagement with Wufwuf's analytics dashboard."
  },
  additionalMetadata: {
    application: "Wufwuf Analytics Dashboard",
    type: "analytics",
    features: [
      "Revenue Analytics",
      "Tournament Tracking",
      "Participant Metrics",
      "Performance Insights",
      "Growth Statistics"
    ]
  },
};

const Page = () => {
  return <Analytics />;
};

export default Page;