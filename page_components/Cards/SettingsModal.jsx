"use client";
import { Volume2, VolumeX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SettingsModal = ({
  isMuted,
  setIsMuted,
  openSettingsModal,
  handleCloseSettingsModal,
}) => {
  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Dialog open={openSettingsModal} onOpenChange={handleCloseSettingsModal}>
      <DialogContent
        className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] 
       bg-slate-900/95 backdrop-blur-lg
       border-slate-700/50 shadow-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-200">Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-sm text-slate-300">Game Sound</span>
            </div>

            <button
              onClick={toggleSound}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-300 
                ${isMuted ? "bg-slate-700" : "bg-emerald-600"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
                  ${isMuted ? "left-1" : "left-7"}
                `}
              />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
