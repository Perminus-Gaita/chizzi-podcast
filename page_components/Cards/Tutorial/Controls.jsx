"use client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Controls = ({
  step,
  points,
  selectedCards,
  handlePlayMove,
  isAnimating,
  setCurrentStep,
  completeScenario,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="text-sm md:text-md">{points} / 8 points</span>
      </div>

      {step.requireConfirmation && (
        <Button
          onClick={() => {
            if (step.type === "direction-demo" && step.requireConfirmation) {
              setCurrentStep((prev) => prev + 1);
            }

            // basic game flow
            if (step.type === "turn-order" && step.requireConfirmation) {
              setCurrentStep((prev) => prev + 1);
            }

            if (step.type === "observe-flow" && step.requireConfirmation) {
              completeScenario();
            }
          }}
          className="px-6 py-2 rounded-lg bg-primary"
        >
          Continue
        </Button>
      )}

      {!step.requireConfirmation && (
        <Button
          onClick={handlePlayMove}
          disabled={!selectedCards.length || isAnimating}
          className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 
                       font-medium disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
        >
          Play Move
        </Button>
      )}
    </div>
  );
};

export default Controls;
