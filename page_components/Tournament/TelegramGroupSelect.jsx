import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const TelegramGroupSelect = ({ value, onChange, showError }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showNonSuperGroupModal, setShowNonSuperGroupModal] = useState(false);
  const [showNoInvitePermissionModal, setShowNoInvitePermissionModal] =
    useState(false);

  const { isSendingAddGroupMessage, handleAddTelegramGroup } = useTelegram();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("/api/integrations/telegram/groups");
        if (response.data.success) {
          setGroups(response.data.groups);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setError("no-groups");
        } else {
          setError(error.response?.data?.error || "Failed to fetch groups");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleValueChange = (groupId) => {
    const selectedGroup = groups.find(
      (group) => group.id.toString() === groupId
    );

    // Check if group is not a supergroup
    if (selectedGroup && selectedGroup.type !== "supergroup") {
      setShowNonSuperGroupModal(true);
      return;
    }

    // Check if bot has invite permissions
    if (
      selectedGroup &&
      (!selectedGroup.botPermissions?.canInviteViaLink ||
        selectedGroup.wufwufBotRole !== "admin")
    ) {
      setShowNoInvitePermissionModal(true);
      return;
    }

    onChange(groupId);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Telegram Group</Label>
        <div className="w-full h-10 flex items-center justify-center border rounded-md bg-muted/10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error === "no-groups") {
    return (
      <div className="space-y-2">
        <Label>Telegram Group</Label>
        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/5">
          <p className="text-sm text-muted-foreground">
            No Telegram groups connected
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/integrations")}
            className="flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            Connect Telegram
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Telegram Group</Label>
        <div className="w-full p-2 border rounded-md border-red-200 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Telegram Group</Label>
        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/5">
          <p className="text-sm text-muted-foreground">
            No Telegram groups available
          </p>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isSendingAddGroupMessage}
            onClick={() => handleAddTelegramGroup()}
          >
            {isSendingAddGroupMessage && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isSendingAddGroupMessage ? (
              "Sending..."
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Add Group
              </>
            )}
          </Button>

          {/* <Button
            variant="outline"
            size="sm"
            // onClick={() => router.push('/integrations')}
            onClick={() => handleAddTelegramGroup()}
            className="flex items-center gap-2"
          >
            {isSendingAddGroupMessage && }
            <LinkIcon className="h-4 w-4" />
            Add Group
          </Button> */}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Telegram Group</Label>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger
            className={`w-full ${showError ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Select a Telegram group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                <div className="flex items-center gap-3 py-1">
                  <img
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${group.name}`}
                    alt={group.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm leading-tight truncate">
                      {group.name}
                    </div>
                    <div className="text-muted-foreground text-sm truncate">
                      {group.memberCount.toLocaleString()} members
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showError && (
          <p className="text-sm text-red-500">Please select a Telegram group</p>
        )}
      </div>

      {/* Supergroup Required Modal */}
      <AlertDialog
        open={showNonSuperGroupModal}
        onOpenChange={setShowNonSuperGroupModal}
      >
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Supergroup Required</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              This group must be a Supergroup to be selected. Please ensure:
              <div className="list-inside space-y-1">
                <li>1. The group is upgraded to a Supergroup</li>
                <li>2. The Telegram bot has permissions to invite users</li>
              </div>
              <div className="pt-2">
                For more info visit{" "}
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => router.push("/integrations")}
                >
                  integrations
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Invite Permission Modal */}
      <AlertDialog
        open={showNoInvitePermissionModal}
        onOpenChange={setShowNoInvitePermissionModal}
      >
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Bot Permissions Required</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              The Wufwuf bot needs admin permissions to invite users. Please
              ensure:
              <div className="list-inside space-y-1">
                <li>1. The bot is an admin in the group</li>
                <li>2. The bot has permission to invite users via link</li>
              </div>
              <div className="pt-2">
                For more info visit{" "}
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => router.push("/integrations")}
                >
                  integrations
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TelegramGroupSelect;
