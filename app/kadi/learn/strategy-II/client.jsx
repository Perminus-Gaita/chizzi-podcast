"use client";

import AdvancedAcePlays from "@/page_components/Cards/Tutorial/StrategyII/AdvancedAcePlays";
import ComplexQuestionSequences from "@/page_components/Cards/Tutorial/StrategyII/ComplexQuestionSequences";
import ReadingOpponents from "@/page_components/Cards/Tutorial/StrategyII/ReadingOpponents";
import SettingUpNikoKadi from "@/page_components/Cards/Tutorial/StrategyII/SettingUpNikoKadi";

const Learn = () => {
  return (
    <>
      <h1>Advanced Ace Plays</h1>
      <AdvancedAcePlays />

      <h1>Complex Question Sequences</h1>
      <ComplexQuestionSequences />

      <h1>Reading Opponents</h1>
      <ReadingOpponents />

      <h1>Setting up Niko Kadi</h1>
      <SettingUpNikoKadi />
    </>
  );
};

export default Learn;
