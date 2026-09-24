const { TILE_SIZE, PLAYER_SIZE, WORLD } = require('../../config/gameConfig');

function isWalkableAt(x, y, world = WORLD, playerSize = PLAYER_SIZE) {
  const half = playerSize / 2;
  return (
    x - half >= TILE_SIZE &&
    x + half <= world.width - TILE_SIZE &&
    y - half >= TILE_SIZE &&
    y + half <= world.height - TILE_SIZE
  );
}

function tryMove(player, deltaX, deltaY, world = WORLD, playerSize = PLAYER_SIZE) {
  const nextX = player.x + deltaX;
  const nextY = player.y + deltaY;

  if (isWalkableAt(nextX, player.y, world, playerSize)) {
    player.x = nextX;
  }

  if (isWalkableAt(player.x, nextY, world, playerSize)) {
    player.y = nextY;
  }
}

module.exports = {
  isWalkableAt,
  tryMove
};
