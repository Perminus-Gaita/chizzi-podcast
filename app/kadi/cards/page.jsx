import KadiCards from "./client";

export const metadata = {
  title: "Kadi Rules - Complete Official Game Guide & Rule Book | Wufwuf",
  description:
    "Official Kadi rule book with complete gameplay mechanics, special card powers, and advanced strategies. Master Question Cards, Jump Cards, and winning combinations. Start playing like a pro!",
  keywords: [
    "Kadi rules",
    "Kadi rule book",
    "official card rules",
    "Kadi game mechanics",
    "Question Cards rules",
    "Jump Cards Kadi",
    "Kadi sequence rules",
    "Wufwuf games",
    "card game rules",
    "Kadi winning rules",
  ],
  openGraph: {
    title: "Kadi Official Rules - Master the Game | Wufwuf",
    description:
      "Complete Kadi rule book: Learn all card powers, special moves, and winning strategies. Official guide from Wufwuf - perfect for beginners to experts!",
    type: "article",
    url: "https://www.wufwuf.io/rules",
    image: "https://www.wufwuf.io/public/Kadi/rules-guide.jpg",
    siteName: "Wufwuf Gaming",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kadi Official Rules - Complete Game Guide",
    description:
      "Master Kadi with our official rule book! Learn all special moves, card combinations, and pro strategies. Free comprehensive guide by Wufwuf! #Kadi #CardGames",
    creator: "@Wufwuf",
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
      <KadiCards />
    </>
  );
};

export default Page;
