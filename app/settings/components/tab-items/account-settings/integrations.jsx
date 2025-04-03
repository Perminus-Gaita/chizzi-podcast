import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Settings, Check } from "lucide-react";


const TelegramConnect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedUser, setConnectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTelegramUser();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const fetchTelegramUser = async () => {
    try {
      const response = await fetch('/api/integrations/telegram/user');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setConnectedUser(null);
      } else {
        setConnectedUser({
          ...data.telegramUser,
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch Telegram connection status');
      setConnectedUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !connectedUser) {
      // Only set up Telegram widget if user is not connected.
      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-auth-url", `${window.location.origin}/api/integrations/telegram/callback`);
      script.async = true;

      const container = document.getElementById('telegram-login-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(script);
      }

      return () => {
        if (container) {
          container.innerHTML = '';
        }
      };
    }
  }, [isLoading, connectedUser]);

  const handleDisconnect = () => {
    // Add disconnect logic here when you have the endpoint
    setIsConnecting(true);
    setTimeout(() => {
      setConnectedUser(null);
      setIsConnecting(false);
    }, 1000);
  };

  return (
    <Card className="border-0 min-h-[410px]">
      <CardHeader className="text-center">
        <CardDescription>Manage your integrations</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 border-b hover:bg-muted/10 transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading your integrations...</p>
          </div>
        ) : connectedUser ? (
          <div>
            {/* Connected Status and Settings */}
            <div className="flex justify-between items-center pt-4 px-6 pb-2">
              <Badge 
                variant="success" 
                className="text-sm px-4 py-1 text-green-500"
              >
                Telegram Account Connected
                <Check className="h-5 w-5 ml-2" />
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12">
                    <Settings className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="text-red-500 focus:text-red-500"
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Info Section */}
            <div className="pb-4 px-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={connectedUser.photoUrl} 
                      alt={`${connectedUser.firstName} ${connectedUser.lastName}`}
                    />
                    <AvatarFallback>
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${connectedUser.firstName} ${connectedUser.lastName}`}
                        alt={`${connectedUser.firstName} ${connectedUser.lastName}`}
                        className="h-full w-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm leading-tight truncate">
                    {[connectedUser.firstName, connectedUser.lastName]
                      .filter(Boolean)
                      .join(" ") || "No name provided"}
                  </div>
                  <div className="text-muted-foreground text-sm truncate">
                    @{connectedUser.username || "No username"}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Connected on: {formatDate(connectedUser.authorizationDate)}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {error || "No telegram account connected."}
              </p>
              {isConnecting ? (
                <Button 
                  disabled
                  className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting Telegram Account
                </Button>
              ) : (
                <div id="telegram-login-container" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramConnect;