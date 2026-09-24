const { PLAYER_SIZE, WORLD: DEFAULT_WORLD } = require('../../config/gameConfig');

function getCellIdAt(world, column, row) {
  return world.cellsByKey?.get(`${column},${row}`) || 'debug';
}

function isWalkableCell(world, column, row) {
  const cellId = getCellIdAt(world, column, row);
  return cellId === 'grass' || cellId === 'stone';
}

function isWalkableAt(x, y, world = DEFAULT_WORLD, playerSize = PLAYER_SIZE) {
  const half = playerSize / 2;
  const tileSize = world.renderedTileSize || world.tileSize;
  const minX = x - half;
  const maxX = x + half;
  const minY = y - half;
  const maxY = y + half;

  if (maxY < 0 || minY > world.height || maxX < 0 || minX > world.width) return false;

  const firstColumn = Math.max(0, Math.floor(minX / tileSize));
  const lastColumn = Math.min(world.columns - 1, Math.floor((maxX - Number.EPSILON) / tileSize));
  const firstRow = Math.max(0, Math.floor(minY / tileSize));
  const lastRow = Math.min(world.rows - 1, Math.floor((maxY - Number.EPSILON) / tileSize));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (!isWalkableCell(world, column, row)) return false;
    }
  }

  return true;
}

function tryMove(player, deltaX, deltaY, world = DEFAULT_WORLD, playerSize = PLAYER_SIZE) {
  const nextX = player.x + deltaX;
  const nextY = player.y + deltaY;
  if (isWalkableAt(nextX, player.y, world, playerSize)) player.x = nextX;
  if (isWalkableAt(player.x, nextY, world, playerSize)) player.y = nextY;
}

module.exports = { getCellIdAt, isWalkableCell, isWalkableAt, tryMove };
