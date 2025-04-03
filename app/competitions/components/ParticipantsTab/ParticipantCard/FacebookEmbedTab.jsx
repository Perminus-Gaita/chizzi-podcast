import React from 'react';

const FacebookEmbedTab = ({ participant }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-hidden w-full max-w-md">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {participant.participantId.substring(0, 1).toUpperCase()}
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">
              Participant {participant.participantId.substring(0, 8)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              2 hours ago
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm mb-3">
            Check out my entry for the Riccobeatz 808 Challenge! 🎵 #808Challenge #Music
          </p>
          <div className="aspect-video bg-black/10 dark:bg-white/5 flex items-center justify-center rounded">
            <div className="text-center p-4">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to play video
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              245 likes • 32 comments
            </div>
            <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-1 border border-indigo-600 dark:border-indigo-400 rounded-md">
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookEmbedTab;