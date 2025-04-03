"use client";

import JumpCardTiming from "@/page_components/Cards/Tutorial/FundamentalsII/JumpCardTiming";
import KickbackStrategy from "@/page_components/Cards/Tutorial/FundamentalsII/KickbackStrategy";
import PenaltyCardDefense from "@/page_components/Cards/Tutorial/FundamentalsII/PenaltyCardDefense";
import AceCardControl from "@/page_components/Cards/Tutorial/FundamentalsII/AceCardControl";

const Learn = () => {
  return (
    <>
      <h1>Jump Card Timing</h1>
      <JumpCardTiming />

      <h1>Kickback Strategy</h1>
      <KickbackStrategy />

      <h1>Penalty Card Defenses</h1>
      <PenaltyCardDefense />

      <h1>Ace Card Control</h1>
      <AceCardControl />
    </>
  );
};

export default Learn;
