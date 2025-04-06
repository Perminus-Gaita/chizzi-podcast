"use client";

import { useEffect, useState, useRef } from "react";
import "../../styles/2048.css";

// Game Manager class handles game logic
class GameManager {
  constructor(size, setGrid, setScore, setBestScore, setGameState) {
    this.size = size;
    this.setGrid = setGrid;
    this.setScore = setScore;
    this.setBestScore = setBestScore;
    this.setGameState = setGameState;

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
    this.keepPlaying = false;
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
            this.score += merged.value;

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

// Local Storage Manager for saving and retrieving game state
class LocalStorageManager {
  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";
    this.storage = this.localStorageSupported()
      ? window.localStorage
      : this.fakeStorage();
  }

  localStorageSupported() {
    try {
      const testKey = "test";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  fakeStorage() {
    return {
      _data: {},
      setItem: function (id, val) {
        return (this._data[id] = String(val));
      },
      getItem: function (id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
      },
      removeItem: function (id) {
        return delete this._data[id];
      },
      clear: function () {
        return (this._data = {});
      },
    };
  }

  getBestScore() {
    return Number(this.storage.getItem(this.bestScoreKey)) || 0;
  }

  setBestScore(score) {
    this.storage.setItem(this.bestScoreKey, score);
  }

  getGameState() {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  setGameState(gameState) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  clearGameState() {
    this.storage.removeItem(this.gameStateKey);
  }
}

// Keyboard Input Manager for handling user interactions
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
    this.bindButtonPress(".new-game", () => this.emit("restart"));
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

// Grid class for managing the game grid
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

// Tile class for managing individual tiles
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

// Define the Kibe images for each tile value
const KIBE_IMAGES = {
  2: "/kibe/2.png",
  4: "/kibe/4.png",
  8: "/kibe/8.png",
  16: "/kibe/16.png",
  32: "/kibe/32.png",
  64: "/kibe/64.png",
  128: "/kibe/128.png",
  256: "/kibe/256.png",
  512: "/kibe/512.png",
  1024: "/kibe/1024.png",
  2048: "/kibe/2048.png",
};

// Tile Component - renders individual tiles
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

  // Calculate the position
  const getTransform = () => {
    const x = position.x * 59;
    const y = position.y * 59;
    return `translate(${x}px, ${y}px)`;
  };

  // Determine if we have a Kibe image for this tile
  const hasKibeImage = KIBE_IMAGES[position.value];

  return (
    <div 
      className={`tile tile-${position.value} ${merged ? 'tile-merged' : ''} ${newTile ? 'tile-new' : ''}`} 
      style={{ transform: getTransform() }}
    >
      <div className="tile-inner">
        {hasKibeImage ? (
          <img 
            src={KIBE_IMAGES[position.value]} 
            alt={`Tile ${position.value}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        ) : (
          position.value
        )}
      </div>
    </div>
  );
};

// Sponsor Avatar Component
const SponsorAvatar = ({ avatar, onClick }) => {
  return (
    <div className="sponsor-avatar" onClick={onClick} style={{
      backgroundImage: `url(${avatar})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
    </div>
  );
};

// Game Grid Component
const GameGrid = ({ grid, gameState, handleRestart, handleKeepPlaying }) => {
  return (
    <div className="game-container">
      <div className="grid-container">
        {[...Array(4)].map((_, x) => (
          <div key={x} className="grid-row">
            {[...Array(4)].map((_, y) => (
              <div key={`${x}-${y}`} className="grid-cell"></div>
            ))}
          </div>
        ))}
      </div>

      <div className="tile-container">
        {grid?.cells
          .flat()
          .filter(Boolean)
          .map((tile) => (
            <TileComponent key={`${tile.x}-${tile.y}`} tile={tile} />
          ))}
      </div>

      {gameState.over && (
        <div className={`game-message ${gameState.won ? 'game-won' : ''}`}>
          <p className="message-text">
            {gameState.won ? "You found the Sayantist!" : "Game over!"}
          </p>
          <div>
            {!gameState.won && (
              <button
                className="message-button"
                onClick={handleRestart}
              >
                Try again
              </button>
            )}
            {gameState.won && (
              <>
                <button
                  className="message-button keep-playing-button"
                  onClick={handleKeepPlaying}
                  style={{ marginRight: '8px' }}
                >
                  Keep going
                </button>
                <button
                  className="message-button"
                  onClick={handleRestart}
                >
                  New game
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sponsors Modal Component
const SponsorsModal = ({ isOpen, onClose }) => {
  const sponsors = [
    { avatar: "https://randomuser.me/api/portraits/men/83.jpg", name: "Bry Tea", username: "@Bry_T", amount: "$400" },
    { avatar: "https://randomuser.me/api/portraits/women/79.jpg", name: "Tyler King", username: "@tylerking", amount: "$350" },
    { avatar: "https://randomuser.me/api/portraits/men/51.jpg", name: "Amanda Zhao", username: "@amandalovesai", amount: "$225" },
    { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "Robert Lee", username: "@roblee89", amount: "$175" }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal modal-shown" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">Game Sponsors</div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="sponsors-list">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="sponsor-card">
              <div className="sponsor-avatar-lg" style={{
                backgroundImage: `url(${sponsor.avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="sponsor-info">
                <div className="sponsor-name">{sponsor.name}</div>
                <div className="sponsor-username">{sponsor.username}</div>
              </div>
              <div className="sponsor-amount">{sponsor.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Game Component
const FindTheSayantist = () => {
  const gameManagerRef = useRef(null);
  const [grid, setGrid] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState({ over: false, won: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sponsor avatars
  const sponsors = [
    { avatar: "https://randomuser.me/api/portraits/men/83.jpg", name: "Bry Tea" },
    { avatar: "https://randomuser.me/api/portraits/women/79.jpg", name: "Tyler King" },
    { avatar: "https://randomuser.me/api/portraits/men/51.jpg", name: "Amanda Zhao" },
    { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "Robert Lee" }
  ];

  useEffect(() => {
    const gameManager = new GameManager(
      4,
      setGrid,
      setScore,
      setBestScore,
      setGameState
    );
    gameManagerRef.current = gameManager;
    return () => gameManager.cleanup();
  }, []);

  const handleRestart = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.restart();
    }
  };

  const handleKeepPlaying = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.handleKeepPlaying();
    }
  };

  return (
    <div className="game-wrapper">
      {/* Header with title and score */}
      <div className="header">
        <h2 className="title">Find the Sayantist</h2>
        <div className="score-box">
          <div className="score-label">SCORE</div>
          <div className="score-value">{score}</div>
        </div>
      </div>

      {/* Sponsors section */}
      <div className="sponsors-section">
        <div className="sponsors-part">
          <div className="sponsors-text">Sponsored by:</div>
          <div className="sponsors-avatars">
            {sponsors.map((sponsor, index) => (
              <SponsorAvatar 
                key={index} 
                avatar={sponsor.avatar} 
                onClick={() => setIsModalOpen(true)} 
              />
            ))}
          </div>
        </div>
        <div className="sponsors-total">$1,150</div>
      </div>

      {/* Game prize info */}
      <p className="game-prize">
        <span className="game-prize-title">Winner gets</span>
        one <strong>ticket 🎟️</strong> to watch <strong>RAW N UNKUT 4</strong> online
      </p>

      {/* Game grid */}
      <GameGrid
        grid={grid}
        gameState={gameState}
        handleRestart={handleRestart}
        handleKeepPlaying={handleKeepPlaying}
      />

      {/* Footer */}
      <div className="footer">
        <button className="new-game" onClick={handleRestart}>New Game</button>
        <div className="best-score">
          Best: <span className="best-value">{bestScore}</span>
        </div>
      </div>

      {/* Game instruction */}
      <p className="game-instruction">
        Combine the <strong>species</strong> until you get <strong>The Sayantist!</strong>
      </p>

      {/* Sponsors Modal */}
      <SponsorsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FindTheSayantist;