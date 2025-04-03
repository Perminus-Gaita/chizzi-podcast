"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, ChevronRight, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CompletionScreen = ({
  showCompletion,
  setShowCompletion,
  points,
  completedScenarios,
  handleCompleteModule,
}) => {
  return (
    <AnimatePresence mode="wait">
      {showCompletion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] mx-4 flex flex-col items-center justify-center 
                    space-y-6 p-8 bg-white dark:bg-gray-900 
                    rounded-2xl shadow-xl text-black dark:text-white"
          >
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-8 md:w-16 h-8 md:h-16 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 ">
                Powers Mastered
              </Badge>
            </div>

            <h2 className="text-xl md:text-2xl sm:text-3xl font-bold text-center">
              Card Powers Complete!
            </h2>

            <div className="flex items-center gap-2 text-lg">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-medium">{points} / 8 points earned</span>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                You've mastered all card powers! Time to put your skills to the
                test in real gameplay scenarios.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {completedScenarios.has("answer-cards") && (
                  <Badge variant="outline" className="bg-primary/5">
                    Answer Cards
                  </Badge>
                )}
                {completedScenarios.has("question-pairs") && (
                  <Badge variant="outline" className="bg-primary/5">
                    Question Pairs
                  </Badge>
                )}
                {completedScenarios.has("jump-card") && (
                  <Badge variant="outline" className="bg-primary/5">
                    Jump Cards
                  </Badge>
                )}
                {completedScenarios.has("direction-change") && (
                  <Badge variant="outline" className="bg-primary/5">
                    Direction Change
                  </Badge>
                )}
                {completedScenarios.has("penalty-cards") && (
                  <Badge variant="outline" className="bg-primary/5">
                    Penalty Cards
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowCompletion(false)}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Review Powers
              </Button>
              <Button
                onClick={() => handleCompleteModule()}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Start Your First Game
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <motion.div
                className="h-2 w-16 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
              <motion.div
                className="h-2 w-16 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
              {/* <div className="h-2 w-16 rounded-full bg-gray-700/30" />
              <div className="h-2 w-16 rounded-full bg-gray-700/30" /> */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompletionScreen;
