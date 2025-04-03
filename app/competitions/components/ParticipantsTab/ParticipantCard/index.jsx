import React, { useState, useEffect } from 'react';
import TiktokEmbedTab from './TiktokEmbedTab';
import InstagramEmbedTab from './InstagramEmbedTab';
import YoutubeEmbedTab from './YoutubeEmbedTab';
import FacebookEmbedTab from './FacebookEmbedTab';
import XEmbedTab from './XEmbedTab';

const ParticipantCard = ({
  participant,
  index,
  isSelected,
  onSelect,
  onVote,
  visiblePlatforms = {
    tiktok: true,
    instagram: true,
    youtube: false,
    facebook: false,
    x: false
  }
}) => {
  // Find the first available platform for default tab
  const getFirstAvailablePlatform = () => {
    const platforms = ['tiktok', 'instagram', 'youtube', 'facebook', 'x'];
    return platforms.find(platform => visiblePlatforms[platform]) || 'tiktok';
  };

  const [activeSocialTab, setActiveSocialTab] = useState(getFirstAvailablePlatform());
  const [showVotingModal, setShowVotingModal] = useState(false);

  // Update active tab when visible platforms change or when participant changes
  useEffect(() => {
    if (!visiblePlatforms[activeSocialTab]) {
      setActiveSocialTab(getFirstAvailablePlatform());
    }
  }, [visiblePlatforms, participant]);

  // Render the social tabs content for the selected participant
  const renderSocialTabs = () => (
    <div>
      {/* Social Tabs Header */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 relative overflow-x-auto scrollbar-hide">
        {visiblePlatforms.tiktok && (
          <button
            className={`py-3 px-4 text-center text-sm font-medium transition-colors whitespace-nowrap ${
              activeSocialTab === 'tiktok'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSocialTab('tiktok')}
          >
            TikTok
          </button>
        )}

        {visiblePlatforms.instagram && (
          <button
            className={`py-3 px-4 text-center text-sm font-medium transition-colors whitespace-nowrap ${
              activeSocialTab === 'instagram'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSocialTab('instagram')}
          >
            Instagram
          </button>
        )}

        {visiblePlatforms.youtube && (
          <button
            className={`py-3 px-4 text-center text-sm font-medium transition-colors whitespace-nowrap ${
              activeSocialTab === 'youtube'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSocialTab('youtube')}
          >
            YouTube
          </button>
        )}

        {visiblePlatforms.facebook && (
          <button
            className={`py-3 px-4 text-center text-sm font-medium transition-colors whitespace-nowrap ${
              activeSocialTab === 'facebook'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSocialTab('facebook')}
          >
            Facebook
          </button>
        )}

        {visiblePlatforms.x && (
          <button
            className={`py-3 px-4 text-center text-sm font-medium transition-colors whitespace-nowrap ${
              activeSocialTab === 'x'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSocialTab('x')}
          >
            X
          </button>
        )}
      </div>

      {/* Social Tabs Content */}
      <div className="p-4">
        {activeSocialTab === 'tiktok' && visiblePlatforms.tiktok && <TiktokEmbedTab participant={participant} />}
        {activeSocialTab === 'instagram' && visiblePlatforms.instagram && <InstagramEmbedTab participant={participant} />}
        {activeSocialTab === 'youtube' && visiblePlatforms.youtube && <YoutubeEmbedTab participant={participant} />}
        {activeSocialTab === 'facebook' && visiblePlatforms.facebook && <FacebookEmbedTab participant={participant} />}
        {activeSocialTab === 'x' && visiblePlatforms.x && <XEmbedTab participant={participant} />}
      </div>
    </div>
  );

  // Voting Modal
  const VotingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Voting Not Yet Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Voting will start on March 28, 2025. Come back then to support your favorite participant!
          </p>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            onClick={() => setShowVotingModal(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div
        className={`w-full relative p-3 ${
          isSelected ? 'bg-gray-50 dark:bg-gray-800/30' : ''
        }`}
        onClick={() => onSelect(participant._id || participant.participantId)}
      >
        <div className="flex flex-wrap items-start mb-1">
          <div className="absolute top-2 left-0 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            #{index + 1}
          </div>
        </div>

        <div className="flex items-center ml-1">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {participant.name.substring(0, 1).toUpperCase()}
          </div>

          {/* Name and Username */}
          <div className="min-w-0 ml-3 flex-1 mr-4 overflow-hidden">
            <div className="font-medium truncate">
              {participant.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
              @{participant.username}
              
              {/* "You" tag - Moved here to be on the right of username */}
              {participant.isSessionUser && (
                <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
          </div>

          {/* Votes and Vote Button */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="text-sm font-medium">
              {participant.votes ? participant.votes.length : 0}
            </span>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the card's onClick from firing
                setShowVotingModal(true);
                // onVote(participant.participantId); - This is commented out as voting is not available yet
              }}
            >
              Vote
            </button>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="bg-white dark:bg-gray-900 shadow-inner border-t border-gray-100 dark:border-gray-800">
          {renderSocialTabs()}
        </div>
      )}

      {/* Show the voting modal when needed */}
      {showVotingModal && <VotingModal />}
    </div>
  );
};

export default ParticipantCard;