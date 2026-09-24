const { PLAYER_SIZE } = require('../../config/gameConfig');
const { getRegionWorld } = require('../../world/proceduralWorld');

function getCellIdAt(world, column, row) {
  return world.cellsByKey?.get(`${column},${row}`) || 'debug';
}

function isWalkableCell(world, column, row) {
  const cellId = getCellIdAt(world, column, row);
  return cellId === 'grass' || cellId === 'stone';
}

function isWalkableAt(x, y, world, playerSize = PLAYER_SIZE) {
  const half = playerSize / 2;
  const tileSize = world.renderedTileSize || world.tileSize;
  if (x + half < 0 || y + half < 0 || x - half > world.width || y - half > world.height) return false;

  const firstColumn = Math.floor(Math.max(0, x - half) / tileSize);
  const lastColumn = Math.min(world.columns - 1, Math.floor(Math.min(world.width - Number.EPSILON, x + half) / tileSize));
  const firstRow = Math.floor(Math.max(0, y - half) / tileSize);
  const lastRow = Math.min(world.rows - 1, Math.floor(Math.min(world.height - Number.EPSILON, y + half) / tileSize));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (!isWalkableCell(world, column, row)) return false;
    }
  }
  return true;
}

function tryMove(player, deltaX, deltaY, regionWorld, playerSize = PLAYER_SIZE) {
  const nextX = player.x + deltaX;
  const nextY = player.y + deltaY;
  if (isWalkableAt(nextX, player.y, regionWorld, playerSize)) player.x = nextX;
  if (isWalkableAt(player.x, nextY, regionWorld, playerSize)) player.y = nextY;
}

module.exports = { getCellIdAt, isWalkableCell, isWalkableAt, tryMove };
