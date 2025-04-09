"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import TelegramConnect from "./TelegramConnect"; // Adjust the import path as necessary

const Authenticate = () => {
  const router = useRouter(); // Add this
  const userProfile = useSelector((state) => state.auth.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/api/auth/google/sign-in/initiate");
    }, 500);
  };

  // New User View - Focus on value proposition
  const NewUserView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to the home of &quot;what you call your fanbase&quot;
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Together we kick it. Together we play.
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white italic">
              &quot;My team will win this season.&quot;
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex justify-end mt-1">
              — Every seasaon, every Arsenal fan.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Play together.
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Play with other &quot;what you call your fanbase&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
            dark:hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg
            transition-all duration-300 transform hover:scale-[1.02]
            disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span
                className="h-4 w-4 border-2 border-gray-600 dark:border-slate-400
                      border-t-transparent rounded-full animate-spin"
              />
              <span className="text-gray-800 dark:text-slate-200">
                Connecting to Google...
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src="/google-logo/logo-with-no-background.svg"
                width={20}
                height={20}
                alt="Google logo"
                className="mr-2 rounded-full"
              />
              <span>Continue with Google</span>
            </div>
          )}
        </Button>

        <TelegramConnect />

        <button
          onClick={() => setIsNewUser(false)}
          className="w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 
            dark:hover:text-white transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  // Existing User View - Focused on quick login
  const ExistingUserView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          We are waiting for you
        </p>
      </div>

      <Button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
          dark:hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg
          transition-all duration-300 transform hover:scale-[1.02]
          disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Image
              src="/google-logo/logo-with-no-background.svg"
              width={20}
              height={20}
              alt="Google logo"
              className="mr-2"
            />
            <span>Sign in with Google</span>
          </div>
        )}
      </Button>

      <TelegramConnect />

      <button
        onClick={() => setIsNewUser(true)}
        className="w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 
          dark:hover:text-white transition-colors"
      >
        New to here? Create account
      </button>
    </div>
  );

  // Already authenticated view
  if (userProfile?.uuid) {
    return (
      <div
        className="flex items-center justify-center min-h-screen 
        bg-gradient-to-br from-indigo-50 to-purple-50 
        dark:from-gray-900 dark:to-slate-900 p-4"
      >
        <Card
          className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 
          border-gray-200 dark:border-gray-700"
        >
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <Image
              src="/your-logo-here.png"
              alt="your-logo-here"
              height={48}
              width={48}
              className="dark:block hidden"
            />
            <Image
              src="/your-logo-here.png"
              alt="your-logo-here"
              height={48}
              width={48}
              className="dark:hidden block"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              Kama kawa, Welcome back, {userProfile.name}!
            </h2>
            <Button
              asChild
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 
                dark:hover:bg-indigo-700 text-white text-lg font-semibold py-6"
            >
              <Link href="/arena">Enter Arena</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen 
      bg-gradient-to-br from-indigo-50 to-purple-50 
      dark:from-gray-900 dark:to-slate-900 p-4"
    >
      <Card
        className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 
        border-gray-200 dark:border-gray-700"
      >
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Image
              src="/your-logo-here.png"
              alt="your-logo-here"
              height={40}
              width={40}
              className="dark:block hidden"
            />
            <Image
              src="/your-logo-here.png"
              alt="your-logo-here"
              height={40}
              width={40}
              className="dark:hidden block"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isNewUser ? <NewUserView /> : <ExistingUserView />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Authenticate;
