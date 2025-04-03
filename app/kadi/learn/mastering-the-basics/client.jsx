"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import MeetYourCards from "@/page_components/Cards/Tutorial/MeetYourCards";
import CardPowers from "@/page_components/Cards/Tutorial/CardPowers";
import BasicGameFlow from "@/page_components/Cards/Tutorial/BasicGameFlow";
import FirstGame from "@/page_components/Cards/Tutorial/FirstGame";
import { useIsMobile } from "@/hooks/useIsMobile";
import { setCurrentTutorialModule, init_page } from "@/app/store/pageSlice";
import "../../../../styles/cards.css";

const MasteringTheBasics = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const currentTutorialModule = useSelector(
    (state) => state.page.currentTutorialModule
  );

  const handleMeetYourCardsComplete = () => {
    dispatch(setCurrentTutorialModule("basicGameFlow"));
  };

  const handleBasicGameFlowComplete = () => {
    dispatch(setCurrentTutorialModule("cardPowers"));
  };

  const handleCardPowersComplete = () => {
    dispatch(setCurrentTutorialModule("firstGame"));
  };

  const cardDimensions = {
    width: isMobile ? 75 : 80,
    height: isMobile ? 105 : 112,
  };

  useEffect(() => {
    if (!currentTutorialModule) {
      dispatch(setCurrentTutorialModule("meetYourCards"));
    }
  }, []);

  // set page state
  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Learn Kadi",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

  return (
    <div>
      {currentTutorialModule === "meetYourCards" && (
        <MeetYourCards handleCompleteModule={handleMeetYourCardsComplete} />
      )}

      {currentTutorialModule === "basicGameFlow" && (
        <BasicGameFlow
          handleCompleteModule={handleBasicGameFlowComplete}
          cardDimensions={cardDimensions}
        />
      )}

      {currentTutorialModule === "cardPowers" && (
        <CardPowers
          cardDimensions={cardDimensions}
          handleCompleteModule={handleCardPowersComplete}
        />
      )}

      {currentTutorialModule === "firstGame" && (
        <FirstGame cardDimensions={cardDimensions} />
      )}

      {/* <button onClick={() => console.log(gameRef.current)}>GAME OBJ</button> */}

      {/* <button onClick={() => setCounter(counter + 1)}>RESET</button> */}
    </div>
  );
};

export default MasteringTheBasics;
