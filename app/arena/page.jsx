import { Suspense } from "react";
import Arena from "./client";
// import Arena from "./client1";
import ArenaLoader from "@/page_components/Arena/ArenaLoader";

export const metadata = {
  title:
    "Arena - Wufwuf : Play KingKadi - The Fun & Fast-Paced Card Game - Wufwuf",
  description:
    "Challenge your friends and family to a thrilling game of KingKadi! Join or create a room and experience the excitement on Wufwuf, the all-in-one social media and gaming platform.",
  keywords: [
    "KingKadi",
    "card game",
    "multiplayer",
    "social",
    "gaming",
    "friends",
    "family",
    "fast-paced",
    "fun",
    "Wufwuf",
    "social media",
  ],
  openGraph: {
    title: "Unleash the King in You - Play KingKadi on Wufwuf",
    description:
      "KingKadi, the exciting card game, is now available on Wufwuf! Join or create a room, challenge your friends, and have a blast. Play while you manage your social media with Wufwuf.",
    image: "https://www.wufwuf.io/public/kingkadi/kingkadi_arena_image.jpg", // Replace with KingKadi-specific image
  },
  twitter: {
    title: "KingKadi: The Card Game You Can't Miss! Play Now on Wufwuf",
    description:
      "Calling all card game enthusiasts! KingKadi has arrived on Wufwuf. Join the fun, challenge your friends, and manage your social media all in one place. #KingKadi #Wufwuf #CardGames",
  },
  additionalMetadata: {
    // Add any other relevant metadata here, such as game category, target audience, etc.
  },
};

const Page = () => {
  return (
    <Suspense fallback={<ArenaLoader />}>
      <Arena />
    </Suspense>
  );
};

export default Page;
