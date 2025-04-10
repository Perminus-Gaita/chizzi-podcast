import TwentyFortyEight from "./client";

export const metadata = {
  metadataBase: new URL("https://wufwuf.io"),
  title: {
    default: "Play 2048 Online - Merge & Win | Wufwuf Gaming",
    template: "%s | Wufwuf Gaming",
  },
  description:
    "Play 2048 online for free on Wufwuf Gaming! Merge numbers, strategize your moves, and reach 2048 in this addictive puzzle game. Challenge yourself now!",

  keywords: [
    "2048 game online",
    "play 2048",
    "free puzzle games",
    "merge numbers game",
    "2048 strategy tips",
    "brain games online",
    "best puzzle games",
    "Wufwuf 2048",
    "casual number games",
    "logic puzzle games",
    "tile matching games",
    "play 2048 for free",
    "addictive number games",
    "strategy puzzle",
    "classic 2048 game",
    "2048 high score",
    "best online puzzle games",
    "fun brain teasers",
    "tile merge game",
    "play and win 2048",
  ],

  openGraph: {
    type: "website",
    siteName: "Wufwuf Gaming",
    title: "Play 2048 Online - Merge & Win | Wufwuf Gaming",
    description:
      "Enjoy 2048 online on Wufwuf Gaming! Merge tiles, strategize your moves, and reach the legendary 2048 tile. Play for free and challenge your brain!",
    images: [
      {
        url: "/images/2048-game.jpg",
        width: 1200,
        height: 630,
        alt: "2048 Puzzle Game on Wufwuf",
      },
    ],
    locale: "en_US",
    url: "https://wufwuf.io/2048",
  },

  twitter: {
    card: "summary_large_image",
    site: "@wufwuf",
    title: "Play 2048 & Challenge Your Brain 🧠🎮",
    description:
      "Test your puzzle skills with 2048 on Wufwuf! Merge tiles, strategize, and aim for the ultimate 2048 tile. Play now for free!",
    images: ["/images/2048-game.jpg"],
  },

  alternates: {
    canonical: "https://wufwuf.io/2048",
    languages: {
      "en-US": "https://wufwuf.io/en-US/2048",
    },
  },

  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    nocache: true,
  },

  // Additional structured data for 2048 gameplay
  other: {
    "game-genre": "puzzle",
    "play-mode": "single-player",
    "difficulty-level": "medium",
    "game-platforms": "web",
    "best-strategy": "corner stacking",
    "high-score-tips": "merge smaller numbers first",
  },
};

const Page = () => {
  return <TwentyFortyEight />;
};

export default Page;
