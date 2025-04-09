"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [{ href: "/arena", icon: Home, label: "Arena" }];

const NavItem = ({ item, isActive, openLeftSidebar, onSidebarClose }) => {
  const Icon = item.icon;
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    if ((isMobile || isTablet) && onSidebarClose) {
      onSidebarClose();
    }
  };

  const content = (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        openLeftSidebar ? "justify-start" : "justify-center"
      )}
    >
      <Icon className="h-5 w-5" />
      {openLeftSidebar && <span className="ml-3">{item.label}</span>}
    </Link>
  );

  if (!openLeftSidebar) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {isMounted &&
            createPortal(
              <TooltipContent
                side="right"
                className="z-[99999]"
                sideOffset={10}
              >
                {item.label}
              </TooltipContent>,
              document.body
            )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const CommunityLeftSidebar = ({ onSidebarClose, showOnlyArena = false }) => {
  const pathname = usePathname();
  const openLeftSidebar = useSelector((state) => state.page.openLeftSidebar);

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
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {openLeftSidebar && (
                <div className="px-3 py-2">
                  <h4 className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                    Community
                  </h4>
                  <div className="h-px bg-border" />
                </div>
              )}

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
      </div>
    </aside>
  );
};

export default CommunityLeftSidebar;
