const TILE_SIZE = 40;
const MAP_COLUMNS = 30;
const MAP_ROWS = 22;

const WORLD = {
  width: MAP_COLUMNS * TILE_SIZE,
  height: MAP_ROWS * TILE_SIZE,
  tileSize: TILE_SIZE,
  columns: MAP_COLUMNS,
  rows: MAP_ROWS
};

const PLAYER_SIZE = 30;
const TICK_RATE = 20;
const TICK_INTERVAL = 1000 / TICK_RATE;
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
const COLORS = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff'];
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 16;
const NAME_PATTERN = /^[\p{L}\p{N}_ -]+$/u;

const DEFAULT_PLAYER_STATS = {
  speed: 5,
  hp: 100,
  maxHp: 100,
  attack: 10,
  armor: 0
};

module.exports = {
  PORT,
  HOST,
  WORLD,
  TILE_SIZE,
  MAP_COLUMNS,
  MAP_ROWS,
  PLAYER_SIZE,
  TICK_RATE,
  TICK_INTERVAL,
  COLORS,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_PATTERN,
  DEFAULT_PLAYER_STATS
};
