"use client";

// Define matches with 4 initial matches and 1 final match
const defaultMatches = [
  // Final match should come last in the array
  {
    id: 'qf-1',
    name: 'Qualifier 1',
    nextMatchId: 'finals',
    tournamentRoundText: '1',
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'p1',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 1',
      },
      {
        id: 'p2',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 2',
      },
      {
        id: 'p3',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 3',
      },
      {
        id: 'p4',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 4',
      }
    ]
  },
  {
    id: 'qf-2',
    name: 'Qualifier 2',
    nextMatchId: 'finals',
    tournamentRoundText: '1',
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'p5',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 5',
      },
      {
        id: 'p6',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 6',
      },
      {
        id: 'p7',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 7',
      },
      {
        id: 'p8',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 8',
      }
    ]
  },
  {
    id: 'qf-3',
    name: 'Qualifier 3',
    nextMatchId: 'finals',
    tournamentRoundText: '1',
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'p9',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 9',
      },
      {
        id: 'p10',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 10',
      },
      {
        id: 'p11',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 11',
      },
      {
        id: 'p12',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 12',
      }
    ]
  },
  {
    id: 'qf-4',
    name: 'Qualifier 4',
    nextMatchId: 'finals',
    tournamentRoundText: '1',
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'p13',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 13',
      },
      {
        id: 'p14',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 14',
      },
      {
        id: 'p15',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 15',
      },
      {
        id: 'p16',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 16',
      }
    ]
  },
  {
    id: 'finals',
    name: 'Finals',
    nextMatchId: null,
    tournamentRoundText: '2',
    startTime: '2024-05-30',
    state: 'SCHEDULED',
    participants: [
      {
        id: 'p1',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 1',
      },
      {
        id: 'p5',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 5',
      },
      {
        id: 'p9',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 9',
      },
      {
        id: 'p13',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 13',
      }
    ]
  }
];


import React, { useState, useRef, useEffect } from 'react';

// Match card component for displaying 4 players
const MatchCard = ({ match }) => {
  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const players = [...(match.participants || [])];
  while (players.length < 4) {
    players.push({
      id: `empty-${players.length}`,
      name: 'TBD',
      resultText: '',
      isWinner: false
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-72 shadow-md overflow-hidden">
      {players.map((player, index) => (
        <React.Fragment key={player.id || index}>
          <div className={`flex items-center gap-2 p-2 ${
            player.isWinner ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}>
            <img
              src={player.picture || getAvatarUrl(player.name)}
              alt={player.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {player.name}
              </div>
              {player.resultText && (
                <div className={`text-xs ${
                  player.isWinner 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {player.resultText}
                </div>
              )}
            </div>
            {player.status === 'PLAYED' && (
              <div className={`text-xs font-medium ${
                player.isWinner 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {index + 1}°
              </div>
            )}
          </div>
          {index < players.length - 1 && (
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Custom tournament bracket component
export default function CustomTournamentBracket({ matches = defaultMatches }) {
  const containerRef = useRef(null);
  const matchRefs = useRef(new Map());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const calculateConnectorPaths = () => {
      const qualifierMatches = matches.slice(0, 4);
      const finalMatch = matches[4];
      const finalElement = matchRefs.current.get('finals');
      
      if (!finalElement) return [];

      const finalRect = finalElement.getBoundingClientRect();
      const finalLeft = finalRect.left + window.scrollX;
      const finalMiddleY = finalRect.top + window.scrollY + finalRect.height / 2;

      const newPaths = qualifierMatches.map((match, index) => {
        const matchElement = matchRefs.current.get(match.id);
        if (!matchElement) return null;

        const matchRect = matchElement.getBoundingClientRect();
        const startX = matchRect.right + window.scrollX;
        const startY = matchRect.top + window.scrollY + matchRect.height / 2;
        const midX = finalLeft - 50; // 50px before final match

        return `M ${startX} ${startY} 
                H ${midX} 
                V ${finalMiddleY} 
                H ${finalLeft}`;
      });

      setPaths(newPaths.filter(Boolean));
    };

    // Calculate initial paths
    calculateConnectorPaths();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      calculateConnectorPaths();
    });

    const container = containerRef.current;
    if (container) {
      resizeObserver.observe(container);
    }

    // Cleanup
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [matches]);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen p-8">
      {/* SVG layer for connector lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: '100%', minHeight: '100%' }}>
        {paths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
      </svg>

      {/* Matches layout */}
      <div className="relative flex justify-between gap-24">
        {/* Qualifiers column */}
        <div className="flex flex-col gap-8">
          {matches.slice(0, 4).map((match) => (
            <div 
              key={match.id}
              ref={el => matchRefs.current.set(match.id, el)}
            >
              <MatchCard match={match} />
            </div>
          ))}
        </div>

        {/* Finals column */}
        <div 
          className="self-center"
          ref={el => matchRefs.current.set('finals', el)}
        >
          <MatchCard match={matches[4]} />
        </div>
      </div>
    </div>
  );
}