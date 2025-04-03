"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ConfirmDeletion = ({
  openState,
  closeMethod,
  deleteMethod,
  deletionCopy,
  loading,
}) => {
  return (
    <Dialog open={openState} onOpenChange={closeMethod}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {deletionCopy}
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeMethod} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={deleteMethod}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeletion;
