import React, { useState, useRef } from 'react';
import ParticipantCard from './ParticipantCard';
import JoinCompetitionModal from './JoinCompetitionModal';

const ParticipantsTab = ({ participants, competitionId, competition }) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showBeatDropdown, setShowBeatDropdown] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const participantDropdownRef = useRef(null);
  
  // Check if the current user is already a participant
  const isSessionUserAParticipant = competition?.isSessionUserAParticipant || false;

  const handleSelect = (participantId) => {
    setSelectedParticipant(prev =>
      prev === participantId ? null : participantId
    );
    setShowBeatDropdown(false);
  };

  const handleVote = (participantId) => {
    // Implement vote logic here. For now, we simply log the vote.
    console.log('Vote clicked for:', participantId);
  };

  const toggleBeatDropdown = (e) => {
    e.preventDefault();
    setShowBeatDropdown(prev => !prev);
  };

  const openJoinModal = () => {
    if (!isSessionUserAParticipant) {
      setShowJoinModal(true);
    }
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
  };

  return (
    <div className="p-1">
      {/* Join Competition Button with Beat Dropdown */}
      <div className="flex justify-center my-4 relative">
        <div className="flex">
          <button 
            className={`text-white text-sm font-medium py-2 px-6 rounded-l-md transition-colors ${
              isSessionUserAParticipant 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            onClick={openJoinModal}
            disabled={isSessionUserAParticipant}
            title={isSessionUserAParticipant ? "You are already a participant" : "Join this competition"}
          >
            {isSessionUserAParticipant ? "Already Joined" : "Join Competition"}
          </button>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-2 rounded-r-md transition-colors border-l border-indigo-700 flex items-center"
            onClick={toggleBeatDropdown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {showBeatDropdown && (
          <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 w-64">
            <div className="py-2 px-4">
              <a 
                href="https://www.beatstars.com/beat/love-me-afro-beat-1477057" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Riccobeatz 808 challenge 1 beat
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Join Competition Modal */}
      <JoinCompetitionModal 
        isOpen={showJoinModal}
        onClose={closeJoinModal}
        competitionId={competitionId}
      />

      {/* Render each ParticipantCard */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {participants.map((participant, index) => (
          <ParticipantCard
            key={participant._id}
            participant={participant}
            index={index}
            isSelected={selectedParticipant === participant._id}
            onSelect={() => handleSelect(participant._id)}
            onVote={() => handleVote(participant._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsTab;