"use client";
import React from 'react';
import Link from 'next/link';

// Sponsor Avatar Component
const SponsorAvatar = ({ avatar, index }) => {
  return (
    <Link href="/sponsors">
      <div 
        className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border border-white dark:border-gray-700"
        style={{ marginLeft: index > 0 ? '-4px' : '0' }}
      >
        <img 
          src={avatar} 
          alt="Sponsor" 
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
};

export default function FantasyLeaderboard() {
  // Sample data for the leaderboard
  const players = [
    { avatar: "https://randomuser.me/api/portraits/men/45.jpg", name: "John Wick", username: "@john_strong", points: 132 },
    { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "MVP", username: "@bestOfBest", points: 87 },
    { avatar: "https://randomuser.me/api/portraits/men/55.jpg", name: "Player1", username: "@PlayerOne", points: 65 },
    { avatar: "https://randomuser.me/api/portraits/women/67.jpg", name: "Jane", username: "@jane", points: 52 },
    { avatar: "https://randomuser.me/api/portraits/men/78.jpg", name: "Kinuthia", username: "@Kinuthia", points: 44 }
  ];

  // Sponsor data
  const sponsors = [
    { avatar: "https://randomuser.me/api/portraits/men/83.jpg", name: "Bry Tea" },
    { avatar: "https://randomuser.me/api/portraits/women/79.jpg", name: "Tyler King" },
    { avatar: "https://randomuser.me/api/portraits/men/51.jpg", name: "Amanda Zhao" },
    { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "Robert Lee" }
  ];

  return (
    <div className="mx-auto max-w-full flex flex-col items-center">
      <div className="w-[340px] bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
        {/* Header with title */}
        <h3 className="font-bold text-center mb-3 dark:text-gray-100">Your fantasy league leaderboard</h3>
        
        {/* Sponsors section */}
        <div className="flex items-center mb-4 px-1">
          <div className="flex items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">Sponsored by:</div>
            <div className="flex">
              {sponsors.map((sponsor, index) => (
                <SponsorAvatar 
                  key={index} 
                  avatar={sponsor.avatar} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Players list */}
        <div className="space-y-2">
          {players.map((player, index) => (
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
        
        {/* View more link */}
        <div className="mt-4 text-center">
          <Link 
            href="/fantasy-league" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            View more
          </Link>
        </div>
      </div>
    </div>
  );
}