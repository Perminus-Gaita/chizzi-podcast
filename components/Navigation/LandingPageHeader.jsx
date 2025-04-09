"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  Trophy,
  Gamepad,
  Users,
  ChevronDown,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Wallet,
  Medal,
  History,
  Star,
  Loader2,
  Shield,
  GraduationCap,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { setProfile } from "@/app/store/authSlice";
import { fetcher } from "@/lib/fetch";
import { useWalletHandler } from "@/lib/user";
import { useIsMobile } from "@/hooks/useIsMobile";
import { createNotification } from "@/app/store/notificationSlice";
import { useCardsStats } from "@/lib/cards";

const LandingPageHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const isMobile = useIsMobile();

  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useWalletHandler();

  const {
    data: statsData,
    error: statsError,
    mutate: statsMutate,
    isLoading: statsLoading,
  } = useCardsStats();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const userProfile = useSelector((state) => state.auth.profile);
  const isAuthenticated = !!userProfile;

  const features = [
    {
      name: "Tournaments",
      description: "Host and join competitive events with cash prizes",
      icon: Trophy,
      href: "/arena?tab=tournaments",
    },
    {
      name: "Game Rooms",
      description: "Create private rooms for casual matches",
      icon: Gamepad,
      href: "/arena?tab=games",
    },
    {
      name: "Leaderboards",
      description: "Compete for top rankings and track your progress",
      icon: Medal,
      href: "/arena?tab=leaderboard",
    },
    // {
    //   name: "Community",
    //   description: "Build your following and monetize tournaments",
    //   icon: Users,
    //   href: "/community",
    // },
  ];

  const integrations = [
    {
      name: "Discord",
      description: "Connect your gaming community",
      icon: "/discord.svg",
    },
    {
      name: "YouTube",
      description: "Stream tournaments live",
      icon: "/youtube.png",
    },
    {
      name: "TikTok",
      description: "Share epic gaming moments",
      icon: "/tiktok.png",
    },
  ];

  const handleSubmitDemo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const roomName = `table-${Math.random().toString(36).substring(2, 8)}`;

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: `Creating game room...`,
      })
    );

    setTimeout(() => {
      setMobileMenuOpen(false);
    }, 2000);

    try {
      const response = await axios.post("/api/cards/create-test-room", {
        roomName: roomName,
        creator: userProfile?.uuid,
        maxPlayers: 2,
        timer: false,
        amount: 0,
        joker: true,
      });

      if (response.status === 201) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response?.data.message,
          })
        );

        router.push(`/kadi/${response.data.slug}`);

        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating cards room:", error);
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Something went wrong",
        })
      );
      setLoading(false);
    }
  };

  const onLogout = useCallback(async () => {
    try {
      await fetcher("/api/auth/log-out", {
        method: "DELETE",
      });
      dispatch(setProfile(null));

      document.cookie =
        "sessionCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setDropdownOpen(false);

      router.push("/");
    } catch (error) {
      // console.log("Error signing out");
      // console.log(error.message);
      return;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed w-full top-0 z-50  backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/wufwuf-logo/white.png"
              alt="Wufwuf"
              className="h-8 w-8"
            />
            <span className="text-lg md:text-xl font-bold text-white">
              Wufwuf
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-300 hover:text-white">
                Features <ChevronDown className="h-4 w-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl p-4">
                  {features.map((feature) => (
                    <Link
                      key={feature.name}
                      href={feature.href}
                      className="flex items-start gap-4 p-3 hover:bg-gray-700 rounded-lg"
                    >
                      <feature.icon className="h-6 w-6 text-indigo-400" />
                      <div>
                        <div className="font-medium text-white">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div> */}

            <Link href="/arena" className="text-gray-300 hover:text-white">
              Arena
            </Link>
            <Link href="/kadi/learn" className="text-gray-300 hover:text-white">
              Learn Kadi
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white">
              Blog
            </Link>
            {/* <Link href="/plans" className="text-gray-300 hover:text-white">
              Plans
            </Link> */}
          </nav>

          {/* Auth Section - Different states based on authentication */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <div className="relative">
                    <img
                      src={userProfile.profilePicture || "/default-avatar.png"}
                      alt="Profile"
                      className="h-8 w-8 rounded-full border border-gray-600"
                    />
                    {userProfile.isOnline && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-800"></div>
                    )}
                  </div>

                  {statsData?.ranking && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-300">
                        {userProfile.username}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{statsData?.ranking.title}</span>
                        <span>•</span>
                        <span>{statsData?.ranking.rating} RP</span>
                      </div>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-1 border border-gray-700"
                  >
                    <div className="px-4 py-2 border-b border-gray-700">
                      <Link
                        href="/wallet"
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center text-gray-400">
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Balance</span>
                        </div>
                        <div className="ml-4">
                          {walletData && !walletError && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">
                                KES {(walletData.balances.KES / 100).toFixed(2)}
                              </p>
                              <p className="text-sm font-medium text-white">
                                USD {walletData.balances.USD.toFixed(2)}
                              </p>
                            </div>
                          )}

                          {walletError && (
                            <div className="flex flex-col items-center justify-center p-8">
                              <p className="text-primaryRed font-medium">
                                No data
                              </p>
                            </div>
                          )}

                          {walletLoading && (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          )}
                        </div>
                      </Link>

                      {/* <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Balance</span>
                        <span className="font-medium text-white">
                          ${userProfile.balance || "0.00"}
                        </span>
                      </div> */}
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/${userProfile.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href={`/${userProfile.username}`}
                        className="flex items-center justify-between px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-gray-400 group-hover:text-white" />
                          <span>My Tournaments</span>
                        </div>
                        {userProfile.activeTournaments > 0 && (
                          <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {userProfile.activeTournaments}
                          </span>
                        )}
                      </Link>

                      {/* <Link
                        href="/match-history"
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <History className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>Match History</span>
                      </Link>

                      <Link
                        href="/teams"
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <Users className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>My Teams</span>
                      </Link> */}
                    </div>

                    <div className="border-t border-gray-700 py-1">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white group transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {userProfile && isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={userProfile?.profilePicture || "/default_profile.png"}
                  alt={userProfile?.name}
                />
                <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          )}

          {!userProfile && isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          {!userProfile && !isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900 z-50">
          <div className="px-4 h-14 flex items-center justify-between bg-background backdrop-blur-sm border-b border-gray-800">
            <div className="flex items-center gap-2">
              <img
                src="/wufwuf-logo/white.png"
                alt="Wufwuf"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-white">Wufwuf</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="overflow-y-auto h-[100vh]">
            <div className="px-4 py-6 space-y-6 bg-gray-900/95 backdrop-blur-sm h-full">
              {isAuthenticated && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="relative">
                    <img
                      src={userProfile.profilePicture || "/default-avatar.png"}
                      alt="Profile"
                      className="h-12 w-12 rounded-full border-2 border-gray-700"
                    />
                    {userProfile.isTournamentOrganizer && (
                      <Shield className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <div className="text-white font-medium">
                      {userProfile.username}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-400">
                      {statsData?.ranking && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>{statsData?.ranking.title}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{statsData?.ranking.rating} RP</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-1 sm:mt-0">
                        <Wallet className="h-4 w-4" />
                        {walletData && !walletError ? (
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-medium text-white">
                              KES {(walletData.balances.KES / 100).toFixed(2)}
                            </p>
                            <p className="text-xs font-medium text-white">
                              USD {walletData.balances.USD.toFixed(2)}
                            </p>
                          </div>
                        ) : walletError ? (
                          <p className="text-primaryRed font-medium">No data</p>
                        ) : (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div className="space-y-4">
                  <div className="text-center">
                    <button
                      onClick={handleSubmitDemo}
                      disabled={loading}
                      className={`w-full px-6 py-3 rounded-lg ${
                        loading
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      } transition-colors`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Match...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Gamepad className="h-5 w-5" />
                          <span>Quick Match</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {/* {features.map((feature) => (
                  <Link
                    key={feature.name}
                    href={feature.href}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                  >
                    <feature.icon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    <span className="text-base group-hover:text-white">
                      {feature.name}
                    </span>
                  </Link>
                ))} */}

                <Link
                  href="/arena"
                  className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                >
                  <Home className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-base group-hover:text-white">
                    Arena
                  </span>
                </Link>

                <Link
                  href="/kadi/learn"
                  className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                >
                  <GraduationCap className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-base group-hover:text-white">
                    Learn Kadi
                  </span>
                </Link>

                <Link
                  href="/plans"
                  className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                >
                  <Star className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-base group-hover:text-white">
                    Plans
                  </span>
                </Link>
              </div>

              {isAuthenticated ? (
                <div className="space-y-1 border-t border-gray-800 pt-4">
                  <Link
                    href={`/${userProfile.username}`}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                  >
                    <User className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    <span className="text-base group-hover:text-white">
                      Profile
                    </span>
                  </Link>
                  {/* <Link
                    href="/match-history"
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                  >
                    <History className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    <span className="text-base group-hover:text-white">
                      Match History
                    </span>
                  </Link> */}
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                  >
                    <Settings className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    <span className="text-base group-hover:text-white">
                      Settings
                    </span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg group"
                  >
                    <LogOut className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    <span className="text-base group-hover:text-white">
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3 text-center text-white bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3 text-center text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium"
                  >
                    Start Playing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingPageHeader;
