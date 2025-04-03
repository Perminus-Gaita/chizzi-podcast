"use client";
import { useRef, useState } from "react";
import moment from "moment";
import {
  Info,
  Send,
  Lock,
  X,
  Loader2,
  Trash2,
  Users,
  MessageSquare,
  Shield,
  Zap,
  Settings,
  SmilePlus,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Dummy chat message component
const ChatMessage = ({ message, onDelete }) => {
  const { sender, content, timestamp, isOwnMessage } = message;
  
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
              src={sender.profilePicture || "/default_profile.png"}
            />
            <AvatarFallback>{sender.username[0]}</AvatarFallback>
          </Avatar>

          <div
            className={`flex flex-col ${
              isOwnMessage ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {sender.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {moment(timestamp).format("HH:mm")}
              </span>

              <div
                className={`absolute ${
                  isOwnMessage ? "-left-12" : "-right-12"
                } top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50`}
              >
                {isOwnMessage && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onDelete(message.id)}
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
            </div>

            <div
              className={`mt-1 px-3 py-2 rounded-lg ${
                isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
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

const LobbyChatContainerDummy = ({
  chatOpen,
  setChatOpen,
  isSmallScreen,
  toggleMobileChat,
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  
  // Dummy chat data
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: {
        username: "Alex",
        profilePicture: "/default_profile.png"
      },
      content: "Hey everyone! Anyone up for a game?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isOwnMessage: false
    },
    {
      id: 2,
      sender: {
        username: "Taylor",
        profilePicture: "/default_profile.png"
      },
      content: "I'm available for a match!",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      isOwnMessage: false
    },
    {
      id: 3,
      sender: {
        username: "Jordan",
        profilePicture: "/default_profile.png"
      },
      content: "Good game everyone! That was close.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isOwnMessage: false
    },
    {
      id: 4,
      sender: {
        username: "You",
        profilePicture: "/default_profile.png"
      },
      content: "I'd like to join the next game please!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isOwnMessage: true
    },
    {
      id: 5,
      sender: {
        username: "Casey",
        profilePicture: "/default_profile.png"
      },
      content: "We'll start a new room in 5 minutes. Anyone else want to join?",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      isOwnMessage: false
    }
  ]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: {
          username: "You",
          profilePicture: "/default_profile.png"
        },
        content: chatMessage,
        timestamp: new Date(),
        isOwnMessage: true
      };
      
      setMessages([...messages, newMessage]);
      setChatMessage("");
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const handleQuickCommand = (command) => {
    let commandMessage = "";
    
    switch (command) {
      case "play":
        commandMessage = "🎮 Looking for a game! Anyone want to play?";
        break;
      case "tournament":
        commandMessage = "🏆 Looking to join/organize a tournament! Who's interested?";
        break;
      case "games":
        commandMessage = "Has anyone played any good matches today?";
        break;
      default:
        return;
    }
    
    const newMessage = {
      id: messages.length + 1,
      sender: {
        username: "You",
        profilePicture: "/default_profile.png"
      },
      content: commandMessage,
      timestamp: new Date(),
      isOwnMessage: true
    };
    
    setMessages([...messages, newMessage]);
  };

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
          <div className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            Lobby Chat
          </span>
          <span className="text-xs text-gray-500">(12 online)</span>
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
                ? () => toggleMobileChat(false)
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
                  </ul>
                </div>
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
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onDelete={handleDeleteMessage}
                  ref={
                    index === messages.length - 1
                      ? lastMessageRef
                      : null
                  }
                />
              ))}
            </div>

            <div
              className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4"
              style={{
                position: "absolute",
                bottom: isSmallScreen ? "20px" : "10px",
                left: 0,
                right: 0,
              }}
            >
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

                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  variant="default"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyChatContainerDummy;