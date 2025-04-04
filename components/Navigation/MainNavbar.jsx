"use client";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useWalletHandler } from "@/lib/user";
import { useThemeSwitcher } from "@/lib/theme/useThemeSwitcher";
import NotificationsMenu from "./NotificationsMenu";
import { fetcher } from "@/lib/fetch";
import { setProfile } from "@/app/store/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Wallet,
  Receipt,
  Home,
  Moon,
  Sun,
  LogOut,
  Menu,
  User,
  X,
  Loader2,
  BarChart2,
  Plug2,
  Settings,
  Check,
  ChevronDown,
  Plus,
  Trophy,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  createNotification,
  markNotificationsAsRead,
} from "@/app/store/notificationSlice";
import { useUserHandler } from "@/lib/user";
import { useCardsStats } from "@/lib/cards";
import { setCurrentTutorialModule } from "@/app/store/pageSlice";
import TutorialNavBreadCrumbs from "./TutorialNavBreadCrumbs";

const MainNavbar = ({ handleSidebarClose, handleSidebarOpen }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const scrollRef = useRef(null);

  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useWalletHandler();

  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useUserHandler();

  const {
    data: statsData,
    error: statsError,
    mutate: statsMutate,
    isLoading: statsLoading,
  } = useCardsStats();

  // const { data: walletData, error: walletError } = useWalletHandler();
  const [mode, setMode] = useThemeSwitcher();
  const userProfile = useSelector((state) => state.auth.profile);
  const openLeftSidebar = useSelector((state) => state.page.openLeftSidebar);
  const { page_title, show_back, route_to } = useSelector(
    (state) => state.page.page_state
  );
  const currentTutorialModule = useSelector(
    (state) => state.page.currentTutorialModule
  );

  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const hasNewNotifications = useSelector(
    (state) => state.notification.hasNewNotifications
  );

  const handleOpenNotifications = () => {
    console.log("...marking notifications as read...");
    // Mark notifications as read when opening the sheet
    dispatch(markNotificationsAsRead());

    // Update read status in backend
    axios.post("/api/notifications/mark-read").catch(console.error);
  };

  const handleThemeChange = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const sign_out = useCallback(async () => {
    try {
      await fetcher("/api/auth/log-out", { method: "DELETE" });
      dispatch(setProfile(null));
      document.cookie =
        "sessionCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/");
    } catch (error) {
      return;
    }
  }, []);

  const handleChangeWorkspace = async (workspaceId) => {
    try {
      dispatch(
        createNotification({
          open: "true",
          type: "info",
          message: "Switching workspaces...",
        })
      );

      const response = await axios.patch("/api/user/current-workspace", {
        workspaceId: workspaceId,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: "true",
            type: "success",
            message: `Switched to ${response.data.data?.currentWorkspace?.username} successfully!`,
          })
        );

        // setIsOpenWorkspaces(false);

        if (
          router.pathname ===
          `/${response.data.data?.currentWorkspace?.username}`
        ) {
          router.replace(router.asPath, undefined, {
            shallow: true,
            scroll: false,
          });
        } else {
          router.push(`/${response.data.data?.currentWorkspace?.username}`);
        }

        // setIsOpenWorkspaces(false);
        await userMutate();
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: "Failed to switch workspaces.",
        })
      );

      // setIsOpenWorkspaces(false);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while changing workspace";

      console.error("Error changing workspace:", errorMessage);
    }
  };

  const paths = [
    { name: "Cards", module: "meetYourCards", href: "/kadi/learn" },
    { name: "Game Flow", module: "basicGameFlow", href: "/kadi/learn" },
    { name: "Powers", module: "cardPowers", href: "/kadi/learn" },
    { name: "Game", module: "firstGame", href: "#" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [paths]);

  return (
    <header
      className="flex items-center justify-between px-4 fixed w-full top-0 z-50
      border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ height: "50px" }}
    >
      {!isMobile && (
        <section className="flex items-center gap-1 md:gap-4">
          {show_back ? (
            <Link href={route_to} className="flex items-center gap-2 ">
              <ArrowLeft className="w-6 h-6 text-primary dark:text-white" />
            </Link>
          ) : (
            <button
              className="rounded-xl p-2 hover:bg-accent"
              onClick={openLeftSidebar ? handleSidebarClose : handleSidebarOpen}
              style={{
                boxShadow: "rgba(51, 51, 51, 0.03) 0px 5px 15px",
              }}
            >
              {openLeftSidebar ? (
                <MenuOpenOutlinedIcon className="text-2xl text-dark dark:text-light" />
              ) : (
                <MenuIcon className="text-2xl text-dark dark:text-light" />
              )}
            </button>
          )}

          <Link href={userProfile ? "/lobby" : "/"}>
            <Image
              src={mode === "light" ? "/kisiangani.png" : "/kisiangani.png"}
              alt="logo"
              width={40}
              height={40}
            />
          </Link>
        </section>
      )}

      {isMobile && (
        <>
          {show_back ? (
            <Link href={route_to} className="flex items-center gap-2 ">
              <ArrowLeft className="w-6 h-6 text-primary dark:text-white" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 ">
              <Image
                src={mode === "light" ? "kisiangani.png" : "kisiangani.png"}
                alt="logo"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
            </Link>
          )}

          {pathname.startsWith("/kadi/learn/mastering-the-basics") ? (
            <div className="flex-1 min-w-0 ml-2">
              <TutorialNavBreadCrumbs
                paths={paths}
                currentModule={currentTutorialModule}
              />
            </div>
          ) : (
            <span className="text-md font-bold text-primary dark:text-white truncate flex-1 min-w-0 max-w-[calc(100vw-160px)]">
              {page_title}
            </span>
          )}
        </>
      )}

      <section className="hidden md:flex items-center">
        <h4 className="text-primary dark:text-white text-sm md:text-md font-medium truncate max-w-[200px] sm:max-w-[300px]">
          {page_title}
        </h4>
        {pathname.startsWith("/kadi/learn/mastering-the-basics") && (
          <TutorialNavBreadCrumbs
            paths={paths}
            currentModule={currentTutorialModule}
          />
        )}
      </section>

      <section>
        {userProfile ? (
          <nav className="flex items-center space-x-2">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    onClick={() => handleOpenNotifications()}
                    className="relative mr-2"
                  >
                    <Bell
                      className={`h-5 w-5 ${
                        hasNewNotifications ? "text-primary" : ""
                      }`}
                    />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-2 -right-2 flex"
                        style={{ width: "20px", height: "20px" }}
                      >
                        {hasNewNotifications && (
                          <span
                            className="animate-ping absolute inline-flex 
                        h-full w-full rounded-full bg-tertiary opacity-75"
                          />
                        )}
                        <span
                          className="relative inline-flex rounded-full bg-tertiary 
                        items-center justify-center"
                          style={{ width: "20px", height: "20px" }}
                        >
                          <span className="text-[10px] font-semibold text-light">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        </span>
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                {/* <SheetContent className="bg-light dark:bg-dark"> */}
                {/* <SheetContent
                side="right"
                className="w-full sm:w-[400px] p-0 bg-light dark:bg-dark fixed inset-0 
                sm:inset-auto"
              > */}
                <SheetContent
                  side="right"
                  className="w-full sm:w-[400px] p-0 bg-light dark:bg-dark"
                >
                  <NotificationsMenu />
                </SheetContent>
              </Sheet>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isMobile ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          userProfile?.profilePicture || "/default_profile.png"
                        }
                        alt={userProfile?.name}
                      />
                      <AvatarFallback>
                        {userProfile?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                ) : (
                  <button className="flex items-center gap-2 text-gray-300 hover:text-white">
                    <div className="relative">
                      <img
                        src={
                          userProfile.profilePicture || "/default-avatar.png"
                        }
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-gray-600"
                      />
                      {userProfile.isOnline && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-800"></div>
                      )}
                    </div>

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
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isMobile && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              userProfile?.profilePicture ||
                              "/default_profile.png"
                            }
                            alt={userProfile?.name}
                          />
                          <AvatarFallback>
                            {userProfile?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">
                            {userProfile.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {userProfile.accountType}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">
                              {statsData?.ranking.title} •{" "}
                              {statsData?.ranking.rating} RP
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}

                {isMobile && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          WORKSPACES
                        </span>
                      </div>
                    </DropdownMenuLabel>

                    {userProfile.workspaces.map((workspace) => (
                      <DropdownMenuItem
                        key={workspace._id}
                        onClick={() => handleChangeWorkspace(workspace._id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center w-full">
                          <img
                            src={
                              workspace?.profilePicture ||
                              `https://api.dicebear.com/6.x/initials/svg?seed=${workspace?.name}`
                            }
                            alt={workspace?.name}
                            className="h-4 w-4 rounded-full mr-2"
                          />
                          <span className="truncate flex-1">
                            {workspace?.name}
                          </span>
                          {workspace?._id ===
                            userProfile?.currentWorkspace?._id && (
                            <Check className="ml-2 h-4 w-4 text-primary" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuItem
                      onClick={() => router.push("/workspace/create")}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Workspace</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Main Navigation */}
                {isMobile && (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/${userProfile.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/analytics">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/integrations">
                        <Plug2 className="mr-2 h-4 w-4" />
                        <span>Integrations</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Financial Section */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/wallet"
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </div>
                    <div className="ml-4">
                      {walletData && !walletError && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            KES {(walletData.balances.KES / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            USD {walletData.balances.USD.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {walletError && (
                        <p className="text-primaryRed text-sm font-medium">
                          No data
                        </p>
                      )}
                      {walletLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/transactions">
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                </DropdownMenuItem>

                {/* Preferences & Logout */}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Theme</span>
                  <Switch
                    checked={mode === "dark"}
                    onCheckedChange={handleThemeChange}
                    className="ml-auto"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={sign_out}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <div className="flex items-center gap-1 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10 -mr-2 md:mr-0"
                >
                  {mode === "light" ? (
                    <Sun className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Moon className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleThemeChange()}>
                  {mode === "light" ? "Dark" : "Light"} mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                Log In
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button
                variant="default"
                size="sm"
                className="text-xs md:text-sm whitespace-nowrap"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </section>
    </header>
  );
};

export default MainNavbar;
