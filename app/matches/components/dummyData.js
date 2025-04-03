// Constants for connection loading states
export const CONNECTION_STATES = {
    INITIALIZING: "Initializing connection...",
    AUTHENTICATING: "Authenticating your session...",
    CONNECTING: "Connecting to game server...",
    JOINING_ROOMS: "Joining game rooms...",
    SYNCING: "Syncing match data...",
  };
  
  // Dummy data for matches
  export const DUMMY_MATCHES = {
    urgent: [
      {
        _id: "match-urgent-1",
        name: "Quick Game #1",
        tournamentContext: null,
        timer: true,
        turn: "current-user-id", // Set to match userProfile.uuid for "your_turn" status
        opponents: [
          {
            _id: "opponent-1",
            username: "JaneDoe",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
            rating: 1542,
          }
        ],
        playerState: {
          playerDeck: [
            "7H", "3S", "KD", "2C", "JH", "AS"
          ]
        },
        gameState: {
          topCard: "7H",
          discardPile: [
            "7H", "7D", "JD"
          ],
          direction: 1,
          isKickback: false,
          isPenalty: false,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: { action: "play", card: "7H", player: "opponent-1" },
        },
        currentSuit: "H",
        desiredSuit: null,
        createdAt: new Date(Date.now() - 600000).toISOString(),
        // Add players array to fix the error
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 6
          },
          {
            userId: "opponent-1",
            username: "JaneDoe",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
            on: false,
            numCards: 8
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: ["7H", "3S", "KD", "2C", "JH", "AS"],
          on: false
        },
        topCard: "7H",
        isKickback: false,
        isPenalty: false,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: { action: "play", card: "7H", player: "opponent-1" },
        type: "game"
      },
      {
        _id: "match-urgent-2",
        name: "Tournament Semifinals",
        tournamentContext: {
          tournamentId: "tournament-1",
          tournamentName: "Weekend Challenge",
          round: "Semifinals",
          matchNumber: 2
        },
        timer: true,
        turn: "current-user-id", // Set to match userProfile.uuid for "your_turn" status
        opponents: [
          {
            _id: "opponent-2",
            username: "CardShark",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shark",
            rating: 1895,
          }
        ],
        playerState: {
          playerDeck: [
            "1S", "7S", "9H", "QD", "JC", "AS"
          ]
        },
        gameState: {
          topCard: "2S",
          discardPile: [
            "2S", "5S", "5C"
          ],
          direction: 1,
          isKickback: false,
          isPenalty: true,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: { action: "play", card: "2S", player: "opponent-2" },
        },
        currentSuit: "S",
        desiredSuit: null,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 6
          },
          {
            userId: "opponent-2",
            username: "CardShark",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shark",
            on: false,
            numCards: 4
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: ["1S", "7S", "9H", "QD", "JC", "AS"],
          on: false
        },
        topCard: "2S",
        isKickback: false,
        isPenalty: true,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: { action: "play", card: "2S", player: "opponent-2" },
        type: "tournament"
      }
    ],
    active: [
      {
        _id: "match-active-1",
        name: "Friends Match",
        tournamentContext: null,
        timer: false,
        turn: "opponent-3", // Not the current user's turn
        opponents: [
          {
            _id: "opponent-3",
            username: "Masterkadi",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Master",
            rating: 1762,
          }
        ],
        playerState: {
          playerDeck: [
            "1H", "3D", "2S", "QC", "7D", "KH", "9S", "JOK1"
          ]
        },
        gameState: {
          topCard: "4C",
          discardPile: [
            "4C", "2C", "2H"
          ],
          direction: 1,
          isKickback: false,
          isPenalty: false,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: { action: "play", card: "4C", player: "opponent-3" },
        },
        currentSuit: "C",
        desiredSuit: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 8
          },
          {
            userId: "opponent-3",
            username: "Masterkadi",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Master",
            on: false,
            numCards: 5
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: ["1H", "3D", "2S", "QC", "7D", "KH", "9S", "JOK1"],
          on: false
        },
        topCard: "4C",
        isKickback: false,
        isPenalty: false,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: { action: "play", card: "4C", player: "opponent-3" },
        type: "game"
      },
      {
        _id: "match-active-2",
        name: "Casual Game #42",
        tournamentContext: null,
        timer: false,
        turn: "opponent-4", // Not the current user's turn
        opponents: [
          {
            _id: "opponent-4",
            username: "kadiChampion",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Champion",
            rating: 1621,
          }
        ],
        playerState: {
          playerDeck: [
            "0D", "5D", "8S", "3C", "QH"
          ]
        },
        gameState: {
          topCard: "KD",
          discardPile: [
            "KD", "1D", "1H"
          ],
          direction: -1,
          isKickback: true,
          isPenalty: false,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: { action: "play", card: "KD", player: "opponent-4" },
        },
        currentSuit: "D",
        desiredSuit: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 5
          },
          {
            userId: "opponent-4",
            username: "kadiChampion",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Champion",
            on: false,
            numCards: 3
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: ["0D", "5D", "8S", "3C", "QH"],
          on: false
        },
        topCard: "KD",
        isKickback: true,
        isPenalty: false,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: { action: "play", card: "KD", player: "opponent-4" },
        type: "game"
      },
      {
        _id: "match-active-3",
        name: "Friendly Battle",
        tournamentContext: null,
        timer: false,
        turn: "opponent-5", // Not the current user's turn
        opponents: [
          {
            _id: "opponent-5",
            username: "CardWizard",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wizard",
            rating: 1893,
          }
        ],
        playerState: {
          playerDeck: [
            "5H", "2S", "2D", "AD"
          ]
        },
        gameState: {
          topCard: "3H",
          discardPile: [
            "3H", "3D", "1D"
          ],
          direction: 1,
          isKickback: false,
          isPenalty: false,
          isQuestion: true,
          jumpCounter: 0,
          lastGamePlay: { action: "play", card: "3H", player: "opponent-5" },
        },
        currentSuit: "H",
        desiredSuit: null,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 4
          },
          {
            userId: "opponent-5",
            username: "CardWizard",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wizard",
            on: true,
            numCards: 1
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: ["5H", "2S", "2D", "AD"],
          on: false
        },
        topCard: "3H",
        isKickback: false,
        isPenalty: false,
        isQuestion: true,
        jumpCounter: 0,
        lastGamePlay: { action: "play", card: "3H", player: "opponent-5" },
        type: "game"
      }
    ],
    scheduled: [
      {
        _id: "match-scheduled-1",
        name: "Weekend Tournament Round 1",
        tournamentContext: {
          tournamentId: "tournament-2",
          tournamentName: "Weekend Championship",
          round: "Round 1",
          matchNumber: 3
        },
        timer: true,
        turn: null, // Not started yet
        opponents: [
          {
            _id: "opponent-6",
            username: "GameMaster",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Game",
            rating: 1742,
          }
        ],
        playerState: {
          playerDeck: []
        },
        gameState: {
          topCard: null,
          discardPile: [],
          direction: 1,
          isKickback: false,
          isPenalty: false,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: null,
        },
        currentSuit: null,
        desiredSuit: null,
        scheduledTime: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
        createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 0
          },
          {
            userId: "opponent-6",
            username: "GameMaster",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Game",
            on: false,
            numCards: 0
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: [],
          on: false
        },
        topCard: null,
        isKickback: false,
        isPenalty: false,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: null,
        type: "tournament"
      },
      {
        _id: "match-scheduled-2",
        name: "League Match",
        tournamentContext: {
          tournamentId: "league-1",
          tournamentName: "Spring League",
          round: "Week 3",
          matchNumber: 5
        },
        timer: true,
        turn: null, // Not started yet
        opponents: [
          {
            _id: "opponent-7",
            username: "kadiLegend",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Legend",
            rating: 1851,
          }
        ],
        playerState: {
          playerDeck: []
        },
        gameState: {
          topCard: null,
          discardPile: [],
          direction: 1,
          isKickback: false,
          isPenalty: false,
          isQuestion: false,
          jumpCounter: 0,
          lastGamePlay: null,
        },
        currentSuit: null,
        desiredSuit: null,
        scheduledTime: new Date(Date.now() + 172800000).toISOString(), // 2 days in future
        createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
        // Add players array
        players: [
          {
            userId: "current-user-id",
            username: "You",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=You",
            on: false,
            numCards: 0
          },
          {
            userId: "opponent-7",
            username: "kadiLegend",
            profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=Legend",
            on: false,
            numCards: 0
          }
        ],
        // Match properties expected by MatchCard
        playerObj: {
          playerDeck: [],
          on: false
        },
        topCard: null,
        isKickback: false,
        isPenalty: false,
        isQuestion: false,
        jumpCounter: 0,
        lastGamePlay: null,
        type: "tournament"
      }
    ]
  };
  
  // AI Player ID to filter out AI matches
  export const AI_PLAYER_ID = "676112252e2cd5a9df380aad";