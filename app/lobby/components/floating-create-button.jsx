"use client";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const FloatingCreateButton = ({ handleClick }) => {
  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          onClick={handleClick}
          className="rounded-full p-4 shadow-lg dark:bg-blue-600 hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center h-14 w-14"
          aria-label="Create new"
        >
          <Plus className="h-6 w-6" />
        </button>
      </motion.div>
    </div>
  );
};

export default FloatingCreateButton;