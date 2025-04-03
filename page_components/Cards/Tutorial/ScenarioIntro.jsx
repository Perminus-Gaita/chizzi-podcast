"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ScenarioIntro = ({ scenario, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card max-w-md w-full mx-4 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">{scenario.title}</h2>
        <p className="text-muted-foreground">{scenario.description}</p>

        <div className="pt-4">
          <Button onClick={onStart} className="w-full">
            Start Module
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioIntro;
