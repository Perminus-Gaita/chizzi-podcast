import { Suspense } from "react";
import Matches from "./client";
import LobbyLoader from "@/page_components/Lobby/LobbyLoader";

export const metadata = {
  title: "Matches - Active Games & Matches | Wufwuf",
  description:
    "Manage all your active kadi matches in one place. Track tournament matches, casual games, and upcoming challenges. Never miss your turn with real-time notifications on Wufwuf.",
  keywords: [
    "KingKadi matches",
    "active games",
    "card tournaments",
    "game management",
    "multiplayer matches",
    "tournament tracking",
    "card game tournaments",
    "Wufwuf gaming",
    "live card games",
    "competitive gaming",
  ],
  openGraph: {
    title: "Manage Your KingKadi Matches & Tournaments | Wufwuf",
    description:
      "Keep track of all your active KingKadi games, tournament matches, and upcoming challenges in one centralized dashboard. Play smarter with real-time game management on Wufwuf.",
    image: "https://www.wufwuf.io/public/kingkadi/matches_dashboard.jpg",
  },
  twitter: {
    title: "Track Your KingKadi Matches & Tournaments | Wufwuf",
    description:
      "Never miss a turn! Manage all your KingKadi matches, track tournament progress, and get real-time notifications. Play multiple games simultaneously on Wufwuf. #KingKadi #CardGaming",
  },
};

const Page = () => {
  return (
    <Suspense fallback={<LobbyLoader />}>
      <Matches />
    </Suspense>
  );
};

export default Page;
