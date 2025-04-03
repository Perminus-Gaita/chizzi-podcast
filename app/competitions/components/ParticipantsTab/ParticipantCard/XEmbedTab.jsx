import React from 'react';

const XEmbedTab = ({ participant }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-hidden w-full max-w-md">
        <div className="p-3 flex items-start">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            {participant.participantId.substring(0, 1).toUpperCase()}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <div className="font-medium">
                Participant {participant.participantId.substring(0, 8)}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                @user{participant.participantId.substring(0, 6)}
              </div>
            </div>
            <p className="text-sm my-2">
              Just submitted my track for the #808Challenge! This was such a fun beat to work with. Check out my submission and vote if you like it! 🎧 #Music #Producer
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              10:30 AM • Mar 15, 2023
            </div>
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                42
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                128
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                356
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-end">
            <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-1 border border-indigo-600 dark:border-indigo-400 rounded-md">
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XEmbedTab;