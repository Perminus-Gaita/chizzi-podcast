"use client";
import React, { useState } from 'react';
import { Bell, Trash2, Filter, X, Loader2, CheckCircle2, AlertCircle, Trophy, UserPlus, UserMinus, CreditCard, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from 'moment';

// Create a simplified version of the notification cards

// Deposit Notification Card
const DepositNotification = ({ notification, onDelete, isLoading }) => {
  const isSuccess = notification.status === "success";
  const bgColor = isSuccess ? "bg-green-800" : "bg-red-800";
  
  const formatPaymentMethod = (method) => {
    const paymentMethods = {
      'pending': 'Pending',
      'wufwufWallet': 'Wufwuf Wallet',
      'paystackCard': 'Card',
      'paystackMpesa': 'M-Pesa',
      'mpesa': 'M-Pesa'
    };
    return paymentMethods[method] || method;
  };
  
  const formatAmount = (amount, currency) => {
    const convertedAmount = amount / 100;
    const currencyLocales = {
      'KES': 'en-KE',
      'USD': 'en-US',
    };
    const locale = currencyLocales[currency] || 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } catch (error) {
      return `${currency}${convertedAmount.toFixed(2)}`;
    }
  };

  return (
    <div className={`${bgColor} bg-opacity-50 rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-grow">
          <div className="flex-shrink-0 mr-4">
            {isSuccess ? (
              <div className="bg-green-500 bg-opacity-20 p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-300" />
              </div>
            ) : (
              <div className="bg-red-500 bg-opacity-20 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-300" />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <p className="text-[15px] font-medium">
                {formatAmount(notification.metadata?.amount, notification.metadata?.currency)}
                {notification.metadata?.paymentChannel && (
                  <span className="text-gray-400 text-xs ml-2">
                    via {formatPaymentMethod(notification.metadata.paymentChannel)}
                  </span>
                )}
              </p>
            </div>
            <p className="text-[15px] mt-1">{notification.message}</p>
            {notification.details && (
              <p className="text-sm text-gray-300 mt-1">{notification.details}</p>
            )}
            {isSuccess && notification.metadata?.walletBalance && (
              <div className="flex items-center gap-2 mt-2 text-gray-300">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">
                  Balance: {formatAmount(notification.metadata.walletBalance, notification.metadata?.currency)}
                </span>
              </div>
            )}
            {notification.relatedId && (
              <p className="text-xs text-gray-400 mt-1">
                Transaction ID: {notification.relatedId}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">{moment(notification.createdAt).fromNow()}</p>
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

// Tournament Notification Card
const TournamentNotification = ({ notification, onDelete, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getNotificationConfig = (type) => {
    const configs = {
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
    };
    
    return configs[type] || {
      icon: Trophy,
      bgColor: "bg-gray-800",
      iconBg: "bg-gray-500",
      textColor: "text-gray-300",
    };
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
  
  const messageLength = notification.message?.length || 0;
  const hasLongContent = messageLength > 120 || 
    (notification.details && notification.details.length > 80) ||
    (notification.metadata?.buyIn && notification.metadata?.matchName) ||
    (notification.metadata?.refundDetails && notification.metadata?.remainingSpots);
  
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
            <div className="relative">
              <p className={`text-[15px] break-words ${!isExpanded && hasLongContent ? "line-clamp-2" : ""}`}>
                {notification.message}
              </p>
              {hasLongContent && !isExpanded && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-l from-gray-800/50 pl-4">
                  <span className="text-xs text-gray-400">...</span>
                </div>
              )}
            </div>
            <div className={`mt-2 space-y-2 transition-all duration-200 ${!isExpanded && hasLongContent ? "hidden" : ""}`}>
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
              {notification.metadata?.buyIn && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    Entry Fee: {formatAmount(notification.metadata.buyIn.entryFee)}
                  </p>
                  <p className="text-sm text-gray-300">
                    Prize Pool: {formatAmount(notification.metadata.buyIn.prizePool)}
                  </p>
                </div>
              )}
              {notification.metadata?.refundDetails && (
                <p className="text-sm text-gray-300">
                  Refund Amount: {formatAmount(notification.metadata.refundDetails.amount, notification.metadata.refundDetails.currency)}
                </p>
              )}
              {notification.metadata?.remainingSpots && (
                <p className="text-sm text-gray-300">
                  Remaining Spots: {notification.metadata.remainingSpots}
                </p>
              )}
              {notification.details && (
                <p className="text-sm text-gray-300">{notification.details}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">{moment(notification.createdAt).fromNow()}</p>
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

// Workspace Notification Card
const WorkspaceNotification = ({ notification }) => {
  // Simplified UserAvatar component
  const UserAvatar = ({ user, size = "medium" }) => {
    const getInitialLetter = (name) => {
      if (!name || typeof name !== 'string') return "?";
      return name.charAt(0).toUpperCase();
    };
    
    const stringToColor = (str) => {
      if (!str || typeof str !== 'string') return "#808080";
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
    };
    
    const backgroundColor = stringToColor(user?.name);
    const initial = getInitialLetter(user?.name);
    const sizeClass = size === "small" ? "w-6 h-6 text-xs" : "w-10 h-10 text-sm";
    
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold overflow-hidden`}
        style={{ backgroundColor }}
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user?.name || 'User avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="truncate px-1">{initial}</span>
        )}
      </div>
    );
  };

  if (!notification) {
    return null;
  }

  const user = notification.mentions?.find((m) => m?.type === "user");
  const workspace = notification.mentions?.find((m) => m?.type === "workspace");

  let href = "#";

  return (
    <div
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer"
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserAvatar user={user} />
          </div>
          <div className="flex flex-col justify-center ml-1.5 min-w-0">
            <div className="font-semibold hover:underline text-[14px] leading-tight truncate">
              {user?.name}
            </div>
            <div className="text-gray-400 text-[14px] -mt-[3px] truncate hover:underline">
              @{user?.username}
            </div>
          </div>
        </div>
        <div className="pl-1">
          <p className="text-[15px]">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">{moment(notification.createdAt).fromNow()}</p>
        </div>
      </div>
    </div>
  );
};

// Sponsorship Notification Card
const SponsorshipNotificationCard = ({ notification, onDelete, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const generateGradient = () => {
    const colors = [
      ['from-blue-500 to-purple-500', 'bg-blue-500'],
      ['from-green-500 to-teal-500', 'bg-green-500'],
      ['from-purple-500 to-pink-500', 'bg-purple-500'],
      ['from-red-500 to-yellow-500', 'bg-red-500'],
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };
  
  const [gradientClasses] = useState(generateGradient());
  
  const formatAmount = (amount, currency = "KES") => {
    if (!amount) return "";
    const convertedAmount = amount / 100;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(convertedAmount);
  };
  
  const hasLongContent = notification.details?.length > 80;
  
  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-grow">
          <div className="flex-shrink-0 mr-4">
            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradientClasses[0]} flex items-center justify-center`}>
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="relative group">
              <h3 className="text-lg font-semibold truncate pr-4">
                Tournament
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-1">
              <div className="flex flex-col space-y-0">
                <span className="text-gray-400 text-xs">Purchase</span>
                <span className="font-medium text-gray-200">
                  {formatAmount(notification.metadata.purchaseAmount, notification.metadata.currency)}
                </span>
              </div>
              <div className="flex flex-col space-y-0">
                <span className="text-gray-400 text-xs">Sponsorship</span>
                <span className="font-medium text-gray-200">
                  {formatAmount(notification.metadata.sponsorshipAmount, notification.metadata.currency)}
                </span>
              </div>
            </div>
            <p className="text-[15px] text-gray-200 mt-4">{notification.message}</p>
            {notification.details && (
              <div className={`space-y-2 transition-all duration-200 ${!isExpanded ? "hidden" : ""}`}>
                <p className="text-sm text-gray-400 mt-2">{notification.details}</p>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">{moment(notification.createdAt).fromNow()}</p>
              {hasLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs hover:text-white px-2 py-1 text-gray-400"
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

// Create dummy notification data
const dummyNotifications = [
  {
    _id: '1',
    type: 'successDepositing',
    status: 'success',
    message: 'Your deposit of KES 5,000 was successful!',
    details: 'Funds are now available in your wallet.',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    metadata: {
      amount: 500000, // in cents
      currency: 'KES',
      paymentChannel: 'mpesa',
      walletBalance: 780000 // in cents
    },
    relatedId: 'TRX123456789'
  },
  {
    _id: '2',
    type: 'tournamentJoin',
    message: 'You have successfully joined the Kadi Championship tournament!',
    details: 'The tournament starts on April 10th, 2023 at 3:00 PM.',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    metadata: {
      tournamentSlug: 'fortnite-championship-2023',
      matchName: 'Fortnite Championship',
      buyIn: {
        entryFee: 20000, // in cents
        prizePool: 5000000 // in cents
      },
      remainingSpots: 12
    }
  },
  {
    _id: '3',
    type: 'newWorkspaceInvite',
    message: '@USER:123 invited you to join @WORKSPACE:456',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    mentions: [
      {
        _id: '123',
        type: 'user',
        name: 'John Doe',
        username: 'johndoe',
        profilePicture: null
      },
      {
        _id: '456',
        type: 'workspace',
        name: 'Gaming Squad',
        username: 'gamingsquad',
        profilePicture: null
      }
    ],
    invite: {
      _id: '789'
    }
  },
  {
    _id: '4',
    type: 'successSponsoringTournament',
    message: 'You have successfully sponsored the CS:GO Pro League!',
    details: 'Your sponsorship will increase visibility for your brand among thousands of gaming enthusiasts.',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    metadata: {
      purchaseAmount: 1000000, // in cents
      sponsorshipAmount: 800000, // in cents
      currency: 'KES'
    },
    mentions: []
  },
  {
    _id: '5',
    type: 'errorDepositing',
    status: 'failed',
    message: 'Your deposit of USD 100 could not be processed.',
    details: 'Please check your payment details and try again or contact support if the issue persists.',
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    metadata: {
      amount: 10000, // in cents
      currency: 'USD',
      paymentChannel: 'paystackCard'
    },
    relatedId: 'TRX987654321'
  }
];

// Main Notifications Component
const Notifications = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const deleteNotification = (notificationId) => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(notifications.filter(n => n._id !== notificationId));
      setIsLoading(false);
    }, 500);
  };

  const handleClearAll = () => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications([]);
      setIsLoading(false);
    }, 1000);
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

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto max-w-2xl px-4 py-2">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur">
          <div className="flex items-center justify-between border-b border-gray-800 py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-gray-400" />
              <h1 className="text-xl font-semibold">Notifications</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => setActiveFilter(activeFilter === "all" ? "unread" : "all")}
              >
                <Filter className="h-4 w-4 mr-2" />
                {activeFilter === "all" ? "All Notifications" : "Unread"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isLoading || notifications.length === 0}
                className="text-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <h2 className="text-lg font-semibold">No notifications</h2>
              <p className="text-sm text-gray-400">
                We&apos;ll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="transition-all hover:scale-[1.01]"
                >
                  {renderNotification(notification)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;