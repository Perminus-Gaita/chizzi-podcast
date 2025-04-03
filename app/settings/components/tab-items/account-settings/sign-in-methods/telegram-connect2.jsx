import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

const TelegramConnect = ({ onTelegramConnect }) => {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const callbackRoute = `${typeof window !== "undefined" ? window.location.origin : process.env.MYHOSTNAME}/api/auth/add-sign-in-method/telegram/callback`;

  useEffect(() => {
    if (typeof window !== "undefined" && botUsername) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.dataset.telegramLogin = botUsername;
      script.dataset.size = "large";
      script.dataset.authUrl = callbackRoute;
      script.dataset.requestAccess = "write";
      document.getElementById("telegram-login")?.appendChild(script);
    }
  }, [botUsername, callbackRoute]);

  return (
    <div className="flex flex-col items-center">
      <div id="telegram-login" className="mb-4"></div>
      <Button
        className="bg-[#0088cc] text-white hover:bg-[#0088cc]/90"
        onClick={() => window.location.reload()} // Reload to show widget if needed
      >
        Reload Telegram Login
      </Button>
    </div>
  );
};

export default TelegramConnect;
