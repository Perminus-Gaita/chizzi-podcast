"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import TwentyFortyEight from "./4028/client";

export default function Index() {
  const [isWobbling, setIsWobbling] = useState(false);

  const wobbleAnimation = {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6 },
  };

  const handleWobble = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 600);
  };

  return (
    <>
      {/* Header section with image behind text */}
      <div className="container max-w-3xl mx-auto p-4 relative">
        <div className="relative flex items-center justify-center min-h-[150px]">
          {/* Background image that wobbles on click */}
          <motion.div
            className="absolute z-0"
            animate={isWobbling ? wobbleAnimation : {}}
            onClick={handleWobble}
          >
            <img
              src="/kisiangani.png"
              alt="Kisiangani Hat"
              className="w-48 opacity-70 cursor-pointer"
            />
          </motion.div>
          
          {/* Text overlay */}
          <div className="text-center relative z-10">
            <h1 className="text-5xl font-bold mb-2 text-gray-800 dark:text-white drop-shadow-md">The Kisiangani Podcast</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 drop-shadow-sm">Checki, you guy my guy.</p>
          </div>
        </div>
      </div>

      {/* Updated subscriber section to match Swift Podcast style */}
      <div className="subscribers">
        <p className="sub-count">Current YouTube subscribers: <strong>4,867</strong></p>
        <div className="sub-target">
          <span>0</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: '90%' }}></div>
          </div>
          <span>5,000</span>
        </div>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>Help us reach our YouTube goal!</p>
      </div>

      {/* Nganuthia Game UI */}
      <TwentyFortyEight />

      {/* Centered leaderboard with no scroll functionality */}
      <div className="my-12 relative">
        {/* CSS to hide scrollbar */}
        <style jsx global>{`
          .subscribers {
            margin: 40px 0;
            text-align: center;
          }
          .sub-count {
            font-size: 24px;
            margin-bottom: 15px;
          }
          .sub-target {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            max-width: 500px;
          }
          .progress-bar {
            flex-grow: 1;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 0 15px;
          }
          .progress {
            height: 100%;
            background-color: #333;
            border-radius: 5px;
          }
        `}</style>

        <div className="mx-auto max-w-full px-4 flex justify-center">
          {/* Centered Nganuthia Leaderboard Card */}
          <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <h3 className="font-bold text-center mb-3 dark:text-gray-100">Find Kisiangani Leaderboard</h3>
            <div className="space-y-2">
              {[
                { avatar: "https://randomuser.me/api/portraits/men/45.jpg", name: "Bry Tea", username: "@Bry_T", points: 132 },
                { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "DjMozz", username: "@DjMozz", points: 87 },
                { avatar: "https://randomuser.me/api/portraits/men/55.jpg", name: "Stan MMMMM", username: "@Stan.M5", points: 65 },
                { avatar: "https://randomuser.me/api/portraits/women/67.jpg", name: "Jim Eriko", username: "@jimneriko", points: 52 },
                { avatar: "https://randomuser.me/api/portraits/men/78.jpg", name: "Enock Mokua", username: "@enockmokua", points: 44 }
              ].map((player, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm dark:text-gray-300">{index + 1}.</span>
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium dark:text-gray-200">{player.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{player.username}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold dark:text-gray-300">{player.points}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}