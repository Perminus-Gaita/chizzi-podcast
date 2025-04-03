import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios'; // Import axios
import { useRouter } from 'next/navigation';

const TelegramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter.

  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
  const callbackRoute = `${typeof window !== 'undefined' ? window.location.origin : process.env.MYHOSTNAME}/api/auth/telegram/sign-in/callback`;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleTelegramLogin = async () => {
    setIsLoading(true);

    if (!window.Telegram?.Login?.auth) {
      console.error('Telegram Login is not initialized');
      setIsLoading(false);
      return;
    }

    if (!botId) {
      console.error('Bot ID is not configured');
      setIsLoading(false);
      return;
    }

    try {
      window.Telegram.Login.auth(
        {
          bot_id: String(botId),
          // request_access: true, // Request full access permissions
          request_access: "write,read", // Request full access permissions
          lang: 'en'
        },
        async (data) => {
          if (!data) {
            console.error('Authorization failed');
            setIsLoading(false);
            return;
          }

          console.log('Telegram auth successful:', data);

          try {
            // Send data to the backend API
            const response = await axios.post(callbackRoute, data, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            // Check if the response contains a redirect URL
            if (response.data.redirectUrl) {
              // Redirect to the provided URL
              router.push(response.data.redirectUrl);
            } else {
              console.error('No redirect URL provided in the response');
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Error sending data to server:', error);
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Telegram auth error:', error);
      setIsLoading(false);
    }
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
              style={{ width: '32px', height: '32px' }} // Custom size
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