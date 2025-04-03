import KadiGlossary from "./client";

export const metadata = {
  title: "Kadi Glossary - Complete Card Game Dictionary & Terminology | Wufwuf",
  description:
    "Master Kadi terminology with our comprehensive glossary. Learn game-specific terms, card combinations, and pro vocabulary. From 'Niko Kadi' to Question Card sequences - understand every term!",
  keywords: [
    "Kadi glossary",
    "Kadi terminology",
    "card game terms",
    "Niko Kadi meaning",
    "Kadi dictionary",
    "Question Card terms",
    "Kadi vocabulary",
    "Wufwuf games",
    "card game glossary",
    "Kadi special terms",
  ],
  openGraph: {
    title: "Kadi Glossary - Master Game Terminology | Wufwuf",
    description:
      "Complete Kadi dictionary: Every game term explained, from basic vocabulary to advanced gameplay terminology. Essential guide for all players from Wufwuf!",
    type: "article",
    url: "https://www.wufwuf.io/glossary",
    image: "https://www.wufwuf.io/public/kadi/glossary-guide.jpg",
    siteName: "Wufwuf Gaming",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kadi Glossary - Complete Game Dictionary",
    description:
      "Learn every Kadi term! From basic rules to pro terminology, master the game language. Comprehensive glossary by Wufwuf! #Kadi #CardGames",
    creator: "@Wufwuf",
    images: ["https://www.wufwuf.io/public/kadi/glossary-guide.jpg"],
  },
  alternates: {
    canonical: "https://www.wufwuf.io/glossary",
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
      <KadiGlossary />
    </>
  );
};

export default Page;
