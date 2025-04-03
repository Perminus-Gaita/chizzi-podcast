"use client";

import BuildingQuestionSequence from "@/page_components/Cards/Tutorial/StrategyI/BuildingQuestionSequences";
import HandManagementII from "@/page_components/Cards/Tutorial/StrategyI/HandManagementII";
import MultiCardPlays from "@/page_components/Cards/Tutorial/StrategyI/MultiCardPlays";
import PenaltyCardChains from "@/page_components/Cards/Tutorial/StrategyI/PenaltyCardChains";

const Learn = () => {
  return (
    <>
      <h1>Multi Card plays</h1>
      <MultiCardPlays />

      <h1>Building Question Sequences</h1>
      <BuildingQuestionSequence />

      <h1>Penalty Card Chains</h1>
      <PenaltyCardChains />

      <h1>Hand Management II</h1>
      <HandManagementII />
    </>
  );
};

export default Learn;
