"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, RotateCcw } from "lucide-react";

const InstructionArea = ({
  scenario,
  step,
  errorMessage,
  showHint,
  setShowHint,
  handleModuleReset,
}) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 space-y-2 md:space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div>
            <h3 className="font-medium text-sm md:text-lg text-foreground">
              {scenario.title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-muted-foreground">
              {step.instruction}
            </p>
          </div>{" "}
          {errorMessage && (
            <p className="text-red-400 text-sm">{errorMessage}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHint(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
                   text-gray-300 hover:text-white transition-colors"
          >
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={handleModuleReset}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
                   text-gray-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Hint Popup */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-gray-700 rounded-lg text-sm text-gray-300"
          >
            {step.hint || "Try playing the highlighted card(s)!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructionArea;
