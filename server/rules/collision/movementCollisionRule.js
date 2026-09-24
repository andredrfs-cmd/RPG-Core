const { PLAYER_SIZE } = require('../../config/gameConfig');

function isWalkableAt(x, y, regionWorld, playerSize = PLAYER_SIZE) {
  const half = playerSize / 2;
  const tileSize = regionWorld.renderedTileSize || regionWorld.tileSize;

  if (x + half < 0 || y + half < 0 || x - half > regionWorld.width || y - half > regionWorld.height) return true;

  const firstColumn = Math.max(0, Math.floor((x - half) / tileSize));
  const lastColumn = Math.min(regionWorld.columns - 1, Math.floor((x + half - Number.EPSILON) / tileSize));
  const firstRow = Math.max(0, Math.floor((y - half) / tileSize));
  const lastRow = Math.min(regionWorld.rows - 1, Math.floor((y + half - Number.EPSILON) / tileSize));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const cellId = regionWorld.cellsByKey?.get(`${column},${row}`);
      if (cellId !== 'grass' && cellId !== 'stone') return false;
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

module.exports = { isWalkableAt, tryMove };
