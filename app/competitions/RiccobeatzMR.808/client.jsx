"use client";
import React, { useState, useEffect } from 'react';
import CompetitionCard from '../components/CompetitionCard';
import ParticipantsTab from '../components/ParticipantsTab';
import SponsorsTab from '../components/SponsorsTab';
import VotesTab from '../components/VotesTab';

const CompetitionPage = () => {
  const [activeTab, setActiveTab] = useState('participants');
  const [competition, setCompetition] = useState(null);
  const competitionId = '67dc26b7f72f82ef9e505dc6';

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await fetch(`/api/competitions/${competitionId}`);
        if (response.ok) {
          const data = await response.json();
          setCompetition(data.competition);
        } else {
          console.error('Failed to fetch competition');
        }
      } catch (error) {
        console.error('Error fetching competition:', error);
      }
    };

    // // Mock data for testing
    // const mockCompetition = {
    //   _id: competitionId,
    //   title: "Riccobeatz 808 Challenge",
    //   numberOfParticipants: 3,
    //   numberOfSponsors: 1,
    //   numberOfVotes: 0,
    //   startDate: "2023-10-01",
    //   endDate: "2023-10-31",
    //   participants: [
    //     {
    //       participantId: "p1",
    //       name: "DJ BeatzMaster",
    //       username: "beatzmaster",
    //       votes: ["v1", "v2", "v3"],
    //       submissions: {
    //         tiktok: "https://www.tiktok.com/@riccobeatzmr.808/video/7338721333783678238",
    //         instagram: "https://www.instagram.com/p/DHa3miZt2pu",
    //         youtube: "https://www.youtube.com/watch?v=zaNlFjd6Ebo",
    //         facebook: "https://www.facebook.com/riccobeatz/videos/2897355590423794/?mibextid=rS40aB7S9Ucbxw6v",
    //         x: "https://x.com/Riccobeatz/status/1889692850226335823/video/1"
    //       }
    //     },
    //     {
    //       participantId: "p2",
    //       name: "808 Queen",
    //       username: "queen808",
    //       votes: ["v4", "v5"],
    //       submissions: {
    //         tiktok: "https://www.tiktok.com/@riccobeatzmr.808/video/7338721333783678238",
    //         instagram: "https://www.instagram.com/p/DHa3miZt2pu/",
    //         youtube: "https://www.youtube.com/watch?v=zaNlFjd6Ebo",
    //         facebook: "https://www.facebook.com/riccobeatz/videos/2897355590423794/?mibextid=rS40aB7S9Ucbxw6v",
    //         x: "https://x.com/Riccobeatz/status/1889692850226335823/video/1"
    //       }
    //     },
    //     {
    //       participantId: "p3",
    //       name: "Bass Lord",
    //       username: "basslord",
    //       votes: ["v6"],
    //       submissions: {
    //         tiktok: "https://www.tiktok.com/@riccobeatzmr.808/video/7338721333783678238",
    //         instagram: "https://www.instagram.com/p/DHa3miZt2pu/",
    //         youtube: "https://www.youtube.com/watch?v=zaNlFjd6Ebo",
    //         facebook: "https://www.facebook.com/riccobeatz/videos/2897355590423794/?mibextid=rS40aB7S9Ucbxw6v",
    //         x: "https://x.com/Riccobeatz/status/1889692850226335823/video/1"
    //       }
    //     }
    //   ],
    //   sponsors: [
    //     {
    //       sponsorId: "s1",
    //       name: "Riccobeatz",
    //       username: "riccobeatz808",
    //       prize: "Premium Riccobeatz Beat",
    //       prizeLink: "https://riccobeatz.com"
    //     }
    //   ]
    // };

    // // Use mock data for testing
    // setCompetition(mockCompetition);

    // Uncomment to fetch real data
    fetchCompetition();
  }, [competitionId]);

  if (!competition) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-[600px] max-w-4xl mx-auto relative">
      <div className="flex justify-center mb-[10px]">
        <CompetitionCard
          participantCount={competition.numberOfParticipants}
          sponsorsCount={competition.numberOfSponsors+1}
          votesCount={competition.numberOfVotes}
          onPeopleClick={() => setActiveTab('participants')}
          onSponsorsClick={() => setActiveTab('sponsors')}
          onVotesClick={() => setActiveTab('votes')}
        />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 mb-12">
        <div className="flex border-b border-gray-100 dark:border-gray-800 relative overflow-x-auto scrollbar-hide">
          <div className="flex min-w-full">
            <button
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors whitespace-nowrap px-4 ${
                activeTab === 'participants'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
            <button
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors whitespace-nowrap px-4 ${
                activeTab === 'sponsors'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('sponsors')}
            >
              Sponsors
            </button>
            <button
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors whitespace-nowrap px-4 ${
                activeTab === 'votes'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('votes')}
            >
              Votes
            </button>
          </div>
        </div>
        <div className="min-h-[200px]">
          {activeTab === 'participants' && (
            <ParticipantsTab 
            participants={competition.participants} 
            competitionId={competitionId} 
            competition={competition}
            />
          )}
          {activeTab === 'sponsors' && (
            <SponsorsTab
              hardcodedSponsors={[
                {
                  name: 'riccobeatz808',
                  username: 'riccobeatz808',
                  initial: 'R',
                  bgColor: 'bg-indigo-600',
                  prize: 'Premium Riccobeatz Beat',
                  prizeLink: 'https://riccobeatz.com',
                },
              ]}
              competitionSponsors={competition.sponsors}
            />
          )}
          {activeTab === 'votes' && (
            <VotesTab
              totalVotes={competition.numberOfVotes}
              startDate={competition.startDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;