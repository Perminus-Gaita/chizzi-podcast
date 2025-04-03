"use client";

import { useEffect, useState, useRef } from "react";

import "../../styles/2048.css";

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

const ScoreBoard = ({ score, bestScore }) => {
  const scoreStyle = {
    backgroundColor: '#bbada0',
    padding: '5px 10px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '3px',
    color: '#eee4da',
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '40px',
    textAlign: 'center',
    margin: '0 4px',
  };
  
  const labelStyle = {
    position: 'absolute',
    top: '5px',
    left: '0',
    right: '0',
    textTransform: 'uppercase',
    fontSize: '11px',
    lineHeight: '13px',
    textAlign: 'center',
    color: '#eee4da',
  };
  
  const valueStyle = {
    marginTop: '15px',
    fontSize: '16px',
  };

  return (
    <div className="flex justify-between w-full">
      <div style={scoreStyle}>
        <div style={labelStyle}>Score</div>
        <div style={valueStyle}>{score}</div>
      </div>
      <div style={scoreStyle}>
        <div style={labelStyle}>Best</div>
        <div style={valueStyle}>{bestScore}</div>
      </div>
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

const KIBE_IMAGES = [
  { value: 2, img: "/kibe/2.png" },
  { value: 4, img: "/kibe/4.png" },
  { value: 8, img: "/kibe/8.png" },
  { value: 16, img: "/kibe/16.png" },
  { value: 32, img: "/kibe/32.png" },
  { value: 64, img: "/kibe/64.png" },
  // ... up to 2048
];

const TileComponent = ({ tile }) => {
  const [position, setPosition] = useState(tile);
  const [merged, setMerged] = useState(false);
  const [newTile, setNewTile] = useState(false);
  const currentStage = KIBE_IMAGES.find((s) => s.value === tile.value);

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

  // Adjusted for the smaller size to match the design
  const getTransform = () => {
    // Precise positioning calculation - each tile position is 59px from the previous
    const x = position.x * 59;
    const y = position.y * 59;
    return `translate(${x}px, ${y}px)`;
  };

  const style = {
    transform: getTransform(),
    width: '52px',
    height: '52px',
    position: 'absolute',
    transition: '100ms ease-in-out',
  };

  const innerStyle = {
    width: '52px',
    height: '52px',
    lineHeight: '52px',
    borderRadius: '3px',
    backgroundColor: getTileColor(position.value),
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 10,
    fontSize: '24px',
    color: position.value > 4 ? '#f9f6f2' : '#776e65',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  return (
    <div style={style} className={`${merged ? 'tile-merged' : ''} ${newTile ? 'tile-new' : ''}`}>
      <div style={innerStyle}>
        {currentStage?.img ? (
          <img
            src={currentStage.img}
            alt={`${position.value}`}
            style={imageStyle}
          />
        ) : (
          position.value
        )}
      </div>
    </div>
  );
};

// Helper function to determine tile color based on value
function getTileColor(value) {
  const colors = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  return colors[value] || '#3c3a32'; // Default color for super tiles
}

const GameGrid = ({ grid, gameState, handleRestart }) => {
  return (
    <div className="game-container" style={{ width: '242px', height: '250px', background: '#cdc1b4', borderRadius: '5px', padding: '7px', position: 'relative' }}>
      <div className="grid-container" style={{ position: 'absolute', zIndex: 1 }}>
        {[...Array(4)].map((_, x) => (
          <div key={x} className="grid-row" style={{ marginBottom: '7px', display: 'flex' }}>
            {[...Array(4)].map((_, y) => (
              <div key={`${x}-${y}`} className="grid-cell" style={{ 
                width: '52px', 
                height: '52px', 
                marginRight: y < 3 ? '7px' : 0, 
                background: 'rgba(238, 228, 218, 0.35)', 
                borderRadius: '3px',
                display: 'inline-block'
              }} />
            ))}
          </div>
        ))}
      </div>
      <div className="tile-container" style={{ position: 'absolute', zIndex: 2 }}>
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
  <div style={{
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: won ? 'rgba(237, 194, 46, 0.5)' : 'rgba(238, 228, 218, 0.5)',
    zIndex: 100,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'fade-in 800ms ease 200ms both'
  }}>
    <p style={{ 
      fontSize: '24px', 
      fontWeight: 'bold',
      color: won ? '#f9f6f2' : '#776e65',
      marginBottom: '15px'
    }}>
      {won ? "You win!" : "Game over!"}
    </p>
    <div style={{ marginTop: '15px' }}>
      {!won && (
        <a 
          className="cursor-pointer" 
          onClick={handleRestart}
          style={{
            display: 'inline-block',
            background: '#8f7a66',
            borderRadius: '3px',
            padding: '0 10px',
            textDecoration: 'none',
            color: '#f9f6f2',
            height: '30px',
            lineHeight: '30px',
            fontSize: '13px'
          }}
        >
          Try again
        </a>
      )}
      {won && (
        <a 
          className="cursor-pointer"
          style={{
            display: 'inline-block',
            background: '#8f7a66',
            borderRadius: '3px',
            padding: '0 10px',
            textDecoration: 'none',
            color: '#f9f6f2',
            height: '30px',
            lineHeight: '30px',
            fontSize: '13px'
          }}
        >
          Keep going
        </a>
      )}
    </div>
  </div>
);

const TwentyFortyEight = () => {
  const gameManagerRef = useRef(null);

  const [grid, setGrid] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState({ over: false, won: false });

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

  return (
    <div className="flex justify-center my-8">
      <div className="w-[265px] bg-[#bbada0] rounded-md p-3"> {/* Original game background */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-[#776e65]">2048</h2> {/* Original text color */}
          <div className="bg-[#eee4da] rounded p-1 text-center"> {/* Original score background */}
            <div className="text-xs text-[#776e65]">SCORE</div>
            <div className="font-bold text-[#776e65]">{score}</div>
          </div>
        </div>
        
        <GameGrid
          grid={grid}
          gameState={gameState}
          handleRestart={handleRestart}
        />
        
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={handleRestart}
            className="bg-[#8f7a66] text-white text-xs px-2 py-1 rounded"
          >
            New Game
          </button>
          <div className="text-xs text-[#776e65]">
            Best: <span className="font-bold">{bestScore}</span>
          </div>
        </div>
        
        <p className="text-xs text-[#776e65] mt-2 text-center">
          Join the <strong>fukiswis</strong> until you get <strong>Nganuthia!</strong>
        </p>
      </div>
    </div>
  );
};

export default TwentyFortyEight;