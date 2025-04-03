"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { init_page } from "@/app/store/pageSlice";
import axios from "axios";
import { useNotificationsHandler } from "@/lib/notifications";
import MiniLoader from "@/components/Loader/MiniLoader";
import WorkspaceNotification from "@/components/Notifications/WorkspaceNotificatonCard";
import DepositNotification from "@/components/Notifications/DepositNotificationCard";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const TournamentNotificationCard = ({ notification, onDelete, isLoading }) => {
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
    <div className={`${config.bgColor} bg-opacity-50 rounded-lg p-4`}>
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
                className={`text-[15px] break-words ${
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
                <p className="text-sm text-gray-300">{notification.details}</p>
              )}
            </div>

            {/* Timestamp and Actions Row */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {moment(notification.createdAt).fromNow()}
              </p>

              {hasLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1"
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
    </div>
  );
};

export default TournamentNotificationCard;
