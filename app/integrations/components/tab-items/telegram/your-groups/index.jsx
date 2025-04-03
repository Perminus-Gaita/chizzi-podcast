import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Loader2, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import TelegramGroupCard from './telegram-group-card';
import ConnectTelegramAccount from './connect-telegram-account';
import AddTelegramGroupButton from './add-telegram-group-button';

const TelegramGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState({
    name: '',
    username: '',
    profilePicture: '',
  });
  const [user, setUser] = useState({});
  const [hasTelegramAccount, setHasTelegramAccount] = useState(false);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false); // State for message sending status

  // New states for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackError, setIsFeedbackError] = useState(false);

  const hasRequiredPermissions = (permissions) => {
    if (!permissions) return false;

    const requiredPermissions = [
      'canInviteViaLink'
    ];

    return requiredPermissions.every(permission => permissions[permission]);
  };

  const getWarningMessage = (group) => {
    const warnings = [];

    if (group.type !== 'supergroup') {
      warnings.push('This is a normal group. Super groups offer better admin tools and member management capabilities.');
    }

    if (group.botRole !== 'administrator') {
      warnings.push('The bot needs administrator rights to function properly. Please promote the bot to admin to ensure all features work correctly.');
    }

    return warnings.join('\n\n');
  };

  const handleWarningClick = (e, group) => {
    e.stopPropagation();
    setWarningMessage(getWarningMessage(group));
    setShowWarningModal(true);
  };

  const handleGroupClick = (inviteLink) => {
    if (inviteLink) {
      window.open(inviteLink, '_blank');
    }
  };

  const fetchWorkspace = async () => {
    try {
      setIsWorkspaceLoading(true);
      const response = await fetch('/api/user/session');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workspace');
      }

      setUser(data);
      setCurrentWorkspace(data.currentWorkspace || {
        name: '',
        username: '',
        profilePicture: '',
      });

      setHasTelegramAccount(!!data?.telegram?.userId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations/telegram/groups');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch groups');
      }

      setGroups(data.groups || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTelegramGroup = async () => {
    if (!hasTelegramAccount) return;

    const adminPermissions = [
      "change_info",       // Allows the bot to change group info
      "delete_messages",   // Allows the bot to delete messages
      "restrict_members",  // Allows the bot to ban users
      "invite_users",      // Allows the bot to invite users
      "pin_messages",      // Allows the bot to pin messages
      "promote_members"    // Allows the bot to add new admins
    ];
  
    // Construct the admin parameter string
    const adminParams = adminPermissions.join('+');
  
    // Construct the bot URL with the permissions
    const botUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?startgroup=true&admin=${adminParams}`;  

    setIsSendingMessage(true); // Start loading state

    try {
      const response = await fetch('/api/integrations/telegram/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramUserOrGroupId: user.telegram.userId,
          message: 
            "To connect your Telegram group to your Wufwuf account:\n\n" +
            "1. Add this bot to your group.\n" +
            "2. Make it an admin.\n" +
            "3. Give it invitation permissions.\n\n" +
            "Then go to https://www.wufwuf.io/integrations to see your connected Telegram groups.",
          link_preview_options: {
            is_disabled: true
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🤖 Click to add bot to a group",
                  url: botUrl
                },
              ],
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Show success feedback in modal
      setFeedbackMessage(`A message was sent to your Telegram account (${user.telegram.username}). Please check your Telegram account for further details.`);
      setIsFeedbackError(false);
      setShowFeedbackModal(true);
    } catch (err) {
      // Show error feedback in modal
      setFeedbackMessage(`Failed to send message: ${err.message}`);
      setIsFeedbackError(true);
      setShowFeedbackModal(true);
    } finally {
      setIsSendingMessage(false); // End loading state
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  useEffect(() => {
    if (hasTelegramAccount) {
      fetchGroups();
    } else {
      setIsLoading(false);
    }
  }, [hasTelegramAccount]);

  const renderHeader = () => (
    <div className="px-6 pt-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {isWorkspaceLoading ? (
          <>
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={currentWorkspace.profilePicture} alt={currentWorkspace.name} />
              <AvatarFallback>
                {currentWorkspace.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{currentWorkspace.name}</span>
              <span className="text-muted-foreground text-sm">@{currentWorkspace.username}</span>
            </div>
          </>
        )}
      </div>
      <AddTelegramGroupButton
        hasTelegramAccount={hasTelegramAccount}
        isSendingMessage={isSendingMessage}
        onClick={handleAddTelegramGroup}
      />
    </div>
  );

  const renderContent = () => {
    if (isWorkspaceLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!hasTelegramAccount) {
      return (
        <div className="p-6 flex flex-col items-center justify-center space-y-6">
          <div className="text-center text-muted-foreground text-sm">
            Connect your Telegram account to be able to add your Telegram groups here.
          </div>
          <ConnectTelegramAccount />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (groups.length === 0) {
      return (
        <div className="p-6">
          <Alert>
            <AlertDescription>
              No Telegram groups found. Add this bot to a group to see it here.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="w-full">
        {groups.map((group) => (
          <TelegramGroupCard
            key={group.id}
            group={group}
            handleWarningClick={handleWarningClick}
            hasRequiredPermissions={hasRequiredPermissions}
            handleGroupClick={handleGroupClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-card" style={{ minHeight: '405px' }}>
      {/* Warning Modal */}
      <AlertDialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <AlertDialogContent className="bg-card">
            {/* Close Button (X) */}
            <button
            onClick={() => setShowWarningModal(false)}
            className="absolute top-4 right-4 p-2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
                />
            </svg>
            </button>

        <AlertDialogHeader>
            <AlertDialogTitle>Group Status Warning</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
                {warningMessage}
            </AlertDialogDescription>
            </AlertDialogHeader>
        </AlertDialogContent>
        </AlertDialog>

      {/* Feedback Modal */}
      <AlertDialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <AlertDialogContent className="bg-card">
            {/* Close Button (X) */}
            <button
            onClick={() => setShowFeedbackModal(false)}
            className="absolute top-4 right-4 p-2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
                />
            </svg>
            </button>

            <AlertDialogHeader>
            <AlertDialogTitle>
                {isFeedbackError ? 'Error' : 'Success'}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
                {feedbackMessage}
            </AlertDialogDescription>
            </AlertDialogHeader>
        </AlertDialogContent>
        </AlertDialog>

      {renderHeader()}

      {hasTelegramAccount && (
        <div className="px-6 text-center text-muted-foreground text-sm">
          Telegram groups associated with your workspace
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default TelegramGroups;