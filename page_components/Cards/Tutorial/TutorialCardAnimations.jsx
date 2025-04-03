"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { completeAnimation } from "@/app/store/animationSlice";

// CardAnimation Component - Handles the actual card movement animation
const TutorialCardAnimations = () => {
  const dispatch = useDispatch();
  const activeAnimations = useSelector(
    (state) => state.animation.activeAnimations
  );

  return (
    <>
      {activeAnimations.map(
        ({ id, value, sourceRect, targetRect, onComplete }) => (
          <motion.div
            key={id}
            className="absolute pointer-events-none"
            initial={{
              x: sourceRect.x,
              y: sourceRect.y,
              width: sourceRect.width,
              height: sourceRect.height,
              opacity: 1,
              zIndex: 9,
            }}
            animate={{
              x: targetRect.x,
              y: targetRect.y,
              width: targetRect.width,
              height: targetRect.height,
              opacity: 1,
              zIndex: 9,
            }}
            transition={{
              type: "spring",
              duration: 0.5,
              bounce: 0.2,
            }}
            onAnimationComplete={() => {
              dispatch(completeAnimation(id));
              onComplete?.();
            }}
          >
            <img
              src={`/cards/${value}.png`}
              alt={value}
              className="w-full h-full rounded-lg shadow-lg"
              draggable={false}
            />
          </motion.div>
        )
      )}
    </>
  );
};

export default TutorialCardAnimations;
