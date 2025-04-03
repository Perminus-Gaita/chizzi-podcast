"use client";

// Define default matches with 4 players per match
const defaultMatches = [
  {
    id: 19874,
    name: 'Final - Match',
    nextMatchId: null,
    tournamentRoundText: '3',
    startTime: '2024-05-30',
    state: 'SCHEDULED',
    participants: [
      {
        id: 'player1',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 1',
        username: '@player1'
      },
      {
        id: 'player2',
        resultText: '2nd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 2',
        username: '@player2'
      },
      {
        id: 'player3',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 3', 
        username: '@player3'
      },
      {
        id: 'player4',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 4',
        username: '@player4'
      }
    ]
  },
  {
    id: 19875,
    name: 'Semi Final - Match 1',
    nextMatchId: 19874,
    tournamentRoundText: '2', 
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'player1',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 1',
        username: '@semi1p1'
      },
      {
        id: 'player2', 
        resultText: '2nd',
        isWinner: true,
        status: 'PLAYED',
        name: 'Player 2',
        username: '@semi1p2'
      },
      {
        id: 'player3',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 3',
        username: '@semi1p3'
      },
      {
        id: 'player4',
        resultText: '4th', 
        isWinner: false,
        status: 'PLAYED',
        name: 'Player 4',
        username: '@semi1p4'
      }
    ]
  },
  {
    id: 19876,
    name: 'Semi Final - Match 2',
    nextMatchId: 19874,
    tournamentRoundText: '2',
    startTime: '2024-05-30',
    state: 'SCORE_DONE',
    participants: [
      {
        id: 'player5',
        resultText: '1st',
        isWinner: true,
        status: 'PLAYED',
        name: 'player 5',
        username: '@semi2p1'
      },
      {
        id: 'player6',
        resultText: '2nd',
        isWinner: true,
        status: 'PLAYED', 
        name: 'player 6',
        username: '@semi2p2'
      },
      {
        id: 'player7',
        resultText: '3rd',
        isWinner: false,
        status: 'PLAYED',
        name: 'player 7',
        username: '@semi2p3'
      },
      {
        id: 'player8',
        resultText: '4th',
        isWinner: false,
        status: 'PLAYED',
        name: 'player 8', 
        username: '@semi2p4'
      }
    ]
  }
];


import React, { useState, useRef, useEffect } from 'react';
import { SingleEliminationBracket, SVGViewer } from '@g-loot/react-tournament-brackets';
import styled from 'styled-components';

const StyledSvgViewer = styled(SVGViewer).attrs(props => ({
  background: props.theme.canvasBackground,
  SVGBackground: props.theme.canvasBackground,
}))``;

const CustomMatchCard = ({ 
  match, 
  onMatchClick, 
  onPartyClick, 
  onMouseEnter,
  onMouseLeave
}) => {
  // Generate Dicebear avatar URL for participants without pictures
  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  // Ensure we always have 4 slots, even if some are empty
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
          <div 
            className={`flex items-center gap-2 p-2 ${
              player.isWinner ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
            onMouseEnter={() => onMouseEnter(player.id)}
            onMouseLeave={onMouseLeave}
            onClick={() => onPartyClick?.(player, player.isWinner)}
          >
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
            {/* Position indicator */}
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

// Keep the rest of the component (useWindowSize hook and main TournamentBracket component)
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    const updateSize = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 100);
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => {
      window.removeEventListener('resize', updateSize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  return size;
};

export default function TournamentBracket({ matches = defaultMatches }) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [windowWidth, windowHeight] = useWindowSize();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({
        width: rect.width || windowWidth || 800,
        height: rect.height || windowHeight || 600
      });
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [windowWidth, windowHeight]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-screen">
      {containerSize.width > 0 && (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={CustomMatchCard}
          svgWrapper={({ children, ...props }) => (
            <StyledSvgViewer 
              width={containerSize.width} 
              height={800} // Increased height to accommodate taller match boxes
              {...props}
            >
              {children}
            </StyledSvgViewer>
          )}
          options={{
            style: {
              width: 288,
              boxHeight: 225, // Increased height for 4 players
              canvasPadding: 16,
              spaceBetweenColumns: 60, // Increased spacing for better readability
              spaceBetweenRows: 60, // Increased spacing for better readability
              roundHeader: {
                isShown: true,
                height: 32,
                marginBottom: 16,
                fontSize: 14,
                fontColor: 'currentColor',
                backgroundColor: 'var(--header-bg, #f1f5f9)',
              },
              lineInfo: {
                separation: -12,
                homeVisitorSpread: 0.4
              },
              horizontalOffset: 12
            }
          }}
        />
      )}
    </div>
  );
}