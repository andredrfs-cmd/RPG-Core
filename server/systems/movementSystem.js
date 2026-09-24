const { computeDirection } = require('../rules/movement/movementRule');
const { tryMove } = require('../rules/collision/movementCollisionRule');
const {
  createWorldLocation,
  getRegionCoordinates,
  getRegionChunkCoordinates,
  getCellCoordinates
} = require('../coordinates/worldCoordinates');

function syncLocationWithWorldPosition(player, world) {
  const cellSize = world.renderedTileSize || world.tileSize;
  const globalCellX = Math.floor(player.x / cellSize);
  const globalCellZ = Math.floor(player.y / cellSize);
  const regionY = player.location?.region?.y || 0;
  const region = getRegionCoordinates(globalCellX, globalCellZ, regionY);
  const chunk = getRegionChunkCoordinates(globalCellX, globalCellZ);
  const position = getCellCoordinates(globalCellX, globalCellZ);

  player.location = createWorldLocation({
    worldId: player.location?.worldId || 'overworld',
    layerId: player.location?.layerId || 'surface',
    region,
    chunk,
    position: {
      x: position.x,
      y: player.location?.position?.y || 0,
      z: position.z
    }
  });
}

function updatePlayerMovement(player, world) {
  if (!player.ready) return;

  const { horizontal, vertical, isMoving, direction } = computeDirection(player.inputs);

  player.isMoving = isMoving;

  if (!isMoving) {
    syncLocationWithWorldPosition(player, world);
    return;
  }

  const length = Math.hypot(horizontal, vertical) || 1;
  const deltaX = (horizontal / length) * player.stats.speed;
  const deltaY = (vertical / length) * player.stats.speed;

  tryMove(player, deltaX, deltaY, world);
  syncLocationWithWorldPosition(player, world);
  player.direction = direction;
}

module.exports = {
  updatePlayerMovement,
  syncLocationWithWorldPosition
};
