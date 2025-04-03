// VotesTab.jsx
import React from 'react';

const VotesTab = ({ totalVotes, startDate }) => {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
          {totalVotes}
        </div>
        <div className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          Total Votes
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Voting starts on {new Date(startDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default VotesTab;
