import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios'; // Import axios

const TelegramConnect = ({ onTelegramConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10); // Countdown timer

  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
  const callbackRoute = `${typeof window !== 'undefined' ? window.location.origin : process.env.MYHOSTNAME}/api/auth/add-sign-in-method/telegram/callback`;
  const countdownDurationInSeconds = 10;

  useEffect(() => {
    // Dynamically load the Telegram widget script
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setError(null); // Clear error after countdown
            setCountdown(countdownDurationInSeconds); // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error]);

  const handleTelegramLogin = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    if (typeof window === 'undefined' || !window.Telegram?.Login?.auth) {
      console.error('Telegram Login is not initialized');
      setError('Telegram Login is not initialized. Please try again.');
      setIsLoading(false);
      return;
    }

    if (!botId) {
      console.error('Bot ID is not configured');
      setError('Bot ID is not configured. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      window.Telegram.Login.auth(
        {
          bot_id: String(botId),
          request_access: true,
          lang: 'en'
        },
        async (data) => {
          if (!data) {
            console.error('Authorization failed');
            setError('Authorization failed. Please try again.');
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

            // Check if the response contains Telegram data
            if (response.data.telegram) {
              // Call the parent callback to update the UI
              onTelegramConnect(response.data.telegram);
            } else {
              console.error('No Telegram data provided in the response');
              setError('No Telegram data provided. Please try again.');
            }
          } catch (error) {
            console.error('Error sending data to server:', error);
            setError(error.response?.data?.error || 'Failed to connect Telegram. Please try again.');
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Telegram auth error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {error ? (
        <div className="flex items-center justify-center gap-2 p-2 bg-red-100 text-red-800 rounded-lg">
          <div className="relative w-6 h-6">
            {/* Circular countdown indicator */}
            <svg
              className="w-full h-full"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="#F87171"
                strokeWidth="2"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100 - (countdown / 10) * 100}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
              {countdown}
            </span>
          </div>
          <span>{error}</span>
        </div>
      ) : (
        <Button 
          className="bg-[#0088cc] text-white hover:bg-[#0088cc]/90 float-right"
          onClick={handleTelegramLogin}
          disabled={isLoading}
        >
          <div className="flex items-center">
            <svg
              style={{ width: '20px', height: '20px' }}
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z"/>
            </svg>
            <span className="ml-2">
              {isLoading ? 'Connecting Telegram Account...' : 'Connect Telegram Account'}
            </span>
          </div>
        </Button>
      )}
    </div>
  );
};

export default TelegramConnect;