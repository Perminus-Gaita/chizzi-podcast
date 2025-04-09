"use client";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";
import { useUserHandler } from "@/lib/user";
import { createNotification } from "@/app/store/notificationSlice";
import { setProfile } from "@/app/store/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  BarChart2,
  UserCircle,
  Settings,
  Menu,
  Plus,
  Check,
  Home,
  Swords,
  Bell,
  Plug2,
} from "lucide-react";

// Modified NavItem component to include admin tag
const NavItem = ({ item, isActive, openLeftSidebar, onSidebarClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
  const Icon = item.icon;

  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const hasNewNotifications = useSelector(
    (state) => state.notification.hasNewNotifications
  );

  const urgentMatches = useSelector(
    (state) => state.notification?.urgentMatches || 0
  );

  const handleClick = () => {
    if ((isMobile || isTablet) && onSidebarClose) {
      onSidebarClose();
    }
  };

  const getBadgeInfo = () => {
    if (item.href === "/notifications" && unreadCount > 0) {
      return unreadCount;
    }
    if (item.href === "/matches" && urgentMatches > 0) {
      return urgentMatches;
    }
    return 0;
  };

  const badgeCount = getBadgeInfo();

  const content = (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        "relative flex items-center px-3 h-[50px] text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        openLeftSidebar ? "justify-start" : "justify-center"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          hasNewNotifications && item.badge && "text-primary"
        )}
      />{" "}
      {openLeftSidebar && (
        <div className="ml-3 flex items-center">
          <span>{item.label}</span>
          {item.isAdmin && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
              Admin
            </span>
          )}
        </div>
      )}
      {badgeCount > 0 && (
        <span
          className="absolute top-1 right-2 flex"
          style={{ width: "20px", height: "20px" }}
        >
          {(item.href === "/notifications" && hasNewNotifications) ||
            (item.href === "/matches" && urgentMatches > 0 && (
              <span
                className="animate-ping absolute inline-flex h-full w-full 
              rounded-full bg-primary opacity-75"
              />
            ))}
          <span className="relative inline-flex rounded-full bg-tertiary items-center justify-center h-full w-full">
            <span className="text-[10px] font-semibold text-light">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          </span>
        </span>
      )}
    </Link>
  );

  if (!openLeftSidebar) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {createPortal(
            <TooltipContent side="right" className="z-[99999]" sideOffset={10}>
              <div className="flex items-center">
                {item.label}
                {item.isAdmin && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                    Admin
                  </span>
                )}
              </div>
            </TooltipContent>,
            document.body
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const WorkspaceSelector = ({
  openLeftSidebar,
  userProfile,
  isOpenWorkspaces,
  setIsOpenWorkspaces,
  workspacesRef,
  buttonRef,
  dropdownRef,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useUserHandler();

  const setUserProfile = () => {
    dispatch(
      setProfile({
        uuid: userData?._id,
        workspaceId: userData?.currentWorkspaceId,
        username: userData?.username,
        name: userData?.name,
        type: userData?.type,
        profilePicture: userData?.profilePicture,
        onboardingStatus: userData?.onboardingStatus,
        discovery: userData?.discovery,
        currentWorkspace: userData?.currentWorkspace,
        workspaces: userData?.workspaces,
        telegramUserId: userData?.telegram?.userId,
      })
    );
  };

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

        setIsOpenWorkspaces(false);

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

        setIsOpenWorkspaces(false);
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

      setIsOpenWorkspaces(false);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while changing workspace";

      console.error("Error changing workspace:", errorMessage);
    }
  };

  const handleCreateWorkspace = () => {
    setIsOpenWorkspaces(false);
    router.push("/workspace/create");
  };

  useEffect(() => {
    if (userData) {
      setUserProfile();
    }
  }, [userData]);

  return (
    <div ref={workspacesRef} className={`relative ${openLeftSidebar && ""}`}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-left font-normal h-[50px] rounded-none",
          !openLeftSidebar && "justify-center"
        )}
        onClick={() => setIsOpenWorkspaces(!isOpenWorkspaces)}
      >
        <img
          src={
            userProfile?.currentWorkspace?.profilePicture ||
            `https://api.dicebear.com/6.x/initials/svg?seed=${userProfile?.currentWorkspace?.name}`
          }
          alt={userProfile?.currentWorkspace?.name}
          className="h-6 w-6 rounded-full"
        />
        {openLeftSidebar && (
          <span className="ml-2 capitalize">
            {userProfile?.currentWorkspace.name.length > 15
              ? `${userProfile?.currentWorkspace.name.slice(0, 15)}...`
              : userProfile?.currentWorkspace.name}
          </span>
        )}
      </Button>
      {isOpenWorkspaces &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: "100px",
              left: "50px",
              maxWidth: "256px",
              zIndex: 9999,
            }}
            className="bg-popover rounded-md p-2 shadow-md"
          >
            {userProfile?.workspaces.map((workspace, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleChangeWorkspace(workspace?._id);
                }}
              >
                <img
                  src={
                    workspace?.profilePicture ||
                    `https://api.dicebear.com/6.x/initials/svg?seed=${workspace?.name}`
                  }
                  alt={workspace?.name}
                  className="h-6 w-6 rounded-full mr-2"
                />
                <span className="truncate">{workspace?.name}</span>
                {workspace?._id === userProfile?.currentWorkspace?._id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
            <Button
              ref={buttonRef}
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCreateWorkspace}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Workspace</span>
            </Button>
          </div>,
          document.body
        )}
    </div>
  );
}

// In the LeftSideBar component, modify the navItems array
const LeftSideBar = ({ onSidebarClose, handleOpenWorkspace }) => {
  const pathname = usePathname();
  const workspacesRef = useRef();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const openLeftSidebar = useSelector((state) => state.page.openLeftSidebar);
  const userProfile = useSelector((state) => state.auth.profile);

  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const hasNewNotifications = useSelector(
    (state) => state.notification.hasNewNotifications
  );
  const urgentMatches = useSelector(
    (state) => state.notification?.urgentMatches || 0
  );

  const [isOpenWorkspaces, setIsOpenWorkspaces] = useState(false);

  // Reordered navItems to match the required order with admin tags
  const navItems = [
    { href: "/arena", icon: Home, label: "Arena" },
    {
      href: "/matches",
      icon: Swords,
      label: "Matches",
      badge: urgentMatches > 0,
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadCount > 0,
    },
    {
      href: `/${userProfile?.currentWorkspace?.username}`,
      icon: UserCircle,
      label: "Profile",
    },
    { href: "/analytics", icon: BarChart2, label: "Analytics", isAdmin: true },
    {
      href: `/integrations`,
      icon: Plug2,
      label: "Integrations",
      isAdmin: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideButton =
        workspacesRef.current && workspacesRef.current.contains(event.target);
      const isInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);
      const isCreateButton =
        buttonRef.current && buttonRef.current.contains(event.target);

      if (!isInsideButton && !isInsideDropdown && !isCreateButton) {
        setIsOpenWorkspaces(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      style={{
        height: "90vh",
      }}
    >
      <div
        className={cn(
          "scroll_style overflow-y-auto flex h-full w-full flex-col justify-between bg-background"
        )}
      >
        <div className="flex flex-col space-y-4 py-4">
          <WorkspaceSelector
            openLeftSidebar={openLeftSidebar}
            userProfile={userProfile}
            isOpenWorkspaces={isOpenWorkspaces}
            setIsOpenWorkspaces={setIsOpenWorkspaces}
            handleOpenWorkspace={handleOpenWorkspace}
            workspacesRef={workspacesRef}
            buttonRef={buttonRef}
            dropdownRef={dropdownRef}
          />

          <ScrollArea className="flex-1">
            <div>
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  isActive={pathname === item.href}
                  openLeftSidebar={openLeftSidebar}
                  onSidebarClose={onSidebarClose}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <NavItem
            item={{ href: "/settings", icon: Settings, label: "Settings" }}
            isActive={pathname === "/settings"}
            openLeftSidebar={openLeftSidebar}
            onSidebarClose={onSidebarClose}
          />
        </div>
      </div>
    </aside>
  );
};

export default LeftSideBar;
