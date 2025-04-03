"use client";

import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import { useToast } from "@/components/hooks/use-toast";

// Helper functions for UserAvatar
const getInitialLetter = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

const UserAvatar = ({ user, size = "medium" }) => {
  const backgroundColor = stringToColor(user.name);
  const initial = getInitialLetter(user.name);
  const sizeClass = size === "small" ? "w-6 h-6 text-xs" : "w-10 h-10 text-sm";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold overflow-hidden`}
      style={{ backgroundColor }}
    >
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="truncate px-1">{initial}</span>
      )}
    </div>
  );
};

const WorkspaceSettings = () => {
  const [workspace, setWorkspace] = useState(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [savedStates, setSavedStates] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await fetch("/api/workspace");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch workspace data");
        }

        setWorkspace(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchWorkspace();
  }, [toast]);

  useEffect(() => {
    Object.keys(savedStates).forEach((userId) => {
      if (savedStates[userId]) {
        const timer = setTimeout(() => {
          setSavedStates((prev) => ({
            ...prev,
            [userId]: false,
          }));
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
  }, [savedStates]);

  const handleUpdateRole = async (userId, newRole) => {
    setLoadingStates((prev) => ({
      ...prev,
      [userId]: true,
    }));

    try {
      const response = await fetch("/api/workspace/members/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberUserId: userId,
          newRole: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      setWorkspace((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member._id === userId ? { ...member, role: newRole } : member
        ),
      }));

      setSavedStates((prev) => ({
        ...prev,
        [userId]: true,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-card max-w-[800px] mx-auto">
      <div className="max-w-[800px] mx-auto p-6 space-y-8 pt-8">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-4">Workspace</p>
          <Link
            href={`/@${workspace.username}`}
            className="inline-flex items-center"
          >
            <div className="flex-shrink-0">
              <UserAvatar user={workspace} />
            </div>
            <div className="ml-3 text-left">
              <div className="font-bold text-[14px] leading-tight truncate hover:underline">
                {workspace.name}
              </div>
              <div className="text-gray-400 text-[14px] -mt-[3px] truncate hover:underline">
                @{workspace.username}
              </div>
            </div>
          </Link>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground p-6">
          <div className="text-center border-b pb-6">
            <h3 className="text-xl font-bold">Workspace Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage your team and their roles
            </p>
            <Link href="/workspace/invite">
              <Button className="mt-4 w-[200px]">Invite Members</Button>
            </Link>
          </div>

          <div className="space-y-4 pt-6">
            {workspace.members.map((member) => (
              <div
                key={member._id}
                className="grid grid-cols-2 gap-4 p-4 border rounded-lg items-center"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/@${member.username}`} className="flex-shrink-0">
                    <UserAvatar user={member} />
                  </Link>
                  <Link href={`/@${member.username}`} className="min-w-0">
                    <div className="font-bold text-[14px] leading-tight truncate hover:underline">
                      {member.name}
                    </div>
                    <div className="text-gray-400 text-[14px] -mt-[3px] truncate hover:underline">
                      @{member.username}
                    </div>
                  </Link>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) =>
                      handleUpdateRole(member._id, value)
                    }
                    disabled={loadingStates[member._id]}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>

                  {loadingStates[member._id] && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}

                  {savedStates[member._id] && (
                    <div className="flex items-center text-green-500">
                      <Check className="w-4 h-4" />
                      <span className="text-sm ml-1">Saved</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h3 className="text-2xl font-semibold">
              Understanding Permissions
            </h3>
          </div>
          <p className="text-sm text-gray-600 space-y-1">
            <strong>Admins</strong> can manage workspace settings, invite
            members, and modify permissions.
            <br />
            <strong>Editors</strong> can create, edit, and publish content
            within the workspace.
            <br />
            <strong>Viewers</strong> can only view content and cannot make any
            changes.
          </p>
        </div>

        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <Users className="w-4 h-4" />
          <AlertTitle>Remove Members</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              Navigate to the member removal page to manage workspace members.
              Removed members will lose access to all workspace content
              immediately.
            </p>
            <Link href="/workspace/remove-members">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Remove Members
              </Button>
            </Link>
          </AlertDescription>
        </Alert>

        <Alert variant="destructive" className="bg-red-50 border-red-200">
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
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Leave Workspace
            </Button>
          </AlertDescription>
        </Alert>

        <AlertDialog open={showConfirmLeave} onOpenChange={setShowConfirmLeave}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
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
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Workspace
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
