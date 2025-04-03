// components/Navigation/NotificationsMenu.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNotificationsHandler } from "@/lib/notifications";
import MiniLoader from "@/components/Loader/MiniLoader";
import WorkspaceNotification from "@/components/Notifications/WorkspaceNotificatonCard";
import DepositNotification from "@/components/Notifications/DepositNotificationCard";
import TournamentNotificationCard from "@/components/Notifications/TournamentNotificationCard";
import Link from 'next/link';

const NotificationsMenu = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: notificationsData,
    error: notificationsError,
    mutate: notificationsMutate,
    isLoading: notificationsLoading,
  } = useNotificationsHandler();

  const deleteNotification = async (notificationId) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `/api/notifications/delete?notificationId=${notificationId}`
      );

      if (response.status === 204) {
        console.log("Notification deleted successfully");
        notificationsMutate();
      } else {
        console.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("An error occurred while deleting notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "newWorkspaceInvite":
      case "acceptedWorkspaceInvite":
      case "declinedWorkspaceInvite":
        return <WorkspaceNotification notification={notification} />;

      case "successDepositing":
      case "errorDepositing":
        return (
          <DepositNotification
            notification={notification}
            onDelete={deleteNotification}
            isLoading={isLoading}
          />
        );

      case "registrationConfirmed":
      case "tournamentStartingSoon":
      case "matchReady":
      case "tournamentJoin":
      case "tournamentLeave":
      case "tournamentParticipantJoined":
      case "tournamentParticipantLeft":
        return (
          <TournamentNotificationCard
            notification={notification}
            onDelete={deleteNotification}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto px-2 sm:px-4 md:px-6">
      <div className="flex justify-between items-center py-3 sm:py-4 pt-8">
        <h2 className="text-lg sm:text-xl font-semibold">Notifications</h2>
        <Link
          href="/notifications"
          className="text-sm sm:text-md text-blue-400 hover:text-blue-300 transition-colors"
        >
          See All
        </Link> 
      </div>

      <div className="scroll_style flex-1 flex flex-col gap-3 sm:gap-4 rounded-xl pb-6 sm:pb-8 overflow-auto">
        {notificationsLoading && !notificationsError && (
          <div className="flex justify-center items-center p-4">
            <MiniLoader />
          </div>
        )}

        {notificationsError && (
          <div className="flex items-center justify-center p-4">
            <h1 className="text-primaryRed text-base sm:text-lg font-semibold">
              Error loading notifications
            </h1>
          </div>
        )}

        {notificationsData &&
          !notificationsError &&
          (notificationsData.length === 0 ? (
            <div className="flex justify-center p-4">
              <p className="text-white text-sm sm:text-base">
                Nothing to see yet!
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
              {notificationsData.map((notification) => (
                <div
                  key={notification._id}
                  className="transition-all hover:scale-[1.01]"
                >
                  {renderNotification(notification)}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotificationsMenu;
