import HowToPlayKadi from "./client";

export const metadata = {
  title: "How to Play KingKadi - Simple Rules & Strategy Guide | Wufwuf",
  description:
    "Learn how to play KingKadi in minutes! Our easy guide covers all game rules, special card powers, and winning strategies. Perfect for beginners and families. Download and start playing today!",
  keywords: [
    "how to play KingKadi",
    "KingKadi rules",
    "card game guide",
    "KingKadi tutorial",
    "multiplayer card game",
    "family card games",
    "KingKadi strategy",
    "Wufwuf games",
    "card game instructions",
    "learn KingKadi",
  ],
  openGraph: {
    title: "How to Play KingKadi - Simple 5-Minute Guide | Wufwuf",
    description:
      "Master KingKadi in minutes! Download our free game, learn the rules, and challenge friends to this exciting multiplayer card game. Perfect for game nights!",
    type: "article",
    url: "https://www.wufwuf.io/how-to-play-kingkadi",
    image: "https://www.wufwuf.io/public/kingkadi/how-to-play-guide.jpg",
    siteName: "Wufwuf Gaming",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn KingKadi in 5 Minutes - Free Card Game Guide",
    description:
      "Quick & easy guide to playing KingKadi! Learn special moves, card powers, and winning strategies. Download free and start playing today! #KingKadi #CardGames",
    creator: "@Wufwuf",
    images: ["https://www.wufwuf.io/public/kingkadi/how-to-play-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.wufwuf.io/how-to-play-kingkadi",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const Page = () => {
  return (
    <>
      <HowToPlayKadi />
    </>
  );
};

export default Page;
