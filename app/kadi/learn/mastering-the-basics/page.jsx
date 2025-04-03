import MasteringTheBasics from "./client";

export const metadata = {
  title:
    "Mastering Kadi Basics - Interactive Tutorial & Card Powers Guide | WufWuf",
  description:
    "Learn Kadi fundamentals through our interactive tutorial. Master card powers, basic gameplay mechanics, and essential strategies. Perfect for beginners with step-by-step guidance and practice scenarios.",
  keywords: [
    "Kadi tutorial",
    "learn Kadi",
    "Kadi basics",
    "Kadi card powers",
    "Kadi for beginners",
    "how to play Kadi",
    "interactive card game tutorial",
    "WufWuf games tutorial",
    "Kadi game guide",
    "learn card powers",
  ],
  openGraph: {
    title: "Kadi Official Rules - Master the Game | WufWuf",
    description:
      "Complete Kadi rule book: Learn all card powers, special moves, and winning strategies. Official guide from WufWuf - perfect for beginners to experts!",
    type: "article",
    url: "https://www.wufwuf.io/rules",
    image: "https://www.wufwuf.io/public/Kadi/rules-guide.jpg",
    siteName: "WufWuf Gaming",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kadi Official Rules - Complete Game Guide",
    description:
      "Master Kadi with our official rule book! Learn all special moves, card combinations, and pro strategies. Free comprehensive guide by WufWuf! #Kadi #CardGames",
    creator: "@WufWuf",
    images: ["https://www.wufwuf.io/public/Kadi/rules-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.wufwuf.io/rules",
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
      <MasteringTheBasics />
    </>
  );
};

export default Page;
