"use client";

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Users,
  Share2,
  Trophy,
  Bell,
  Shield,
  Info,
  BarChart3,
  X,
  Check,
  AlertTriangle,
  Pencil,
  Camera,
} from "lucide-react";

const PermissionsInfo = ({ showPermissions, handleClosePermissions }) => (
  <Dialog open={showPermissions} onOpenChange={handleClosePermissions}>
    <DialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h3 className="text-sm md:text-lg font-semibold">
              Understanding Permissions
            </h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Admin</div>
              <div>
                Can manage workspace settings, invite members, and modify
                permissions
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Editor</div>
              <div>
                Can create, edit, and publish content within the workspace
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Viewer</div>
              <div>Can only view content and cannot make any changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
);

const WorkspaceSettings = ({ workspace, workspaceLoading, savedStates }) => {
  const userProfile = useSelector((state) => state.auth.profile);

  const [showPermissions, setShowPermissions] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const handleClosePermissions = () => {
    setShowPermissions(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile & Branding</CardTitle>
          <CardDescription>
            Customize your workspace appearance and information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      workspace?.profilePicture ||
                      `https://api.dicebear.com/6.x/initials/svg?seed=${workspace?.name}`
                    }
                    alt="Workspace Avatar"
                  />
                  <AvatarFallback>
                    {workspace?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg">{workspace?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  @{workspace?.username}
                </p>
              </div>
            </div>

            <div className="grid gap-6 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter workspace name"
                    defaultValue={workspace?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    defaultValue={workspace?.username}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter workspace description"
                  defaultValue={workspace?.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue={workspace?.timezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full md:w-auto md:ml-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>Team Management</CardTitle>
              <button
                onClick={() => setShowPermissions(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <Link href="/workspace/invite">
              <Button>Invite New Member</Button>
            </Link>
          </div>
          <CardDescription>
            Manage your team members and their roles.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {workspace?.members.map((member, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
            >
              <div className="flex items-center gap-3">
                <Link href={`/@${member.username}`} className="flex-shrink-0">
                  <img
                    src={
                      member?.profilePicture ||
                      `https://api.dicebear.com/6.x/initials/svg?seed=${member?.name}`
                    }
                    alt={member?.name}
                    className="h-8 w-8 rounded-full"
                  />
                </Link>
                <Link href={`/@${member.username}`} className="min-w-0">
                  <div className="font-medium text-sm leading-tight truncate hover:underline">
                    {member.name}
                  </div>
                  <div className="text-muted-foreground text-sm truncate hover:underline">
                    @{member.username}
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  defaultValue={member.role}
                  onValueChange={(value) => handleUpdateRole(member._id, value)}
                  disabled={workspaceLoading}
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

                {workspaceLoading && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {savedStates[member._id] && (
                  <div className="flex items-center text-green-500">
                    <Check className="w-4 h-4" />
                    <span className="text-xs ml-1">Saved</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>

        <PermissionsInfo
          showPermissions={showPermissions}
          handleClosePermissions={handleClosePermissions}
        />
      </Card>

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
                Navigate to the member removal page to manage workspace members.
                Removed members will lose access to all workspace content
                immediately.
              </p>
              <Link href="/workspace/remove-members">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Remove Members
                </Button>
              </Link>
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

          <AlertDialog
            open={showConfirmLeave}
            onOpenChange={setShowConfirmLeave}
          >
            <AlertDialogContent className="bg-light dark:bg-dark">
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

          {/* <Button variant="outline">Create New Workspace</Button>
        <Button variant="outline">Switch Workspace</Button>
        <Button variant="destructive">Archive Workspace</Button> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
