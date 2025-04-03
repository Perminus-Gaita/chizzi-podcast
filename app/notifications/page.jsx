import Notifications from "./client";

export const metadata = {
  title: "Notifications | Wufwuf: Real-Time Tournament & Game Alerts",
  description:
    "Stay updated with real-time notifications for tournament matches, game challenges, prize announcements, and player achievements. Never miss important Kadi game updates, tournament registrations, or sponsored event notifications.",

  keywords: [
    "tournament notifications",
    "game alerts",
    "kadi tournament updates",
    "prize notifications",
    "gaming achievements",
    "tournament registration alerts",
    "match reminders",
    "sponsored tournament alerts",
    "player challenge notifications",
    "gaming rewards updates",
    "tournament bracket alerts",
    "game invitations",
    "competitive gaming updates",
    "live match notifications",
    "tournament schedule alerts",
  ],

  openGraph: {
    type: "website",
    title: "Real-Time Tournament & Gaming Notifications | Wufwuf Kadi",
    description:
      "Get instant notifications for tournament matches, challenges, and prizes. Stay connected with the Wufwuf Kadi gaming community through real-time updates and alerts.",
    images: [
      {
        url: "/images/notifications-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Wufwuf Gaming Notifications",
        type: "image/jpeg",
      },
    ],
    siteName: "Wufwuf Kadi",
  },

  twitter: {
    card: "summary_large_image",
    title: "Wufwuf Gaming Notifications & Alerts",
    description:
      "Real-time updates for Kadi tournaments, matches, and gaming achievements. Stay connected with the Wufwuf gaming community.",
    images: ["/images/notifications-preview.jpg"],
    creator: "@wufwuf",
  },

  alternates: {
    canonical: "https://wufwuf.io/notifications",
  },

  other: {
    "notification-platform": "gaming-tournaments",
    "notification-types": "tournaments,matches,achievements,prizes",
    "update-frequency": "real-time",
    "mobile-notifications": "enabled",
  },

  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};
const Page = () => {
  return <Notifications />;
};

export default Page;
