import React from 'react';
import moment from 'moment';
import Link from 'next/link';

const UserAvatar = ({ user, size = "medium" }) => {
  // Helper function to get initial letter with null check
  const getInitialLetter = (name) => {
    if (!name || typeof name !== 'string') return "?";
    return name.charAt(0).toUpperCase();
  };

  // Helper function to generate consistent color from string with null check
  const stringToColor = (str) => {
    if (!str || typeof str !== 'string') return "#808080"; // Default color for invalid input
    
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

const formatMessage = (message, mentions) => {
  if (!message || !Array.isArray(mentions)) return "";

  let formattedMessage = message;
  const user = mentions.find((m) => m?.type === "user");
  const workspace = mentions.find((m) => m?.type === "workspace");

  // Replace user mention with link
  if (user?._id) {
    formattedMessage = formattedMessage.replace(
      `@USER:${user._id}`,
      "{{user}}"
    );
  }

  // Replace workspace mention with link
  if (workspace?._id) {
    formattedMessage = formattedMessage.replace(
      `@WORKSPACE:${workspace._id}`,
      "{{workspace}}"
    );
  }

  // Split and map parts
  const parts = formattedMessage.split(/({{user}}|{{workspace}})/);

  return parts.map((part, index) => {
    if (part === "{{user}}" && user) {
      return (
        <Link
          key={`user-${index}`}
          href={`/@${user.username}`}
          onClick={(e) => e.stopPropagation()}
          className="font-bold hover:underline"
        >
          {user.name}
        </Link> 
      );
    }
    if (part === "{{workspace}}" && workspace) {
      return (
        <Link
          key={`workspace-${index}`}
          href={`/@${workspace.username}`}
          onClick={(e) => e.stopPropagation()}
          className="font-bold hover:underline inline-flex items-center"
        >
          {workspace.name}
          <span className="ml-1">
            <UserAvatar user={workspace} size="small" />
          </span>
        </Link> 
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
};

const WorkspaceNotification = ({ notification }) => {
  if (!notification) {
    return null;
  }

  const user = notification.mentions?.find((m) => m?.type === "user");
  const workspace = notification.mentions?.find((m) => m?.type === "workspace");

  let href = "#";
  if (notification.type === "newWorkspaceInvite" && notification.invite?._id) {
    href = `/workspace/respond-to-an-invite/${notification.invite._id}`;
  } else if (
    (notification.type === "acceptedWorkspaceInvite" || 
     notification.type === "declinedWorkspaceInvite") && 
    workspace?.username
  ) {
    href = `/@${workspace.username}`;
  }

  if (!user) {
    return null;
  }

  return (
    <div
      onClick={() => (window.location.href = href)}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer"
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <Link
            href={`/@${user.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <UserAvatar user={user} />
          </Link> 
          <div className="flex flex-col justify-center ml-1.5 min-w-0">
            <Link
              href={`/@${user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold hover:underline text-[14px] leading-tight truncate"
            >
              {user.name}
            </Link> 
            <Link
              href={`/@${user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 text-[14px] -mt-[3px] truncate hover:underline"
            >
              @{user.username}
            </Link> 
          </div>
        </div>

        <div className="pl-1">
          <p className="text-[15px]">
            {formatMessage(notification.message, notification.mentions)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {moment(notification.createdAt).fromNow()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceNotification;