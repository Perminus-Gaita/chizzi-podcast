"use client";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { init_page } from "@/app/store/pageSlice";
import axios from "axios";
import { useNotificationsHandler } from "@/lib/notifications";
import MiniLoader from "@/components/Loader/MiniLoader";
import WorkspaceNotification from "@/components/Notifications/WorkspaceNotificatonCard";
import DepositNotification from "@/components/Notifications/DepositNotificationCard";
import SponsorshipNotificationCard from "@/components/Notifications/SponsorshipNotificationCard";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Trophy,
  Timer,
  AlertCircle,
  X,
  Users,
  Bell,
  Trash2,
  Clock,
  Filter,
  UserMinus,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import moment from "moment";

const FILTER_CONFIGS = {
  all: {
    label: "All Notifications",
    filter: () => true,
  },
  unread: {
    label: "Unread",
    filter: (notification) => !notification.isRead,
  },
  tournaments: {
    label: "Tournaments",
    filter: (notification) =>
      [
        "registrationConfirmed",
        "tournamentStartingSoon",
        "matchReady",

        // partiticpant
        "tournamentJoin",
        "tournamentLeave",
        "tournamentCreated",
        "tournamentModified",
        "tournamentCancelled",

        // organizer
        "tournamentParticipantJoined",
        "tournamentParticipantLeft",

        // sponsorship
        "successSponsoringTournament", 
        "errorSponsoringTournament",

        "matchResult",
        "roundAdvancement",
        "tournamentElimination",
        "tournamentVictory",
        "tournamentComplete",
        "prizeAwarded",
      ].includes(notification.type),
  },
  deposits: {
    label: "Deposits",
    filter: (notification) =>
      ["successDepositing", "errorDepositing"].includes(notification.type),
  },
  workspace: {
    label: "Workspace",
    filter: (notification) =>
      [
        "newWorkspaceInvite",
        "acceptedWorkspaceInvite",
        "declinedWorkspaceInvite",
      ].includes(notification.type),
  },
};

const TournamentNotification = ({ notification, onDelete, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageLength = notification.message?.length || 0;
  const hasLongContent =
    messageLength > 120 ||
    (notification.details && notification.details.length > 80) ||
    (notification.metadata?.buyIn && notification.metadata?.matchName) ||
    (notification.metadata?.refundDetails &&
      notification.metadata?.remainingSpots);

  const getNotificationConfig = (type) => {
    const configs = {
      // Registration related
      // registrationConfirmed: {
      //   icon: Trophy,
      //   bgColor: "bg-green-800",
      //   iconBg: "bg-green-500",
      //   textColor: "text-green-300",
      // },
      // tournamentStartingSoon: {
      //   icon: Timer,
      //   bgColor: "bg-blue-800",
      //   iconBg: "bg-blue-500",
      //   textColor: "text-blue-300",
      // },
      // registrationReminder: {
      //   icon: Clock,
      //   bgColor: "bg-yellow-800",
      //   iconBg: "bg-yellow-500",
      //   textColor: "text-yellow-300",
      // },
      // registrationClosing: {
      //   icon: Clock,
      //   bgColor: "bg-red-800",
      //   iconBg: "bg-red-500",
      //   textColor: "text-red-300",
      // },

      // Match related
      // matchReady: {
      //   icon: Users,
      //   bgColor: "bg-purple-800",
      //   iconBg: "bg-purple-500",
      //   textColor: "text-purple-300",
      // },
      // matchStarting: {
      //   icon: Zap,
      //   bgColor: "bg-purple-800",
      //   iconBg: "bg-purple-500",
      //   textColor: "text-purple-300",
      // },
      // matchReminder: {
      //   icon: Clock,
      //   bgColor: "bg-yellow-800",
      //   iconBg: "bg-yellow-500",
      //   textColor: "text-yellow-300",
      // },
      // matchResult: {
      //   icon: Medal,
      //   bgColor: "bg-blue-800",
      //   iconBg: "bg-blue-500",
      //   textColor: "text-blue-300",
      // },

      // Participant actions
      tournamentJoin: {
        icon: UserPlus,
        bgColor: "bg-green-800",
        iconBg: "bg-green-500",
        textColor: "text-green-300",
      },
      tournamentLeave: {
        icon: UserMinus,
        bgColor: "bg-orange-800",
        iconBg: "bg-orange-500",
        textColor: "text-orange-300",
      },

      // Organizer notifications
      tournamentParticipantJoined: {
        icon: UserPlus,
        bgColor: "bg-blue-800",
        iconBg: "bg-blue-500",
        textColor: "text-blue-300",
      },
      tournamentParticipantLeft: {
        icon: UserMinus,
        bgColor: "bg-orange-800",
        iconBg: "bg-orange-500",
        textColor: "text-orange-300",
      },

      // Tournament progress
      // roundAdvancement: {
      //   icon: Repeat,
      //   bgColor: "bg-indigo-800",
      //   iconBg: "bg-indigo-500",
      //   textColor: "text-indigo-300",
      // },
      // tournamentElimination: {
      //   icon: Shield,
      //   bgColor: "bg-red-800",
      //   iconBg: "bg-red-500",
      //   textColor: "text-red-300",
      // },

      // Tournament completion
      // tournamentVictory: {
      //   icon: Crown,
      //   bgColor: "bg-yellow-800",
      //   iconBg: "bg-yellow-500",
      //   textColor: "text-yellow-300",
      // },
      // tournamentComplete: {
      //   icon: Trophy,
      //   bgColor: "bg-green-800",
      //   iconBg: "bg-green-500",
      //   textColor: "text-green-300",
      // },
      // prizeAwarded: {
      //   icon: Award,
      //   bgColor: "bg-yellow-800",
      //   iconBg: "bg-yellow-500",
      //   textColor: "text-yellow-300",
      // },

      // Streaming
      // featuredMatch: {
      //   icon: Star,
      //   bgColor: "bg-purple-800",
      //   iconBg: "bg-purple-500",
      //   textColor: "text-purple-300",
      // },
      // streamGoingLive: {
      //   icon: Radio,
      //   bgColor: "bg-red-800",
      //   iconBg: "bg-red-500",
      //   textColor: "text-red-300",
      // },
    };

    return (
      configs[type] || {
        icon: AlertCircle,
        bgColor: "bg-gray-800",
        iconBg: "bg-gray-500",
        textColor: "text-gray-300",
      }
    );
  };

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const formatAmount = (amount, currency = "KES") => {
    if (!amount) return "";
    const convertedAmount = amount / 100;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(convertedAmount);
  };

  return (
    <Link
      href={`/tournaments/${notification.metadata.tournamentSlug}`}
      className={`block ${config.bgColor} bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-grow">
          <div className="flex-shrink-0 mr-4">
            <div className={`${config.iconBg} bg-opacity-20 p-2 rounded-full`}>
              <Icon className={`h-6 w-6 ${config.textColor}`} />
            </div>
          </div>

          <div className="flex-grow">
            {/* Main Message */}
            <div className="relative">
              <p
                className={`text-[15px] break- text-foreground ${
                  !isExpanded && hasLongContent ? "line-clamp-2" : ""
                }`}
              >
                {notification.message}
              </p>
              {hasLongContent && !isExpanded && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-l from-gray-800/50 pl-4">
                  <span className="text-xs text-gray-400">...</span>
                </div>
              )}
            </div>

            {/* Expandable Content */}
            <div
              className={`mt-2 space-y-2 transition-all duration-200 ${
                !isExpanded && hasLongContent ? "hidden" : ""
              }`}
            >
              {/* Match Information */}
              {notification.metadata?.matchName && (
                <p className="text-sm text-gray-300">
                  Match: {notification.metadata.matchName}
                </p>
              )}

              {notification.metadata?.opponent && (
                <p className="text-sm text-gray-300">
                  Opponent: {notification.metadata.opponent}
                </p>
              )}

              {/* Tournament Entry Details */}
              {notification.metadata?.buyIn && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    Entry Fee:{" "}
                    {formatAmount(notification.metadata.buyIn.entryFee)}
                  </p>
                  <p className="text-sm text-gray-300">
                    Prize Pool:{" "}
                    {formatAmount(notification.metadata.buyIn.prizePool)}
                  </p>
                </div>
              )}

              {/* Refund Information */}
              {notification.metadata?.refundDetails && (
                <p className="text-sm text-gray-300">
                  Refund Amount:{" "}
                  {formatAmount(
                    notification.metadata.refundDetails.amount,
                    notification.metadata.refundDetails.currency
                  )}
                </p>
              )}

              {/* Tournament Progress */}
              {notification.metadata?.remainingSpots && (
                <p className="text-sm text-gray-300">
                  Remaining Spots: {notification.metadata.remainingSpots}
                </p>
              )}

              {/* Additional Details */}
              {notification.details && (
                <p className="text-sm text-gray-300 text-muted-foreground">
                  {notification.details}
                </p>
              )}
            </div>

            {/* Timestamp and Actions Row */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400 text-muted-foreground">
                {moment(notification.createdAt).fromNow()}
              </p>

              {hasLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs hover:text-foreground px-2 py-1 dark:text-gray-400 dark:hover:text-white text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(notification._id);
          }}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="ml-2 flex-shrink-0 -mt-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
};

const Notifications = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClear, setIsLoadingClear] = useState(false);
  const [isLoadingRead, setIsLoadingRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: notificationsData,
    error: notificationsError,
    mutate: notificationsMutate,
    isLoading: notificationsLoading,
  } = useNotificationsHandler();

  const filteredNotifications = useMemo(() => {
    if (!notificationsData) return [];

    let filtered = notificationsData;

    // Apply type filter
    filtered = filtered.filter(FILTER_CONFIGS[activeFilter].filter);

    // Apply search filter if exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.message?.toLowerCase().includes(query) ||
          notification.details?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [notificationsData, activeFilter, searchQuery]);

  // Get unread counts for each filter
  const unreadCounts = useMemo(() => {
    if (!notificationsData) return {};

    return Object.keys(FILTER_CONFIGS).reduce((acc, filterKey) => {
      acc[filterKey] = notificationsData.filter(
        (n) => !n.isRead && FILTER_CONFIGS[filterKey].filter(n)
      ).length;
      return acc;
    }, {});
  }, [notificationsData]);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setSearchQuery(""); // Reset search when changing filters
  };

  useEffect(() => {
    const markNotificationsAsRead = async () => {
      try {
        await axios.post("/api/notifications/mark-read");
        notificationsMutate();
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    // Only mark as read if there are unread notifications
    if (notificationsData?.some((notification) => !notification.isRead)) {
      markNotificationsAsRead();
    }
  }, [notificationsData, notificationsMutate]);

  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Notifications",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, [dispatch]);

  const handleClearAll = async () => {
    setIsLoadingClear(true);
    try {
      await axios.delete("/api/notifications/clear-all");
      notificationsMutate();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setIsLoadingClear(false);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoadingRead(true);
    try {
      await axios.post("/api/notifications/mark-read");
      notificationsMutate();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    } finally {
      setIsLoadingRead(false);
    }
  };

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
  
      case "successSponsoringTournament":
      case "errorSponsoringTournament":
        return (
          <SponsorshipNotificationCard
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
          <TournamentNotification
            notification={notification}
            onDelete={deleteNotification}
            isLoading={isLoading}
          />
        );
  
      default:
        return null;
    }
  };

  if (!userProfile) return null;

  return (
    // <div
    //   className="flex flex-col gap-4 min-h-screen bg-gray-900 text-white"
    //   style={{ maxWidth: "650px", margin: "auto" }}
    // >
    //   <div className="flex justify-between items-center p-4 border-b border-gray-800">
    //     <h2 className="text-xl font-semibold">Notifications</h2>
    //   </div>

    //   <div className="flex-1 overflow-auto px-4">
    //     {notificationsLoading && !notificationsError && (
    //       <div className="flex justify-center items-center">
    //         <MiniLoader />
    //       </div>
    //     )}

    //     {notificationsError && (
    //       <div className="flex items-center justify-center">
    //         <h1 className="text-primaryRed text-lg font-semibold">
    //           Error loading notifications
    //         </h1>
    //       </div>
    //     )}

    //     {notificationsData && !notificationsError && (
    //       <div className="flex flex-col gap-4">
    //         {notificationsData.length === 0 ? (
    //           <div className="flex justify-center">
    //             <p className="text-white text-sm">Nothing to see yet!</p>
    //           </div>
    //         ) : (
    //           notificationsData.map((notification) => (
    //             <div key={notification._id}>
    //               {renderNotification(notification)}
    //             </div>
    //           ))
    //         )}
    //       </div>
    //     )}
    //   </div>

    //   {/* <button onClick={() => console.log(notificationsData)}>TESTED NOW</button> */}
    // </div>

    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between border-b border-border py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Notifications</h1>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {FILTER_CONFIGS[activeFilter].label}
                    {unreadCounts[activeFilter] > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {unreadCounts[activeFilter]}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(FILTER_CONFIGS).map(([key, config]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleFilterChange(key)}
                      className="justify-between"
                    >
                      {config.label}
                      {unreadCounts[key] > 0 && (
                        <span className="ml-2 rounded-full bg-tertiary px-2 py-0.5 text-xs text-light">
                          {unreadCounts[key]}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={
                  isLoadingRead || !filteredNotifications.some((n) => !n.isRead)
                }
                className="hidden sm:flex"
              >
                {isLoadingRead ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>Mark all read</>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex"
                    disabled={
                      isLoadingClear || filteredNotifications.length === 0
                    }
                  >
                    {isLoadingClear ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      Clear All Notifications
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your notifications and remove them from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoadingClear}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      disabled={isLoadingClear}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoadingClear ? (
                        <>
                          <span className="animate-pulse">Clearing...</span>
                        </>
                      ) : (
                        "Clear All"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="hidden sm:flex"
                disabled={isLoadingClear || filteredNotifications.length === 0}
              >
                {isLoadingClear ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </>
                )}
              </Button> */}
            </div>
          </div>

          {/* Mobile Filter Bar */}
          <div className="sm:hidden flex gap-2 overflow-x-auto py-2 scrollbar-none">
            {Object.entries(FILTER_CONFIGS).map(([key, config]) => (
              <Button
                key={key}
                variant={activeFilter === key ? "secondary" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleFilterChange(key)}
              >
                {config.label}
                {unreadCounts[key] > 0 && (
                  <span className="ml-2 rounded-full bg-tertiary text-light px-2 py-0.5 text-xs">
                    {unreadCounts[key]}
                  </span>
                )}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={
                isLoadingRead || !filteredNotifications.some((n) => !n.isRead)
              }
              className="hidden sm:flex"
            >
              {isLoadingRead ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>Mark all read</>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoadingClear || filteredNotifications.length === 0}
            >
              {isLoadingClear ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4 space-y-4">
          {notificationsLoading && !notificationsError && (
            <div className="flex justify-center items-center min-h-[200px]">
              <MiniLoader />
            </div>
          )}

          {notificationsError && (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <h2 className="text-lg font-semibold text-destructive">
                Error loading notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Please try again later
              </p>
            </div>
          )}

          {notificationsData && !notificationsError && (
            <>
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <h2 className="text-lg font-semibold">
                    {searchQuery
                      ? "No notifications match your search"
                      : `No ${
                          activeFilter === "all"
                            ? ""
                            : FILTER_CONFIGS[activeFilter].label.toLowerCase()
                        } notifications`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll notify you when something important happens
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="transition-all hover:scale-[1.01]"
                    >
                      {renderNotification(notification)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
