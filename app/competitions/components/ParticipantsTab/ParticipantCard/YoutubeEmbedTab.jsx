import React from 'react';

const YoutubeEmbedTab = ({ participant }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-hidden w-full max-w-lg">
        <div className="aspect-video bg-black/10 dark:bg-white/5 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-10 h-6 mx-auto mb-2 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {participant.participantId.substring(0, 10)} Channel
            </p>
          </div>
        </div>
        <div className="p-3">
          <h4 className="text-sm font-medium mb-1">808 Challenge Submission</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            This is my submission for the Riccobeatz 808 Challenge.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              1,350 views
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

export default YoutubeEmbedTab;