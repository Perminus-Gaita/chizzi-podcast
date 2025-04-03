import React, { useState } from 'react';

const SponsorsTab = ({ hardcodedSponsors, competitionSponsors }) => {
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  // Sponsorship Modal
  const SponsorshipModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sponsorships Opening Soon</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check back soon.
          </p>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            onClick={() => setShowSponsorModal(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Sponsor Tournament Button */}
      <div className="flex justify-center mb-6">
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-6 rounded-md transition-colors"
          onClick={() => setShowSponsorModal(true)}
        >
          Sponsor Tournament
        </button>
      </div>
      
      <div className="space-y-4">
        {hardcodedSponsors.map((sponsor, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full ${sponsor.bgColor} flex items-center justify-center text-white font-medium flex-shrink-0`}>
                {sponsor.initial}
              </div>
              <div className="min-w-0 ml-3 overflow-hidden">
                <div className="font-medium truncate">{sponsor.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{sponsor.username}
                </div>
              </div>
            </div>
            <div className="md:text-right flex-shrink-0">
              <a 
                href={sponsor.prizeLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {sponsor.prize}
              </a>
            </div>
          </div>
        ))}
        {competitionSponsors &&
          competitionSponsors.map((sponsor, index) => (
            <div 
              key={index} 
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {sponsor.sponsorId.substring(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 ml-3 overflow-hidden">
                  <div className="font-medium truncate">
                    Sponsor {sponsor.sponsorId.substring(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    ID: {sponsor.sponsorId.substring(0, 12)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Show the sponsorship modal when needed */}
      {showSponsorModal && <SponsorshipModal />}
    </div>
  );
};

export default SponsorsTab;