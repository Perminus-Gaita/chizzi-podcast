"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

const ScenarioComplete = ({ scenario, points, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card max-w-md w-full mx-4 rounded-xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-primary/10">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Module Complete!</h2>
          <p className="text-muted-foreground">{scenario.title}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">{points} points earned</span>
        </div>

        <div className="pt-4">
          <Button onClick={onContinue} className="w-full">
            Continue to Next Module
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
export default ScenarioComplete;
