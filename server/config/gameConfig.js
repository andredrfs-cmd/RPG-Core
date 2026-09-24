const LOGICAL_CELL_SIZE = 16;
const RENDERED_TILE_SIZE = 32;
const PLAYER_SIZE = 24;
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
  LOGICAL_CELL_SIZE,
  RENDERED_TILE_SIZE,
  PLAYER_SIZE,
  TICK_RATE,
  TICK_INTERVAL,
  PORT,
  HOST,
  COLORS,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_PATTERN,
  DEFAULT_PLAYER_STATS
};
