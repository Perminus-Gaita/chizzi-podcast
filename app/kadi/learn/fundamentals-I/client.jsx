"use client";

import SingleCardPlay from "@/page_components/Cards/Tutorial/FundamentalsI/SingleCardPlay";
import QuestionAnswerPairs from "@/page_components/Cards/Tutorial/FundamentalsI/QuestionAnswerPairs";
import SimpleCardSequences from "@/page_components/Cards/Tutorial/FundamentalsI/SimpleCardSequences";
import HandManagement from "@/page_components/Cards/Tutorial/FundamentalsI/HandManagement";

const Learn = () => {
  return (
    <>
      <h1>Single Card Play</h1>
      <SingleCardPlay />

      <h1>Basic Question Answer Pairs</h1>
      <QuestionAnswerPairs />

      <h1>Simple Card Sequences</h1>
      <SimpleCardSequences />

      <h1>Hand Management</h1>
      <HandManagement />
    </>
  );
};

export default Learn;
