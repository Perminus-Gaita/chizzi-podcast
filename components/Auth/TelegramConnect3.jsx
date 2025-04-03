import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const TelegramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const widgetRef = useRef(null);
  const callbackUrl = `${typeof window !== 'undefined' ? window.location.origin : process.env.MYHOSTNAME}/api/auth/telegram/sign-in/callback`;

  // Create hidden widget with correct permissions on load
  useEffect(() => {
    if (!botUsername) return;
    
    // Create hidden container for widget
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'absolute';
    hiddenContainer.style.top = '-9999px';
    hiddenContainer.style.left = '-9999px';
    document.body.appendChild(hiddenContainer);
    widgetRef.current = hiddenContainer;
    
    // Create and add the widget script
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-auth-url", callbackUrl);
    script.async = true;
    
    hiddenContainer.appendChild(script);
    
    return () => {
      if (document.body.contains(hiddenContainer)) {
        document.body.removeChild(hiddenContainer);
      }
    };
  }, [botUsername, callbackUrl]);

  const handleTelegramLogin = () => {
    setIsLoading(true);
    
    // Find and click the hidden Telegram login button
    if (widgetRef.current) {
      const telegramButton = widgetRef.current.querySelector('iframe');
      
      if (telegramButton) {
        telegramButton.click();
      } else {
        console.error('Telegram login button not found');
        setIsLoading(false);
      }
    } else {
      console.error('Telegram widget container not found');
      setIsLoading(false);
    }
    
    // Reset loading state after a timeout, in case the popup is closed without logging in
    setTimeout(() => {
      setIsLoading(false);
    }, 20000); // 20 second timeout
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleTelegramLogin}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold rounded-lg transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Telegram...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg
              style={{ width: '32px', height: '32px' }}
              className="mr-2 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z"/>
            </svg>
            <span>Continue with Telegram</span>
          </div>
        )}
      </Button>
    </div>
  );
};

export default TelegramConnect;