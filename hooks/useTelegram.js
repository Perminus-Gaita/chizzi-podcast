"use client";
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export const useTelegram = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackError, setIsFeedbackError] = useState(false);
  const [hasTelegramAccount, setHasTelegramAccount] = useState(false);
  const [isGroupMember, setIsGroupMember] = useState(false);

  const [isSendingAddGroupMessage, setIsSendingAddGroupMessage] =
    useState(false);

  const sendTelegramMessage = async (telegramUserOrGroupId, message) => {
    try {
      if (!telegramUserOrGroupId || !message) {
        throw new Error("Both telegramUserOrGroupId and message are required");
      }

      const response = await axios.post(
        "/api/integrations/telegram/send-message",
        {
          telegramUserOrGroupId,
          message,
        }
      );

      if (response.data.success) {
        // console.log("### MEssage sent successfullyt ####");
        // console.log(response.data);

        return response.data;
      }

      throw new Error(response.data.error || "Failed to send message");
    } catch (error) {
      const errorMessage =
        error.response?.data?.details ||
        error.message ||
        "An unexpected error occurred";

      console.error("Error sending Telegram message:", errorMessage);

      throw error;
    }
  };

  const handleJoinTelegramGroup = async (telegramGroupId) => {
    setLoadingTelegram(true);
    // setTelegramError(null);

    try {
      const response = await axios.post(
        "/api/integrations/telegram/group/invite-link",
        { groupId: telegramGroupId }
      );

      if (response.data.inviteLink) {
        window.open(response.data.inviteLink, "_blank");
      } else {
        throw new Error("Failed to fetch invite link");
      }
    } catch (error) {
      console.error("Failed to fetch Telegram invite link. Please try again.");
      setLoadingTelegram(false);
      // setTelegramError(
      //   "Failed to fetch Telegram invite link. Please try again."
      // );
    } finally {
      setLoadingTelegram(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingTelegram(true);
    try {
      const response = await axios.get("/api/integrations/telegram/groups");
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error("An error occured");
      // if (error.response?.status === 404) {
      //   // setError('no-groups');
      //   console.log("no groupd");
      // } else {
      //   // setError(error.response?.data?.error || 'Failed to fetch groups');
      //   console.log("Failed to fetch groups");
      // }
    } finally {
      setLoadingTelegram(false);
    }
  };

  const handleAddTelegramGroup = async () => {
    if (!userProfile?.telegramUserId) return;

    const adminPermissions = [
      "change_info", // Allows the bot to change group info
      "delete_messages", // Allows the bot to delete messages
      "restrict_members", // Allows the bot to ban users
      "invite_users", // Allows the bot to invite users
      "pin_messages", // Allows the bot to pin messages
      "promote_members", // Allows the bot to add new admins
    ];

    // Construct the admin parameter string
    const adminParams = adminPermissions.join("+");

    // Construct the bot URL with the permissions
    const botUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?startgroup=true&admin=${adminParams}`;

    setIsSendingAddGroupMessage(true); // Start loading state

    try {
      const response = await fetch("/api/integrations/telegram/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramUserOrGroupId: userProfile?.telegramUserId,
          message:
            "To connect your Telegram group to your Wufwuf account:\n\n" +
            "1. Add this bot to your group.\n" +
            "2. Make it an admin.\n" +
            "3. Give it invitation permissions.\n\n" +
            "Then go to https://www.wufwuf.io/integrations to see your connected Telegram groups.",
          link_preview_options: {
            is_disabled: true,
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🤖 Click to add bot to a group",
                  url: botUrl,
                },
              ],
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Show success feedback in modal
      setFeedbackMessage(
        `A message was sent to your Telegram account (${user.telegram.username}). Please check your Telegram account for further details.`
      );
      setIsFeedbackError(false);
      setShowFeedbackModal(true);
    } catch (err) {
      // Show error feedback in modal
      setFeedbackMessage(`Failed to send message: ${err.message}`);
      setIsFeedbackError(true);
      setShowFeedbackModal(true);
    } finally {
      setIsSendingAddGroupMessage(false); // End loading state
    }
  };

  const checkTelegramGroupMembershipStatus = async (telegramGroupId) => {
    setLoadingTelegram(true);
    try {
      const response = await axios.get(
        `/api/integrations/telegram/group/check-membership?userId=${userProfile?.telegramUserId}&groupId=${telegramGroupId}`
      );

      if (response.data.isMember.isMember) {
        setIsGroupMember(true);
      }

      // console.log("### THE DATA HERE AND THEN ###");
      // console.log(response);
    } catch (error) {
      console.error("Error checking Telegram status:", error);
      setIsGroupMember(false);
      setLoadingTelegram(false);
    } finally {
      setLoadingTelegram(false);
    }
  };

  return {
    isGroupMember,
    loadingTelegram,
    isSendingAddGroupMessage,
    sendTelegramMessage,
    handleJoinTelegramGroup,
    fetchGroups,
    handleAddTelegramGroup,
    checkTelegramGroupMembershipStatus,
  };
};
