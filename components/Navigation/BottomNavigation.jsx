import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import { Trophy, Users, Home, Swords, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { createNotification } from "@/app/store/notificationSlice";

const BottomNavigation = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const userProfile = useSelector((state) => state.auth.profile);
  const urgentMatches = useSelector(
    (state) => state.notification?.urgentMatches || 0
  );

  const [activeTab, setActiveTab] = useState(pathname);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16
     bg-light dark:bg-dark border-t flex items-center justify-around 
     pb-safe-area-inset-bottom md:hidden z-10"
    >
      <Link
        href="/arena"
        className={`flex flex-col items-center justify-center w-1/5 ${
          activeTab === "/arena" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] mt-1">Arena</span>
      </Link>

      <button
        onClick={() => {
          if (!userProfile) {
            dispatch(
              createNotification({
                open: true,
                type: "info",
                message: "Please sign in to see your matches",
              })
            );

            return;
          }
        }}
        className={`flex flex-col items-center justify-center w-1/5 ${
          activeTab === "/matches" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Link
          href="/matches"
          className="flex flex-col items-center justify-center"
        >
          <div className="relative">
            <Swords className="h-5 w-5" />
            {urgentMatches > 0 && (
              <Badge className="absolute -top-2 -right-3 h-4 min-w-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                {urgentMatches > 99 ? "99+" : urgentMatches}
              </Badge>
            )}
          </div>
          <span className="text-[10px] mt-1">Matches</span>
        </Link>
      </button>

      {/* <button
        onClick={() => handleNavigation("/arena?tab=tournaments")}
        className={`flex flex-col items-center justify-center w-1/5 ${
          activeTab === "/arena" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Trophy className="h-5 w-5" />
        <span className="text-[10px] mt-1">Tournaments</span>
      </button> */}

      {/* <button
        onClick={() => handleNavigation("/teams")}
        className={`flex flex-col items-center justify-center w-1/5 ${
          activeTab === "/teams" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Users className="h-5 w-5" />
        <span className="text-[10px] mt-1">Teams</span>
      </button> */}

      <button
        onClick={() => {
          if (!userProfile) {
            dispatch(
              createNotification({
                open: true,
                type: "info",
                message: "Please sign in to view your profile",
              })
            );

            return;
          }
        }}
        className={`flex flex-col items-center justify-center w-1/5 ${
          pathname === `/${userProfile?.username}`
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      >
        <Link
          href={`/${userProfile?.username}`}
          className="flex flex-col items-center justify-center"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-1">Profile</span>
        </Link>
      </button>
    </div>
  );
};

export default BottomNavigation;
