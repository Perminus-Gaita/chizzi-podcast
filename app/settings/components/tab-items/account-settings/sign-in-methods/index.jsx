import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import TelegramConnect from './telegram-connect2'; // Import the new TelegramConnect component

const SignInMethods = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [googleUser, setGoogleUser] = useState(null);
  const [telegramUser, setTelegramUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await fetch('/api/user/session');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch user session');
        setGoogleUser(null);
        setTelegramUser(null);
      } else {
        if (data.google?.userId) {
          setGoogleUser({
            name: data.google.name,
            email: data.google.email,
            photoUrl: data.google.profilePicture
          });
        }

        if (data.telegram?.userId) {
          setTelegramUser({
            firstName: data.telegram.firstName,
            lastName: data.telegram.lastName,
            username: data.telegram.username,
            photoUrl: data.telegram.profilePicture
          });
        }
      }
    } catch (err) {
      setError('Failed to fetch user session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/add-sign-in-method/google/initiate';
  };

  const handleTelegramConnect = (telegramData) => {
    if (telegramData) {
      setTelegramUser({
        firstName: telegramData.firstName,
        lastName: telegramData.lastName,
        username: telegramData.username,
        photoUrl: telegramData.profilePicture
      });
    }
  };

  return (
    <Card className="border-0 min-h-[410px]">
      <CardHeader className="text-center">
        <h2 className="text-xl font-semibold">Manage how you sign in to your account</h2>
        <CardDescription>Add your Google or Telegram accounts as ways to sign-in to your account.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 border-b hover:bg-muted/10 transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading your sign-in methods...</p>
          </div>
        ) : (
          <div>
            {/* Google Account */}
            <div className="p-6 border-b">
              {googleUser ? (
                <>
                  <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/google-logo/logo-with-no-background.svg"
                        width={16}
                        height={16}
                        alt="Google logo"
                        className="rounded-full"
                      />
                      <span>Google Account Connected</span>
                    </div>
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={googleUser.photoUrl} alt={googleUser.name} />
                      <AvatarFallback>
                        {googleUser.name?.charAt(0) || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-tight truncate">
                        {googleUser.name}
                      </div>
                      <div className="text-muted-foreground text-sm truncate">
                        {googleUser.email}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Button 
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleGoogleConnect}
                >
                  <div className="flex items-center justify-center">
                    <Image
                      src="/google-logo/logo-with-no-background.svg"
                      width={20}
                      height={20}
                      alt="Google logo"
                      className="mr-2 rounded-full"
                    />
                    <span>Connect Google Account</span>
                  </div>
                </Button>
              )}
            </div>

            {/* Telegram Account */}
            <div className="p-6">
              {telegramUser ? (
                <span className="h-[120px]">
                  <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <div className="flex items-center gap-2">
                      <svg
                        style={{ width: '16px', height: '16px' }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z"/>
                      </svg>
                      <span>Telegram Account Connected</span>
                    </div>
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={telegramUser.photoUrl} 
                        alt={`${telegramUser.firstName} ${telegramUser.lastName}`} 
                      />
                      <AvatarFallback>
                        {telegramUser.firstName?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-tight truncate">
                        {[telegramUser.firstName, telegramUser.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div className="text-muted-foreground text-sm truncate">
                        {telegramUser.username ? `@${telegramUser.username}` : '[no telegram username set]'}
                      </div>
                    </div>
                  </div>
                </span>
              ) : (
                <div className="h-[35px]">
                  <TelegramConnect onTelegramConnect={handleTelegramConnect} />
                </div>
              )}
            </div>
          </div>
        
        )}
      </CardContent>
    </Card>
  );
};

export default SignInMethods;