"use client";
import React, { useEffect, useState } from 'react';
import CompetitionCard from './components/CompetitionCard';
import { useRouter } from 'next/navigation';

const CompetitionsPage = () => {
  const router = useRouter();
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {///
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions');
        if (response.ok) {
          const data = await response.json();
          setCompetitions(data.competitions);
        } else {
          console.error('Failed to fetch competitions');
        }
      } catch (error) {
        console.error('Error fetching competitions:', error);
      }
    };

    fetchCompetitions();
  }, []);

  const handleCardClick = (creatorUsername) => {
    router.push(`/competitions/${creatorUsername}`);
  };

  return (
    <div className="max-w-[400px] w-full p-[10px]">
      {competitions.map((competition) => (
        <div
          key={competition._id}
          onClick={() => handleCardClick(competition.creator.username)}
          style={{ cursor: 'pointer' }}
        >
          <CompetitionCard
            participantCount={competition.numberOfParticipants}
            sponsorsCount={competition.numberOfSponsors +1}
            votesCount={competition.numberOfVotes}
          />
        </div>
      ))}
    </div>
  );
};

export default CompetitionsPage;