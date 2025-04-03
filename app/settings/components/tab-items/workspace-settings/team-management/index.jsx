import React, { useState, useEffect } from 'react';
import { Info, Check, Settings2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PermissionsInfo } from '../permissions-info';
import UninviteModal from './uninvite-modal';

const TeamManagement = ({ onNavigateToInvite }) => {
  const [showPermissions, setShowPermissions] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [updatingMembers, setUpdatingMembers] = useState(new Set());
  const [savedStates, setSavedStates] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [expandedMembers, setExpandedMembers] = useState(new Set());
  const [showUninviteModal, setShowUninviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

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

    fetchWorkspaceMembers();
  }, []);

  const handleUpdateRole = async (memberId, value) => {
    setUpdatingMembers(prev => new Set(prev).add(memberId));
    
    try {
      const response = await fetch(`/api/workspace/members/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          memberUserId: memberId,
          newRole: value 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessages(prev => ({ ...prev, [memberId]: data.message }));
        setTimeout(() => {
          setErrorMessages(prev => {
            const newMessages = { ...prev };
            delete newMessages[memberId];
            return newMessages;
          });
        }, 3000);
        throw new Error(data.message);
      }

      setSavedStates(prev => ({ ...prev, [memberId]: true }));
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, [memberId]: false }));
      }, 2000);
      
      setWorkspace(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member._id === memberId ? { ...member, role: value } : member
        )
      }));

    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdatingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  const handleUninvite = async (memberId) => {
    try {
      // Remove member from expanded members set if they were expanded
      setExpandedMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });

      // Clear any saved states or error messages for this member
      setSavedStates(prev => {
        const newStates = { ...prev };
        delete newStates[memberId];
        return newStates;
      });

      setErrorMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[memberId];
        return newMessages;
      });

      // Remove member from workspace state
      setWorkspace(prev => ({
        ...prev,
        members: prev.members.filter(member => member._id !== memberId)
      }));
      
      setShowUninviteModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error uninviting user:', error);
    }
  };

  const toggleMemberExpansion = (memberId) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const renderMemberControls = (member) => {
    if (member.isInvitePending) {
      return (
        <div className="w-full sm:w-[140px]">
          <Select onValueChange={() => {
            setSelectedMember(member);
            setShowUninviteModal(true);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Invite Pending" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uninvite" className="text-red-500 hover:text-red-600 pl-2">
                Uninvite User
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {errorMessages[member._id] ? (
          <div className="w-full sm:w-[140px]">
            <div className="px-3 py-2 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              {errorMessages[member._id]}
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-[140px] flex items-center gap-2">
            <Select
              value={member.role}
              onValueChange={(value) => handleUpdateRole(member._id, value)}
              disabled={updatingMembers.has(member._id)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => toggleMemberExpansion(member._id)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings2 className="w-4 h-4 text-gray-500" />
            </button>
            {updatingMembers.has(member._id) && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </div>
        )}

        {savedStates[member._id] && (
          <div className="flex-shrink-0 w-8">
            <div className="flex items-center text-green-500">
              <Check className="w-4 h-4" />
              <span className="text-xs ml-1">Saved</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="border-0">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Button onClick={onNavigateToInvite}>
              Invite New Member
            </Button>
            <div className="flex items-center gap-2">
              <CardDescription className="text-center">
                Manage your team members and their roles.
              </CardDescription>
              <button
                onClick={() => setShowPermissions(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
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
            workspace?.members?.map((member, index) => (
              <div
                key={index}
                className={`flex flex-col border-t border-b transition-all duration-200 ${
                  !member.isInvitePending && expandedMembers.has(member._id) ? 'h-40' : 'h-20'
                }`}
              >
                <div className="flex justify-between p-4">
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
                      <div className="font-medium text-sm leading-tight truncate">
                        {member.name}
                      </div>
                      <div className="text-muted-foreground text-sm truncate">
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  {renderMemberControls(member)}
                </div>

                {!member.isInvitePending && (
                  <div 
                    className={`px-4 pb-4 transition-opacity duration-200 ${
                      expandedMembers.has(member._id) ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="border-t pt-4">
                      <h4 className="text-xs text-gray-500 mb-3">Additional Settings</h4>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Make member publicly visible in profile</label>
                        <Switch />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>

        <PermissionsInfo
          showPermissions={showPermissions}
          handleClosePermissions={() => setShowPermissions(false)}
        />
      </Card>

      <UninviteModal
        isOpen={showUninviteModal}
        onClose={() => {
          setShowUninviteModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onUninvite={handleUninvite}
      />
    </>
  );
};

export default TeamManagement;