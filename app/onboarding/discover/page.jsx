import Discovery from "./client";

export const metadata = {
  title: "Discover Kadi Tournaments & Game Modes | Wufwuf Gaming",
  description:
    "Choose your preferred game modes, join tournaments, and set your gaming goals. Start your Kadi journey with AI matches, multiplayer games, or competitive tournaments.",
  keywords: [
    "kadi game modes",
    "card game tournaments",
    "gaming goals",
    "tournament registration",
    "competitive gaming",
    "kadi multiplayer",
    "ai card games",
    "gaming rewards",
    "tournament prizes",
    "esports platform",
    "card game strategy",
    "player rankings",
    "gaming achievements",
    "tournament brackets",
    "gaming community",
  ],
  openGraph: {
    title: "Start Your Kadi Tournament Journey | Wufwuf Gaming",
    description:
      "Choose your path: Practice with AI, challenge players worldwide, or compete in tournaments for prizes. Begin your competitive card gaming adventure today!",
    type: "website",
    images: [
      {
        url: "/images/discovery/tournament-modes.jpg",
        width: 1200,
        height: 630,
        alt: "Wufwuf Kadi Game Modes and Tournaments",
      },
      {
        url: "/images/discovery/tournament-prizes.jpg",
        width: 1200,
        height: 630,
        alt: "Kadi Tournament Prizes and Rewards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose Your Kadi Journey | Wufwuf Gaming",
    description:
      "Discover different game modes, tournaments, and rewards in Kadi card game. Start your gaming adventure!",
    images: ["/images/discovery/tournament-modes.jpg"],
    creator: "@wufwuf",
  },
  alternates: {
    canonical: "https://wufwuf.io/discover",
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  other: {
    "og:game:achievement_type": "tournament_mode",
    "og:game:points": "1000",
    "og:game:reward": "Tournament Entry Tokens",
  },
};

const Page = () => {
  return <Discovery />;
};

export default Page;
