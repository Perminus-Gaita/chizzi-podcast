import KadiStrategies from "./client";

export const metadata = {
  title:
    "Kadi Strategies - Pro Tips, Winning Tactics & Advanced Guide | Wufwuf",
  description:
    "Master Kadi with proven strategies from top players. Learn advanced card sequences, winning combinations, and tournament-tested tactics. From beginner tips to pro techniques!",
  keywords: [
    "Kadi strategies",
    "Kadi winning tactics",
    "card game strategy",
    "Kadi pro tips",
    "advanced Kadi guide",
    "Question Card strategy",
    "Kadi tournament tips",
    "Wufwuf games",
    "Kadi winning combos",
    "how to win Kadi",
  ],
  openGraph: {
    title: "Kadi Strategy Guide - Pro Tips & Winning Tactics | Wufwuf",
    description:
      "Dominate Kadi with expert strategies! Learn pro sequences, card management, and winning combinations. Complete strategy guide from beginner to tournament level!",
    type: "article",
    url: "https://www.wufwuf.io/strategies",
    image: "https://www.wufwuf.io/public/Kadi/strategy-guide.jpg",
    siteName: "Wufwuf Gaming",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kadi Strategy Guide - Master the Game",
    description:
      "Level up your Kadi game! Pro strategies, winning combinations, and expert tips from top players. Free comprehensive guide by Wufwuf! #Kadi #CardGames",
    creator: "@Wufwuf",
    images: ["https://www.wufwuf.io/public/Kadi/strategy-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.wufwuf.io/strategies",
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
      <KadiStrategies />
    </>
  );
};

export default Page;
