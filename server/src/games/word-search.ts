import crypto from "crypto";

export interface Player {
  id: string;
  socketId: string;
  username: string;
  color: string;
  isGuest: boolean;
  score: number;
  cursor: { row: number; col: number } | null;
}

export interface FoundWord {
  word: string;
  playerId: string;
  playerName: string;
  color: string;
  cells: [number, number][];
}

export interface WordSearchState {
  id: string;
  grid: string[][];
  size: number;
  words: string[];
  foundWords: FoundWord[];
  players: Map<string, Player>;
  status: "waiting" | "playing" | "finished";
  createdBy: string;
}

const PLAYER_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

const WORD_LISTS: Record<string, string[]> = {
  animales: ["GATO", "PERRO", "LEON", "TIGRE", "OSO", "LOBO", "PUMA", "RATA", "PATO", "BUHO", "ZORRO", "VACA"],
  frutas: ["MANGO", "PERA", "FRESA", "LIMON", "MELON", "KIWI", "UVA", "COCO", "PIÑA", "MORA", "HIGO", "DURAZNO"],
  tecnologia: ["JAVA", "HTML", "REACT", "NODE", "CODE", "DATA", "LINUX", "RUBY", "RUST", "SWIFT", "GIT", "API"],
};

type Direction = [number, number];

const DIRECTIONS: Direction[] = [
  [0, 1],   // horizontal →
  [1, 0],   // vertical ↓
  [1, 1],   // diagonal ↘
  [-1, 1],  // diagonal ↗
  [0, -1],  // horizontal ←
  [-1, 0],  // vertical ↑
  [-1, -1], // diagonal ↖
  [1, -1],  // diagonal ↙
];

// Map to store all active rooms
export const rooms = new Map<string, WordSearchState>();

export function createRoom(creatorId: string): WordSearchState {
  const id = crypto.randomBytes(4).toString("hex");
  const size = 12;
  const categories = Object.keys(WORD_LISTS);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const allWords = [...WORD_LISTS[category]];

  // Shuffle and pick 6-8 words
  allWords.sort(() => Math.random() - 0.5);
  const words = allWords.slice(0, 7);

  const grid = generateGrid(size, words);

  const room: WordSearchState = {
    id,
    grid,
    size,
    words,
    foundWords: [],
    players: new Map(),
    status: "waiting",
    createdBy: creatorId,
  };

  rooms.set(id, room);
  return room;
}

function generateGrid(size: number, words: string[]): string[][] {
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );

  for (const word of words) {
    placeWord(grid, size, word);
  }

  // Fill empty cells with random letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return grid;
}

function placeWord(grid: string[][], size: number, word: string): boolean {
  const shuffledDirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);

  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = shuffledDirs[attempt % shuffledDirs.length];
    const startRow = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * size);

    if (canPlace(grid, size, word, startRow, startCol, dir)) {
      for (let i = 0; i < word.length; i++) {
        grid[startRow + dir[0] * i][startCol + dir[1] * i] = word[i];
      }
      return true;
    }
  }
  return false;
}

function canPlace(
  grid: string[][],
  size: number,
  word: string,
  row: number,
  col: number,
  dir: Direction
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }
  return true;
}

export function addPlayer(
  room: WordSearchState,
  socketId: string,
  userId: string,
  username: string,
  isGuest: boolean
): Player {
  const colorIndex = room.players.size % PLAYER_COLORS.length;
  const player: Player = {
    id: userId,
    socketId,
    username,
    color: PLAYER_COLORS[colorIndex],
    isGuest,
    score: 0,
    cursor: null,
  };
  room.players.set(socketId, player);
  return player;
}

export function removePlayer(room: WordSearchState, socketId: string): void {
  room.players.delete(socketId);
}

export function checkWord(
  room: WordSearchState,
  cells: [number, number][]
): string | null {
  // Extract letters from selected cells
  const letters = cells.map(([r, c]) => room.grid[r][c]).join("");
  const reversed = [...letters].reverse().join("");

  // Check if it matches any unfound word
  for (const word of room.words) {
    if (letters === word || reversed === word) {
      // Check not already found
      if (!room.foundWords.find((f) => f.word === word)) {
        return word;
      }
    }
  }
  return null;
}

export function serializeRoom(room: WordSearchState) {
  return {
    id: room.id,
    grid: room.grid,
    size: room.size,
    words: room.words,
    foundWords: room.foundWords,
    players: Array.from(room.players.values()),
    status: room.status,
    createdBy: room.createdBy,
  };
}
