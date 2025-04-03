"use client";
import { SkipForward, SkipBack } from "lucide-react";

const AcceptKickback = ({ acceptKickback, direction }) => {
  return (
    <button
      onClick={acceptKickback}
      className="group relative inline-flex items-center gap-2 
    overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 p-1 
    transition-all duration-300
     hover:from-emerald-500 hover:to-sky-600 hover:shadow-lg"
    >
      <span className="pl-1 md:pl-2 text-xs md:text-sm font-bold text-slate-900">
        Accept Kickback{" "}
      </span>

      <span
        className="skipTurn rounded-lg bg-emerald-400/30 p-1.5 backdrop-blur-sm transition-all duration-300 hover:bg-emerald-400/50 active:scale-95"
        aria-label="Accept kickback action"
      >
        {direction === 1 ? (
          <SkipBack className="h-5 w-5 text-slate-900 transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <SkipForward className="h-5 w-5 text-slate-900 transition-transform duration-300 group-hover:scale-110" />
        )}
      </span>
    </button>
  );
};

export default AcceptKickback;
