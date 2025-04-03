"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import "../../styles/2048.css";
import { use2048Socket } from "@/hooks/use2048Socket";

class GameManager {
  constructor(
    size,
    setGrid,
    setScore,
    setBestScore,
    setGameState,
    setScoreAddition
  ) {
    this.size = size;
    this.setGrid = setGrid;
    this.setScore = setScore;
    this.setBestScore = setBestScore;
    this.setGameState = setGameState;
    this.setScoreAddition = setScoreAddition;

    // Initialize properties
    this.storageManager = new LocalStorageManager();
    this.inputManager = new KeyboardInputManager();

    // Initialize game state
    this.reset();

    // Set up event listeners
    this.setupEventListeners();
  }

  reset() {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false; // Initialize as a boolean
    this.addStartTiles();
  }

  addStartTiles() {
    for (let i = 0; i < 2; i++) {
      this.addRandomTile();
    }
  }

  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const cell = this.grid.randomAvailableCell();
      const tile = new Tile(cell, value);
      this.grid.insertTile(tile);
      this.updateState();
    }
  }

  updateState() {
    this.setGrid(this.grid);
    this.setScore(this.score);
    this.setBestScore(this.storageManager.getBestScore());
    this.setGameState({ over: this.over, won: this.won });
  }

  setupEventListeners() {
    // Bind methods to the current instance
    this.moveHandler = this.move.bind(this);
    this.restartHandler = this.restart.bind(this);
    this.keepPlayingHandler = this.handleKeepPlaying.bind(this);

    // Attach the bound methods as event listeners
    this.inputManager.on("move", this.moveHandler);
    this.inputManager.on("restart", this.restartHandler);
    this.inputManager.on("keepPlaying", this.keepPlayingHandler);
  }

  cleanup() {
    // Remove event listeners using the bound methods
    this.inputManager.off("move", this.moveHandler);
    this.inputManager.off("restart", this.restartHandler);
    this.inputManager.off("keepPlaying", this.keepPlayingHandler);
  }

  move(direction) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    let scoreAddition = 0;
    let cell, tile;
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        cell = { x, y };
        tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            const previousScore = this.score;
            this.score += merged.value;
            scoreAddition = this.score - previousScore;

            // The mighty 2048 tile
            if (merged.value === 2048) this.won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }

      this.updateState();

      if (scoreAddition > 0) {
        this.setScoreAddition(scoreAddition);
      }
    }
  }

  getVector(direction) {
    // Vectors representing tile movement
    const map = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };

    return map[direction];
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(cell, vector) {
    let previous;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell, // Used to check if a merge is required
    };
  }

  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });

        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction);
            const cell = { x: x + vector.x, y: y + vector.y };

            const other = this.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  }

  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  prepareTiles() {
    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }

  restart() {
    this.reset();
    this.updateState();
  }

  handleKeepPlaying() {
    this.keepPlaying = true; // Update the keepPlaying property
    this.updateState();
  }
}

class LocalStorageManager {
  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";
  }

  getBestScore() {
    return Number(localStorage.getItem(this.bestScoreKey)) || 0;
  }

  setBestScore(score) {
    localStorage.setItem(this.bestScoreKey, score);
  }

  getGameState() {
    const stateJSON = localStorage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  setGameState(gameState) {
    localStorage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  clearGameState() {
    localStorage.removeItem(this.gameStateKey);
  }
}

class KeyboardInputManager {
  constructor() {
    this.events = {};
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.setupEventListeners();
  }

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown);

    // touch events
    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchend", this.handleTouchEnd);

    // Add button event listeners
    this.bindButtonPress(".retry-button", () => this.emit("restart"));
    this.bindButtonPress(".restart-button", () => this.emit("restart"));
    this.bindButtonPress(".keep-playing-button", () =>
      this.emit("keepPlaying")
    );
  }

  handleKeyDown = (event) => {
    const map = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
    };
    const mapped = map[event.which];
    if (mapped !== undefined) {
      event.preventDefault();
      this.emit("move", mapped);
    }
  };

  bindButtonPress(selector, fn) {
    const button = document.querySelector(selector);
    if (button) {
      button.addEventListener("click", fn);
      button.addEventListener("touchend", fn);
    }
  }

  handleTouchStart = (event) => {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  };

  handleTouchEnd = (event) => {
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    this.handleSwipe();
  };

  handleSwipe() {
    const dx = this.touchEndX - this.touchStartX;
    const dy = this.touchEndY - this.touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // Swipe threshold
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) {
          this.emit("move", 1); // Right
        } else {
          this.emit("move", 3); // Left
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          this.emit("move", 2); // Down
        } else {
          this.emit("move", 0); // Up
        }
      }
    }
  }

  cleanup() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchend", this.handleTouchEnd);
  }
}

class Grid {
  constructor(size, previousState = null) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }

  // Create an empty grid
  empty() {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      const row = (cells[x] = []);
      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
    return cells;
  }

  // Restore grid from a previous state
  fromState(state) {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      const row = (cells[x] = []);
      for (let y = 0; y < this.size; y++) {
        const tile = state[x][y];
        row.push(tile ? new Tile({ x, y }, tile.value) : null);
      }
    }
    return cells;
  }

  // Find the first available random position
  randomAvailableCell() {
    const cells = this.availableCells();
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  }

  // Get all available cells
  availableCells() {
    const cells = [];
    this.eachCell((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });
    return cells;
  }

  // Check if there are any available cells
  cellsAvailable() {
    return !!this.availableCells().length;
  }

  // Check if a specific cell is available
  cellAvailable(cell) {
    return !this.cellOccupied(cell);
  }

  // Check if a specific cell is occupied
  cellOccupied(cell) {
    return !!this.cellContent(cell);
  }

  // Get the content of a specific cell
  cellContent(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }

  // Check if a position is within the grid bounds
  withinBounds(position) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  // Insert a tile at its position
  insertTile(tile) {
    this.cells[tile.x][tile.y] = tile;
  }

  // Remove a tile from the grid
  removeTile(tile) {
    this.cells[tile.x][tile.y] = null;
  }

  // Serialize the grid for storage
  serialize() {
    const cellState = [];
    for (let x = 0; x < this.size; x++) {
      const row = (cellState[x] = []);
      for (let y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
      }
    }
    return {
      size: this.size,
      cells: cellState,
    };
  }

  // Call a callback for every cell in the grid
  eachCell(callback) {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }
}

const ScoreBoard = ({ score, bestScore, scoreAddition }) => {
  return (
    <div className="scores-container">
      <div className="score-container">
        {score}
        {scoreAddition && (
          <div className="score-addition">+{scoreAddition}</div>
        )}
      </div>
      <div className="best-container">{bestScore}</div>
    </div>
  );
};

class Tile {
  constructor(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }

  // Save the current position of the tile
  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  // Update the position of the tile
  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }

  // Serialize the tile for storage
  serialize() {
    return {
      position: {
        x: this.x,
        y: this.y,
      },
      value: this.value,
    };
  }
}

const TileComponent = ({ tile }) => {
  const [position, setPosition] = useState(tile);
  const [merged, setMerged] = useState(false);
  const [newTile, setNewTile] = useState(false);

  useEffect(() => {
    if (tile.mergedFrom) {
      setMerged(true);
      setTimeout(() => setMerged(false), 200);
    } else if (tile.previousPosition) {
      setNewTile(true);
      setTimeout(() => setNewTile(false), 200);
    }
    setPosition(tile);
  }, [tile]);

  const positionClass = `tile-position-${position.x + 1}-${position.y + 1}`;
  const classes = [
    "tile",
    `tile-${position.value}`,
    positionClass,
    merged && "tile-merged",
    newTile && "tile-new",
    position.value > 2048 && "tile-super",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="tile-inner">{position.value}</div>
    </div>
  );
};

const GameGrid = ({ grid, gameState, handleRestart }) => {
  return (
    <div className="game-container">
      <div className="grid-container">
        {[...Array(4)].map((_, x) => (
          <div key={x} className="grid-row">
            {[...Array(4)].map((_, y) => (
              <div key={`${x}-${y}`} className="grid-cell" />
            ))}
          </div>
        ))}
      </div>
      <div className="tile-container">
        {grid?.cells
          .flat()
          .map(
            (tile, i) =>
              tile && <TileComponent key={`${tile.x}-${tile.y}`} tile={tile} />
          )}
      </div>
      {gameState.over && (
        <GameMessage won={gameState.won} handleRestart={handleRestart} />
      )}
    </div>
  );
};

const GameMessage = ({ won, handleRestart }) => (
  <div className={`game-message ${won ? "game-won" : "game-over"}`}>
    <p>{won ? "You win!" : "Game over!"}</p>
    <div className="lower">
      {!won && (
        <a className="retry-button cursor-pointer" onClick={handleRestart}>
          Try again
        </a>
      )}
      {won && <a className="keep-playing-button">Keep going</a>}
    </div>
  </div>
);

const TwentyFortyEight = () => {
  const gameManagerRef = useRef(null);
  const localStorageManager = new LocalStorageManager();

  const userProfile = useSelector((state) => state.auth.profile);
  const { leaderboard, connectionStatus, updateHighScore } = use2048Socket();

  const [grid, setGrid] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState({ over: false, won: false });
  const [scoreAddition, setScoreAddition] = useState(null);

  const handleRestart = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.restart();
    }
  };

  useEffect(() => {
    const gameManager = new GameManager(
      4,
      setGrid,
      setScore,
      setBestScore,
      setGameState,
      (addition) => {
        setScoreAddition(addition);
        setTimeout(() => setScoreAddition(null), 600); // Clear after animation
      }
    );
    gameManagerRef.current = gameManager;
    return () => gameManager.cleanup();
  }, []);

  useEffect(() => {
    if (userProfile) {
      const localBestScore = localStorageManager.getBestScore();
      if (localBestScore > 0) {
        updateHighScore(localBestScore); // Sync local score to database
        localStorageManager.clearGameState(); // Clear local storage after sync
      }
    }
  }, [userProfile, updateHighScore]);

  useEffect(() => {
    if (!userProfile) {
      const localBestScore = localStorageManager.getBestScore();
      setBestScore(localBestScore);
    }
  }, [userProfile]);

  return (
    <div className="relative p-4">
      <div className="flex justify-between items-center mb-2 md:mb-6">
        <div className="flex flex-col w-1/3">
          <h1 className="text-4xl font-bold mb-4 md:mb-0 text-gray-600 dark:text-gray-300">
            2048
          </h1>
          <p className="text-xs mdt:text-base">
            Join the numbers and get to the <strong>2048 tile!</strong>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <ScoreBoard
            score={score}
            bestScore={bestScore}
            scoreAddition={scoreAddition}
          />
          <div className="w-full flex justify-end">
            <button
              onClick={handleRestart}
              className="bg-[#8f7a66] text-gray-200 p-1 px-2 rounded-md"
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col md:flex-row gap-6"
        // style={{ backgroundColor: "purple" }}
        // style={{
        //   height: "60vh",
        // }}
      >
        <div className="w-full md:w-2/3">
          <GameGrid
            grid={grid}
            gameState={gameState}
            handleRestart={handleRestart}
          />
        </div>

        <div className="w-full md:w-1/3">
          <div
            className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4"
            // style={{ height: "30vh", overflowY: "auto" }}
          >
            <div className="flex justify-between">
              <h2 className="text-gray-800 dark:text-gray-100 text-xl font-bold mb-4">
                Leaderboard
              </h2>
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
                style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.6)" }} // Simplified shadow
              ></div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
                >
                  <div className="flex items-center space-x-1">
                    <div className="min-w-[24px] text-center font-medium">
                      #{index + 1}
                    </div>
                    <img
                      src={
                        player?.userId?.profilePicture ||
                        `https://api.dicebear.com/9.x/shapes/svg?seed=${player?.userId?.username}`
                      }
                      alt={`${player?.userId?.username}'s profile`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm md:text-base">
                      @{player?.userId?.username}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{player.highScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TwentyFortyEight;
