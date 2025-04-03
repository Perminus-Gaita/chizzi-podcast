"use client";
import { motion, AnimatePresence } from "framer-motion";

const ModuleProgress = ({ scenarios, currentScenario, onReset }) => {
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full overflow-x-auto scrollbar-hide pb-2 md:pb-4">
            <div className="flex gap-2 w-full">
              {scenarios.map((s, index) => (
                <div
                  key={s.id}
                  className={`flex-1 cursor-pointer transition-opacity hover:opacity-80 
                  ${index > currentScenario ? "opacity-50" : "opacity-100"}`}
                  onClick={() => {
                    if (index <= currentScenario + 1) {
                      onReset(index);
                    }
                  }}
                >
                  <div
                    className={`h-2 rounded-full ${
                      index === currentScenario
                        ? "bg-primary animate-pulse"
                        : index < currentScenario
                        ? "bg-primary/80"
                        : "bg-gray-700/50 dark:bg-gray-700"
                    }`}
                  />
                  <span className="text-xs mt-1 text-muted-foreground truncate block">
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ModuleProgress;
