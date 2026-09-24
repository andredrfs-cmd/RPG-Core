const { PLAYER_SIZE, WORLD } = require('../../config/gameConfig');

function getCellIdAt(world, column, row) {
  return world.cellsByKey?.get(`${column},${row}`) || 'debug';
}

function isWalkableCell(world, column, row) {
  const cellId = getCellIdAt(world, column, row);
  return cellId === 'grass' || cellId === 'stone';
}

function isWalkableAt(x, y, world = WORLD, playerSize = PLAYER_SIZE) {
  const half = playerSize / 2;
  const minX = x - half;
  const maxX = x + half;
  const minY = y - half;
  const maxY = y + half;
  const tileSize = world.renderedTileSize || world.tileSize;

  if (minX < 0 || minY < 0 || maxX > world.width || maxY > world.height) return false;

  const firstColumn = Math.floor(minX / tileSize);
  const lastColumn = Math.floor(maxX / tileSize);
  const firstRow = Math.floor(minY / tileSize);
  const lastRow = Math.floor(maxY / tileSize);

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (!isWalkableCell(world, column, row)) return false;
    }
  }

  return true;
}

function tryMove(player, deltaX, deltaY, world = WORLD, playerSize = PLAYER_SIZE) {
  const nextX = player.x + deltaX;
  const nextY = player.y + deltaY;

  if (isWalkableAt(nextX, player.y, world, playerSize)) player.x = nextX;
  if (isWalkableAt(player.x, nextY, world, playerSize)) player.y = nextY;
}

module.exports = {
  getCellIdAt,
  isWalkableCell,
  isWalkableAt,
  tryMove
};
