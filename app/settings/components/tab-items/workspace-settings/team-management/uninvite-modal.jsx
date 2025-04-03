import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, XCircle, CheckCircle2, User } from "lucide-react";

const UninviteModal = ({ 
  isOpen, 
  onClose, 
  member, 
  onUninvite 
}) => {
  const [isUninviting, setIsUninviting] = useState(false);
  const [uninviteError, setUninviteError] = useState(null);
  const [uninviteSuccess, setUninviteSuccess] = useState(false);

  const handleUninvite = async () => {
    setIsUninviting(true);
    setUninviteError(null);
    
    try {
      // Make DELETE request to the invite endpoint
      const response = await fetch('/api/workspace/invite', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteeId: member._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to uninvite user');
      }

      // Call the onUninvite callback to update UI state
      onUninvite(member._id);
      
      setUninviteSuccess(true);
      setTimeout(() => {
        onClose();
        setUninviteSuccess(false);
      }, 1500);
    } catch (error) {
      setUninviteError(error.message || 'Failed to uninvite user');
    } finally {
      setIsUninviting(false);
    }
  };

  const handleCancel = () => {
    if (!isUninviting) {
      onClose();
      setUninviteError(null);
      setUninviteSuccess(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Are you sure you want to uninvite?
          </AlertDialogTitle>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0">
              {member?.profilePicture ? (
                <img
                  src={member.profilePicture}
                  alt={member.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{member?.name}</div>
              <div className="text-sm text-muted-foreground">@{member?.username}</div>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            This user was invited on: {new Date(member?.inviteCreatedAt).toLocaleDateString('en-GB', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Status Messages */}
        {(isUninviting || uninviteError || uninviteSuccess) && (
          <div className="py-3">
            {isUninviting && (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Uninviting user...
              </div>
            )}
            
            {uninviteError && (
              <div className="flex items-center justify-center text-destructive">
                <XCircle className="h-5 w-5 mr-2" />
                {uninviteError}
              </div>
            )}

            {uninviteSuccess && (
              <div className="flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                User successfully uninvited
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isUninviting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleUninvite();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isUninviting || uninviteSuccess}
          >
            Uninvite
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UninviteModal;