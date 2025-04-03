"use client";
import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  Info,
  Send,
  Lock,
  X,
  Loader2,
  MoreVertical,
  Trash2,
  Clock,
  Trophy,
  Users,
  MessageSquare,
  Shield,
  Swords,
  Zap,
  Settings,
  SmilePlus,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { useLobbySocket } from "@/hooks/useLobbySocket";
import LobbyEmojiPicker from "@/components/LobbyEmojiPicker";

const ChatMessage = ({
  message,
  onDelete,
  onQuickGame,
  onReact,
  currentChallenges,
  onChallenge,
}) => {
  const reactionsRef = useRef(null);

  const userProfile = useSelector((state) => state.auth.profile);
  const isOwnMessage = message?.sender._id === userProfile?.uuid;
  const [showReactions, setShowReactions] = useState(false);

  const [showActions, setShowActions] = useState(false);

  const hasPendingChallenge = currentChallenges.has(message.sender._id);

  const canChallenge =
    !isOwnMessage && !message.isDeleted && !hasPendingChallenge;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reactionsRef.current &&
        !reactionsRef.current.contains(event.target)
      ) {
        setShowReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick reactions array
  const quickReactions = [
    { emoji: "🎮", name: "game" },
    { emoji: "🔥", name: "fire" },
    { emoji: "👊", name: "fist" },
    { emoji: "👍", name: "thumbsup" },
  ];

  const canDelete =
    isOwnMessage &&
    !message.isDeleted &&
    new Date() - new Date(message.createdAt) <= 5 * 60 * 1000;

  if (message.isDeleted) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
        <Clock className="w-4 h-4" />
        <span>[Message deleted]</span>
      </div>
    );
  }

  // Render reactions below message
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = message.reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {});

    return (
      <div
        className={`flex flex-wrap gap-1 mt-1 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => onReact(message._id, emoji)}
            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 
              ${
                message.reactions.some(
                  (r) => r.userId === userProfile?.uuid && r.emoji === emoji
                )
                  ? "bg-primary/20"
                  : "bg-primary/10"
              } 
              hover:bg-primary/30 transition-colors`}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative group">
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } relative`}
      >
        <div
          className={`flex ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          } items-start space-x-2 max-w-[85%]`}
        >
          <Avatar>
            <AvatarImage
              src={message?.sender?.profilePicture || "/default_profile.png"}
            />
            <AvatarFallback>{message?.sender.username[0]}</AvatarFallback>
          </Avatar>

          <div
            className={`flex flex-col ${
              isOwnMessage ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {message?.sender.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {moment(message.createdAt).format("HH:mm")}
              </span>

              {/* Message Actions Dropdown */}
              <div className="relative">
                {/* Quick Actions */}
                {/* <div
                  className={`absolute ${
                    isOwnMessage ? "right-full mr-2" : "left-full ml-2"
                  } top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                > */}
                {/* 
                <div
                  className={`absolute ${
                    isOwnMessage
                      ? "left-0 -translate-x-full"
                      : "right-0 translate-x-full"
                  } 
        top-0 flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity`}
                > */}

                <div
                  className={`absolute ${
                    isOwnMessage ? "-left-12" : "-right-12"
                  } top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50`}
                >
                  {/* {canChallenge && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onChallenge(message.sender)}
                            className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                          >
                            <Users className="w-4 h-4 text-primary" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Challenge to match</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )} */}
                  {/* Reactions Button */}
                  {/* <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowReactions(!showReactions)}
                          className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                        >
                          <SmilePlus className="w-4 h-4 text-primary" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add Reaction</TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}
                  {canDelete && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              onDelete({
                                messageId: message._id,
                                user: {
                                  userId: userProfile?.uuid,
                                  username: userProfile?.username,
                                  profilePicture: userProfile?.profilePicture,
                                },
                              })
                            }
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* Reactions Popup */}
                {showReactions && (
                  <div
                    ref={reactionsRef}
                    className={`absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-full p-1 flex gap-1
                      ${
                        isOwnMessage ? "right-full mr-2" : "left-full ml-2"
                      } top-0`}
                  >
                    {quickReactions.map((reaction) => (
                      <button
                        key={reaction.name}
                        onClick={() => {
                          onReact(message._id, reaction.emoji);
                          setShowReactions(false);
                        }}
                        className="p-1.5 hover:bg-primary/10 rounded-full transition-colors text-sm"
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`mt-1 px-3 py-2 rounded-lg ${
                isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.message}
              </p>
            </div>

            {hasPendingChallenge && (
              <div className="text-xs text-primary italic mt-1">
                Challenge sent •{" "}
                {currentChallenges.get(message.sender._id).gameType} •
                Waiting...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reactions display */}
      {/* {renderReactions()} */}
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, command, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
  >
    <Icon className="w-4 h-4 text-primary" />
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    {command && (
      <span className="ml-auto text-xs text-gray-400 font-mono">
        !{command}
      </span>
    )}
  </button>
);

const useTimeLeft = (endTime) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};

// Challenge notification that appears when someone challenges you
const ChallengeNotification = ({ challenge, onAccept, onDecline }) => {
  const timeLeft = useTimeLeft(challenge.timestamp + 60000); // 60 seconds

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-primary/20 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage
            src={challenge.challenger.profilePicture || "/default_profile.png"}
          />
          <AvatarFallback>{challenge.challenger.username[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-sm">
              {challenge.challenger.username}
            </p>
            <span className="text-xs text-primary">{timeLeft}s</span>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            Challenged you to a {challenge.gameType} match!
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={onAccept}
              className="w-full"
            >
              Accept ({timeLeft}s)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDecline}
              className="w-full"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LobbyChatContainer = ({
  chatOpen,
  setChatOpen,
  isSmallScreen,
  toggleMobileChat,
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setChatMessage((prev) => prev + emoji.native);
  };

  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const userProfile = useSelector((state) => state.auth.profile);

  const {
    connectionStatus,
    chatsData,
    chatsLoading,
    chatsError,
    loadingChat,
    onlineUsers,
    typingUsers,
    sendLobbyMessage,
    handleMessageDeletion,
    handleTyping,
    addReaction,
    replyToMessage,
    currentChallenges,
    incomingChallenges,
    setCurrentChallenges,
    setIncomingChallenges,

    sendGameChallenge,
    acceptGameChallenge,
    declineGameChallenge,
  } = useLobbySocket();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatsData.messages]);

  const handleSendMessage = () => {
    // console.log("### THE EMSSAGE ###");
    // console.log(chatMessage);

    if (chatMessage.trim()) {
      sendLobbyMessage({
        message: chatMessage,
        user: {
          userId: userProfile?.uuid,
          username: userProfile?.username,
          profilePicture: userProfile?.profilePicture,
        },
      });
      setChatMessage("");
    }
  };

  const renderTypingIndicator = () => {
    const typingCount = typingUsers.size;
    if (typingCount === 0) return null;

    const typingText =
      typingCount === 1
        ? `${Array.from(typingUsers)[0]} is typing...`
        : `${typingCount} people are typing...`;

    return (
      <div className="text-xs text-gray-500 italic ml-4">{typingText}</div>
    );
  };

  const handleQuickGame = (opponent) => {
    const challenge = `@${opponent.username} Want to play a quick game? 🎮`;
    setChatMessage(challenge);
  };

  const handleQuickCommand = (command) => {
    switch (command) {
      case "play":
        sendLobbyMessage({
          message: "🎮 Looking for a game! Anyone want to play?",
          user: {
            userId: userProfile?.uuid,
            username: userProfile?.username,
            profilePicture: userProfile?.profilePicture,
          },
        });
        break;
      case "tournament":
        sendLobbyMessage({
          message:
            "🏆 Looking to join/organize a tournament! Who's interested?",
          user: {
            userId: userProfile?.uuid,
            username: userProfile?.username,
            profilePicture: userProfile?.profilePicture,
          },
        });
        break;
      // Add more quick commands as needed
    }
  };

  const handleChallenge = (targetUser, gameType) => {
    // Add to current challenges
    setCurrentChallenges((prev) => {
      const updated = new Map(prev);
      updated.set(targetUser._id, {
        targetUser,
        gameType,
        timestamp: Date.now(),
      });
      return updated;
    });

    // Send challenge through socket
    sendGameChallenge({
      targetUser,
      gameType,
    });

    // Auto-remove after 60 seconds
    setTimeout(() => {
      setCurrentChallenges((prev) => {
        const updated = new Map(prev);
        updated.delete(targetUser._id);
        return updated;
      });
    }, 60000);

    // Send chat message
    const challengeMsg = `@${targetUser.username} I've challenged you to a ${gameType} match! 🎮`;
    handleSendMessage(challengeMsg);
  };

  const handleAcceptChallenge = (challengerId) => {
    acceptGameChallenge(challengerId);
    setIncomingChallenges((prev) => {
      const updated = new Map(prev);
      updated.delete(challengerId);
      return updated;
    });
  };

  const handleDeclineChallenge = (challengerId) => {
    setIncomingChallenges((prev) => {
      const updated = new Map(prev);
      updated.delete(challengerId);
      return updated;
    });
  };

  // Handle clicking outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="h-screen transition-transform duration-300 ease-in-out
      bg-white dark:bg-gray-800"
      style={{
        zIndex: 1000,
        height: isSmallScreen ? "100vh" : "100vh",
        width: isSmallScreen ? "100%" : "300px",
        transform: chatOpen ? "translateX(300%)" : "translateX(0)",
        transition: "transform 0.3s linear",
        position: isSmallScreen ? "relative" : "fixed",
        top: !isSmallScreen && 0,
        right: !isSmallScreen && 0,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            Lobby Chat
          </span>
          <span className="text-xs text-gray-500">({onlineUsers} online)</span>
        </div>

        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Users className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Quick Actions</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            className={`text-gray-500 hover:text-gray-700 ${
              showInfo ? "text-primary" : ""
            }`}
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            onClick={
              isSmallScreen
                ? toggleMobileChat(false)
                : () => setChatOpen(!chatOpen)
            }
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showQuickActions && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <QuickAction
            icon={Users}
            label="Find Game"
            command="play"
            onClick={() => handleQuickCommand("play")}
          />
          <QuickAction
            icon={Trophy}
            label="Join Tournament"
            command="tournament"
            onClick={() => handleQuickCommand("tournament")}
          />
          <QuickAction
            icon={MessageSquare}
            label="Recent Games"
            command="games"
            onClick={() => handleQuickCommand("games")}
          />
        </div>
      )}

      <div className="relative" style={{ height: "calc(100vh - 64px)" }}>
        {showInfo ? (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 overflow-y-auto scroll_style">
            <div className="p-6 space-y-6">
              {/* Welcome Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-primary">
                  <MessageSquare className="w-7 h-7" />
                  <div>
                    <h2 className="text-xl font-bold">Kadi Lobby Chat</h2>
                    <p className="text-sm text-muted-foreground">
                      Where the Kadi community comes together
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Commands Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                  <Zap className="w-5 h-5" />
                  <h3 className="font-semibold">Quick Commands</h3>
                </div>

                <div className="grid gap-3">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-medium">Find Players</span>
                      </div>
                      <code className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                        !play
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Broadcast you're looking for 2-4 player matches
                    </p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium">Tournament Mode</span>
                      </div>
                      <code className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                        !tournament
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Find players for tournaments or create your own
                    </p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Swords className="w-4 h-4 text-primary" />
                        <span className="font-medium">Challenge Player</span>
                      </div>
                      <code className="px-2 py-0.5 bg-primary/10 rounded text-xs">
                        @username
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Challenge specific players to a match
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                  <Settings className="w-5 h-5" />
                  <h3 className="font-semibold">Chat Features</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <MessageSquare className="w-4 h-4 mb-2 text-primary" />
                    <h4 className="text-sm font-medium mb-1">
                      Message History
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      5-minute edit window for messages
                    </p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg">
                    <Users className="w-4 h-4 mb-2 text-primary" />
                    <h4 className="text-sm font-medium mb-1">Player Status</h4>
                    <p className="text-xs text-muted-foreground">
                      See who's online and ready
                    </p>
                  </div>
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-primary">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-semibold">Community Guidelines</h3>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2" />
                      <span>
                        Keep discussions focused on Kadi, games, and tournaments
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2" />
                      <span>
                        Be respectful to fellow players and maintain fair play
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2" />
                      <span>Report any suspicious behavior to moderators</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Get Started */}
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-sm font-medium mb-2">Ready to Play?</p>
                <p className="text-xs text-muted-foreground">
                  Use !play to find your first match or watch ongoing games to
                  learn
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="scroll_style flex-1 overflow-y-auto p-4 space-y-4"
              style={{
                height: isSmallScreen
                  ? "calc(100vh - 200px)"
                  : "calc(100vh - 128px)",
                paddingBottom: !isSmallScreen && "100px",
              }}
            >
              {chatsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                Array.isArray(chatsData?.messages) &&
                chatsData.messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    onDelete={handleMessageDeletion}
                    ref={
                      index === chatsData.messages.length - 1
                        ? lastMessageRef
                        : null
                    }
                    currentChallenges={currentChallenges}
                    onChallenge={handleChallenge}
                  />
                ))
              )}

              {renderTypingIndicator()}
            </div>

            {Array.from(incomingChallenges.entries()).map(
              ([challengerId, challenge]) => (
                <ChallengeNotification
                  key={challengerId}
                  challenge={challenge}
                  onAccept={() => handleAcceptChallenge(challengerId)}
                  onDecline={() => handleDeclineChallenge(challengerId)}
                />
              )
            )}

            <div
              className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4"
              style={{
                position: "absolute",
                bottom: isSmallScreen ? "20px" : "10px",
                left: 0,
                right: 0,
              }}
            >
              {userProfile ? (
                <div className="flex items-center space-x-2 relative">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-dark dark:text-white"
                    rows={2}
                  />

                  <div className="absolute right-12 bottom-2">
                    <LobbyEmojiPicker
                      onEmojiSelect={handleEmojiSelect}
                      disabled={loadingChat}
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={loadingChat}
                    size="icon"
                    variant="default"
                  >
                    {loadingChat ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center items-center space-x-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Login to Chat</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyChatContainer;
