import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Trash2, Search, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WorkspaceControls = () => {
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showMemberRemoval, setShowMemberRemoval] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [removeSuccess, setRemoveSuccess] = useState(false);

  useEffect(() => {
    const fetchWorkspaceMembers = async () => {
      try {
        const response = await fetch('/api/workspace');
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setWorkspace(data.workspace);
      } catch (error) {
        console.error('Error fetching workspace members:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (showMemberRemoval) {
      fetchWorkspaceMembers();
    }
  }, [showMemberRemoval]);

  const filteredMembers = workspace?.members?.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRemoveClick = (member) => {
    setSelectedMember({
      _id: member._id,
      name: member.name
    });
    setRemoveError(null);
    setRemoveSuccess(false);
    setShowRemoveConfirmation(true);
  };

  const handleCancelRemoval = () => {
    if (!isRemoving) {
      setShowRemoveConfirmation(false);
      setSelectedMember(null);
      setRemoveError(null);
      setRemoveSuccess(false);
    }
  };

  const handleRemoveMember = async () => {
    setIsRemoving(true);
    setRemoveError(null);
    setRemoveSuccess(false);

    try {
      const response = await fetch('/api/workspace/members', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberUserId: selectedMember._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }

      // Update the workspace data
      const updatedWorkspace = {
        ...workspace,
        members: workspace.members.filter(member => member._id !== selectedMember._id)
      };
      setWorkspace(updatedWorkspace);
      
      setRemoveSuccess(true);

      // After 5 seconds, close the modals and reset states
      setTimeout(() => {
        setShowRemoveConfirmation(false);
        setShowMemberRemoval(false);
        setSelectedMember(null);
        setRemoveSuccess(false);
      }, 10000);

    } catch (error) {
      console.error('Error removing member:', error);
      setRemoveError(error.message);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Controls</CardTitle>
        <CardDescription>
          Manage your workspace settings and data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Users className="w-4 h-4" />
          <AlertTitle>Remove Members</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              Remove members from the workspace. Removed members will lose access 
              to all workspace content immediately.
            </p>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setShowMemberRemoval(true)}
            >
              Remove Members
            </Button>
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Leave Workspace</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              Leaving the workspace will remove your access to all workspace
              content and settings.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowConfirmLeave(true)}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              Leave Workspace
            </Button>
          </AlertDescription>
        </Alert>

        {/* Member Selection Dialog */}
        <Dialog 
          open={showMemberRemoval} 
          onOpenChange={(isOpen) => {
            if (isOpen === false && !isRemoving) {
              setShowMemberRemoval(false);
              setSearchQuery('');
            }
          }}
        >
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle>Remove Workspace Member</DialogTitle>
              <DialogDescription>
                Select a member to remove from the workspace.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {isInitialLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="flex justify-between p-4 border-t border-b animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"/>
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"/>
                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"/>
                          </div>
                        </div>
                        <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"/>
                      </div>
                    ))}
                  </div>
                ) : (
                  filteredMembers.map(member => (
                    <div
                      key={member._id}
                      className="flex justify-between p-4 border-t border-b"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={
                              member?.profilePicture ||
                              `https://api.dicebear.com/6.x/initials/svg?seed=${member?.name}`
                            }
                            alt={member?.name}
                            className="h-8 w-8 rounded-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm leading-tight truncate">
                              {member.name}
                            </span>
                            <span className="text-muted-foreground text-sm truncate">
                              @{member.username}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveClick(member)}
                        className="min-w-24 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))
                )}

                {!isInitialLoading && filteredMembers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No members found matching your search
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMemberRemoval(false);
                    setSearchQuery('');
                  }}
                  disabled={isRemoving}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Member Confirmation Dialog */}
        <AlertDialog 
          open={showRemoveConfirmation} 
          onOpenChange={(isOpen) => {
            if (!isOpen && !isRemoving) {
              handleCancelRemoval();
            }
          }}
        >
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Remove Member
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedMember?.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Status Messages */}
            {(isRemoving || removeError || removeSuccess) && (
              <div className="py-3">
                {isRemoving && (
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Removing member...
                  </div>
                )}
                
                {removeError && (
                  <div className="flex items-center justify-center text-destructive">
                    <XCircle className="h-5 w-5 mr-2" />
                    {removeError}
                  </div>
                )}

                {removeSuccess && (
                  <div className="flex items-center justify-center text-green-500">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Member successfully removed
                  </div>
                )}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={handleCancelRemoval}
                disabled={isRemoving}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveMember();
                }}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isRemoving || removeSuccess}
              >
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Leave Workspace Dialog */}
        <AlertDialog
          open={showConfirmLeave}
          onOpenChange={setShowConfirmLeave}
        >
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Leave Workspace
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this workspace? This action
                cannot be undone and you&apos;ll lose access to all workspace
                content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => console.log("Leave workspace")}
                className="bg-destructive hover:bg-destructive/90"
              >
                Leave Workspace
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default WorkspaceControls;