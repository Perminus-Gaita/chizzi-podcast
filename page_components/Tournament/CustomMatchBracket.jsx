"use client";
import Link from "next/link";
// Default tournament data
export const defaultMatches = [
  // Quarter Finals
  {
    id: "qf-1",
    name: "Quarter Final 1",
    nextMatchId: "sf-1",
    tournamentRoundText: "1",
    state: "DONE",
    participants: [
      {
        id: "1",
        resultText: "2",
        isWinner: true,
        status: "PLAYED",
        name: "John Smith",
        username: "@johnsmith",
      },
      {
        id: "2",
        resultText: "1",
        isWinner: false,
        status: "PLAYED",
        name: "Sarah Wilson",
        username: "@sarahw",
      },
    ],
  },
  {
    id: "qf-2",
    name: "Quarter Final 2",
    nextMatchId: "sf-1",
    tournamentRoundText: "1",
    state: "SCHEDULED",
    participants: [
      {
        id: "3",
        name: "James Brown",
        username: "@jamesb",
        status: null,
        resultText: null,
        isWinner: false,
      },
      {
        id: 0, // Open slot for joining
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
    ],
  },
  {
    id: "qf-3",
    name: "Quarter Final 3",
    nextMatchId: "sf-2",
    tournamentRoundText: "1",
    state: "DONE",
    participants: [
      {
        id: "5",
        resultText: "2",
        isWinner: true,
        status: "PLAYED",
        name: "Michael Johnson",
        username: "@michaelj",
      },
      {
        id: "6",
        resultText: "1",
        isWinner: false,
        status: "PLAYED",
        name: "Lisa Anderson",
        username: "@lisaa",
      },
    ],
  },
  {
    id: "qf-4",
    name: "Quarter Final 4",
    nextMatchId: "sf-2",
    tournamentRoundText: "1",
    state: "SCHEDULED",
    participants: [
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
    ],
  },
  // Semi Finals
  {
    id: "sf-1",
    name: "Semi Final 1",
    nextMatchId: "f-1",
    tournamentRoundText: "2",
    state: "SCHEDULED",
    participants: [
      {
        id: "1",
        name: "John Smith",
        username: "@johnsmith",
        resultText: null,
        isWinner: false,
        status: null,
      },
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
    ],
  },
  {
    id: "sf-2",
    name: "Semi Final 2",
    nextMatchId: "f-1",
    tournamentRoundText: "2",
    state: "SCHEDULED",
    participants: [
      {
        id: "5",
        name: "Michael Johnson",
        username: "@michaelj",
        resultText: null,
        isWinner: false,
        status: null,
      },
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
    ],
  },
  // Final
  {
    id: "f-1",
    name: "Final",
    nextMatchId: null,
    tournamentRoundText: "3",
    state: "SCHEDULED",
    participants: [
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
      {
        id: 0,
        name: "",
        username: "",
        status: "NO_PARTY",
        resultText: null,
        isWinner: false,
      },
    ],
  },
];

import React, { useState, useRef, useEffect } from "react";
import { SingleEliminationBracket } from "@g-loot/react-tournament-brackets";
import {
  UncontrolledReactSVGPanZoom,
  TOOL_AUTO,
  INITIAL_VALUE,
} from "react-svg-pan-zoom";

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

const CustomMatchCard = ({
  match,
  onMatchClick,
  onPartyClick,
  topParty,
  bottomParty,
  topWon,
  bottomWon,
}) => {
  const handleJoinTournament = (position) => {
    console.log("Joining tournament at position:", position);
  };

  const isFirstRound = match.tournamentRoundText === "1";

  const renderParticipant = (participant, position, isWinner) => {
    if (participant?.id === 0) {
      return (
        <div className="flex items-center justify-center h-16 bg-blue-600/10 dark:bg-gray-800">
          {isFirstRound ? (
            <button
              onClick={() => handleJoinTournament(position)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md text-sm"
            >
              Join Tournament
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-sm text-blue-600 dark:text-blue-500">
                To be determined
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-3 p-4 h-16 
        ${
          isWinner
            ? "bg-green-600/10 dark:bg-green-900/20"
            : "bg-blue-600/10 dark:bg-gray-800"
        } 
        ${!isWinner && (topWon || bottomWon) ? "opacity-70 bg-gray-100" : ""}`}
      >
        <img
          src={
            participant.profilePicture ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${participant.name}`
          }
          alt={participant.name}
          className="w-10 h-10 rounded-full bg-gray-100"
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <span className="font-medium text-base text-gray-900 dark:text-gray-100 truncate">
            {participant.name}
            {isWinner && <span className="ml-1">👑</span>}
          </span>
          <Link
            href={`/${participant.username}`}
            className="flex-1 min-w-0 flex flex-col hover:underline"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {participant.username !== undefined && "@"}
              {participant.username}
            </span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-blue-600/10 dark:bg-gray-800 rounded-lg w-52 h-32 overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
      {renderParticipant(topParty, "top", topWon)}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />
      {renderParticipant(bottomParty, "bottom", bottomWon)}
    </div>
  );
};

const CustomMatchBracket = ({ matches = defaultMatches }) => {
  const containerRef = useRef(null);
  const Viewer = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [windowWidth, windowHeight] = useWindowSize();

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({
        width: rect.width || windowWidth || 800,
        height: rect.height || windowHeight || 600,
      });
    }
  }, [windowWidth, windowHeight]);

  useEffect(() => {
    if (Viewer.current) {
      Viewer.current.fitToViewer();
    }
  }, [containerSize]);

  const handleZoomIn = () => {
    if (Viewer.current) {
      Viewer.current.zoomOnViewerCenter(1.1);
    }
  };

  const handleZoomOut = () => {
    if (Viewer.current) {
      Viewer.current.zoomOnViewerCenter(0.9);
    }
  };

  const handleReset = () => {
    if (Viewer.current) {
      Viewer.current.fitToViewer();
    }
  };

  return (
    <div ref={containerRef} className="relative h-[600px] touch-none">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {containerSize.width > 0 && (
        <SingleEliminationBracket
          matches={matches}
          matchComponent={CustomMatchCard}
          svgWrapper={({ children, ...props }) => (
            <UncontrolledReactSVGPanZoom
              ref={Viewer}
              width={containerSize.width}
              height={containerSize.height}
              background="none"
              SVGBackground="none"
              scaleFactorMin={0.2}
              scaleFactorMax={3}
              defaultTool={TOOL_AUTO}
              defaultValue={INITIAL_VALUE}
              detectPinchGesture={true}
              detectAutoPan={false}
              toolbarProps={{ position: "none" }}
              miniatureProps={{ position: "none" }}
              {...props}
            >
              <svg
                width={containerSize.width}
                height={containerSize.height}
                style={{ backgroundColor: "transparent" }}
              >
                {children}
              </svg>
            </UncontrolledReactSVGPanZoom>
          )}
          options={{
            style: {
              roundHeader: { isShown: true },
              connectorColor: "#64748b",
              connectorColorHighlight: "#94a3b8",
              width: 208,
              boxHeight: 128,
              canvasPadding: 20,
              spaceBetweenColumns: 64,
              spaceBetweenRows: 32,
              lineInfo: {
                separation: -20,
                homeVisitorSpread: 0,
              },
            },
            disableAutoSpan: true,
          }}
        />
      )}
    </div>
  );
};

export default CustomMatchBracket;
