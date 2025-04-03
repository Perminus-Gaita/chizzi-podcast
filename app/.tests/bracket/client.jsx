"use client"
import React from 'react';
import { SingleEliminationBracket, SVGViewer } from '@g-loot/react-tournament-brackets';

const CustomMatchCard =({ match, onMatchClick, onPartyClick, topParty, bottomParty }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-72 h-20">
      {/* Team 1 */}
      <div className="flex items-center gap-2 p-2 h-[38px] bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/24/24"
          alt={topParty?.name || "Player"}
          className="w-6 h-6 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate leading-none mb-0.5">
            {topParty?.name || "John Smith"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-none">
            {topParty?.username || "@johnsmith"}
          </span>
        </div>
      </div>
      
      <div className="h-px bg-gray-200 dark:bg-gray-700" />
      
      {/* Team 2 */}
      <div className="flex items-center gap-2 p-2 h-[38px] bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/24/24"
          alt={bottomParty?.name || "Player"}
          className="w-6 h-6 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate leading-none mb-0.5">
            {bottomParty?.name || "Emma Wilson"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-none">
            {bottomParty?.username || "@emmaw"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Sample tournament data for 8 players
const matches = [
  // Quarter Finals
  {
    id: 'qf-1',
    name: 'Quarter Final 1',
    nextMatchId: 'sf-1',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '2',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Sarah Wilson',
        username: '@sarahw'
      }
    ]
  },
  {
    id: 'qf-2',
    name: 'Quarter Final 2',
    nextMatchId: 'sf-1',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '3',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'James Brown',
        username: '@jamesb'
      },
      {
        id: '4',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'Emma Davis',
        username: '@emmad'
      }
    ]
  },
  {
    id: 'qf-3',
    name: 'Quarter Final 3',
    nextMatchId: 'sf-2',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '5',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      },
      {
        id: '6',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Lisa Anderson',
        username: '@lisaa'
      }
    ]
  },
  {
    id: 'qf-4',
    name: 'Quarter Final 4',
    nextMatchId: 'sf-2',
    tournamentRoundText: '1',
    state: 'DONE',
    participants: [
      {
        id: '7',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'David Wilson',
        username: '@davidw'
      },
      {
        id: '8',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Emily Taylor',
        username: '@emilyt'
      }
    ]
  },
  // Semi Finals
  {
    id: 'sf-1',
    name: 'Semi Final 1',
    nextMatchId: 'f-1',
    tournamentRoundText: '2',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '3',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'James Brown',
        username: '@jamesb'
      }
    ]
  },
  {
    id: 'sf-2',
    name: 'Semi Final 2',
    nextMatchId: 'f-1',
    tournamentRoundText: '2',
    state: 'DONE',
    participants: [
      {
        id: '5',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      },
      {
        id: '8',
        resultText: '0',
        isWinner: false,
        status: 'PLAYED',
        name: 'Emily Taylor',
        username: '@emilyt'
      }
    ]
  },
  // Final
  {
    id: 'f-1',
    name: 'Final',
    nextMatchId: null,
    tournamentRoundText: '3',
    state: 'DONE',
    participants: [
      {
        id: '1',
        resultText: '2',
        isWinner: true,
        status: 'PLAYED',
        name: 'John Smith',
        username: '@johnsmith'
      },
      {
        id: '5',
        resultText: '1',
        isWinner: false,
        status: 'PLAYED',
        name: 'Michael Johnson',
        username: '@michaelj'
      }
    ]
  }
];

export default function TournamentBracket() {
  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-900">
      <SingleEliminationBracket
        matches={matches} // Your matches data here
        matchComponent={CustomMatchCard}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer 
            width={props.bracketWidth} 
            height={props.bracketHeight}
            {...props}
            background="transparent"
            SVGBackground="transparent"
          >
            {children}
          </SVGViewer>
        )}
        options={{
          style: {
            roundHeader: { 
              isShown: false,
            },
            connectorColor: '#64748b',
            connectorColorHighlight: '#94a3b8',
            width: 200, // Exact width to match card
            boxHeight: 80, // Reduced height for smaller content
            canvasPadding: 0, // Removed outer padding
            spaceBetweenColumns: 48, // Reduced column gap
            spaceBetweenRows: 24, // Reduced row gap
            lineInfo: {
              separation: -16,
              homeVisitorSpread: 0,
            }
          }
        }}
      />
    </div>
  );
}


const CustomMatchCard2 = ({ match, onMatchClick, onPartyClick, topParty, bottomParty }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 w-[200px] transition-all duration-200 hover:shadow-lg">
    {/* Player 1 */}
    <div className="flex items-center gap-2 mb-1.5">
      <img 
        src="/api/placeholder/20/20" 
        alt={topParty?.name || "Player"}
        className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700"
      />
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
          {topParty?.name || "TBD"}
        </div>
        <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
          {topParty?.username || "@tbd"}
        </div>
      </div>
    </div>
    
    <div className="h-px bg-gray-200 dark:bg-gray-700" />
    
    {/* Player 2 */}
    <div className="flex items-center gap-2 mt-1.5">
      <img 
        src="/api/placeholder/20/20"
        alt={bottomParty?.name || "Player"}
        className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700"
      />
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
          {bottomParty?.name || "TBD"}
        </div>
        <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
          {bottomParty?.username || "@tbd"}
        </div>
      </div>
    </div>
  </div>
);

const CustomMatchCard3 = ({ match, onMatchClick, onPartyClick, topParty, bottomParty }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-72">
      {/* Team 1 */}
      <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/32/32"
          alt={topParty?.name || "Player"}
          className="w-8 h-8 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {topParty?.name || "John Smith"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {topParty?.username || "@johnsmith"}
          </div>
        </div>
      </div>
      
      <div className="h-px bg-gray-200 dark:bg-gray-700" />
      
      {/* Team 2 */}
      <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/30">
        <img 
          src="/api/placeholder/32/32"
          alt={bottomParty?.name || "Player"}
          className="w-8 h-8 rounded-full bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {bottomParty?.name || "Emma Wilson"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {bottomParty?.username || "@emmaw"}
          </div>
        </div>
      </div>
    </div>
  );
}
