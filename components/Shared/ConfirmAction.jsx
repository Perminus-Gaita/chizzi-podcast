import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ConfirmAction = ({
  openState,
  closeMethod,
  confirmMethod,
  title,
  description,
  confirmButtonText,
  loading,
}) => {
  return (
    <Dialog open={openState} onOpenChange={closeMethod}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeMethod} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmMethod} disabled={loading}>
            {loading ? "Processing..." : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmAction;
