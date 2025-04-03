import React, { useState } from 'react';
import { X, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import moment from 'moment';

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
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const backgroundColor = stringToColor(user?.name);
  const initial = getInitialLetter(user?.name);
  const sizeClass = size === "small" ? "w-5 h-5 text-xs" : "w-10 h-10 text-sm";

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

const formatMessage = (message, mentions) => {
  if (!message || !Array.isArray(mentions)) return "";
  let formattedMessage = message;
  
  mentions.forEach(mention => {
    if (mention.type === "user") {
      formattedMessage = formattedMessage.replace(
        `@USER:${mention._id}`,
        `{{user:${mention._id}}}`
      );
    }
  });
  
  const parts = formattedMessage.split(/({{user:[^}]+}})/);
  return parts.map((part, index) => {
    const userMatch = part.match(/{{user:([^}]+)}}/);
    if (userMatch) {
      const userId = userMatch[1];
      const user = mentions.find(m => m._id === userId);
      if (user) {
        return (
          <Link
            key={`user-${index}`}
            href={`/@${user.username}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <UserAvatar user={user} size="small" />
            <span className="font-bold text-gray-200">{user.name}</span>
          </Link>
        );
      }
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
};

const TournamentSponsorshipNotification = ({ notification, onDelete, isLoading }) => {
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
          {/* Tournament Visual */}
          <div className="flex-shrink-0 mr-4">
            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradientClasses[0]} flex items-center justify-center`}>
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex-grow">
            {/* Tournament Info */}
            <div className="relative group">
              <h3 className="text-lg font-semibold truncate pr-4">
                Tournament
              </h3>
              <div className="absolute inset-0 z-10">
                <h3 className="text-lg font-semibold invisible group-hover:visible bg-gray-800/95 whitespace-normal">
                  Tournament
                </h3>
              </div>
            </div>

            {/* Financial Overview */}
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

            {/* Message with User Avatar */}
            <p className="text-[15px] text-gray-200 mt-4">
              {formatMessage(notification.message, notification.mentions)}
            </p>

            {/* Expandable Content */}
            {notification.details && (
              <div className={`space-y-2 transition-all duration-200 ${
                !isExpanded ? "hidden" : ""
              }`}>              
                <p className="text-sm text-gray-400 mt-2">
                  {notification.details}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {moment(notification.createdAt).fromNow()}
              </p>
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

        {/* Delete Button */}
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

export default TournamentSponsorshipNotification;