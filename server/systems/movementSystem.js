const { computeDirection } = require('../rules/movement/movementRule');
const { tryMove } = require('../rules/collision/movementCollisionRule');
const { getRegionWorld } = require('../world/proceduralWorld');
const { createWorldLocation } = require('../coordinates/worldCoordinates');

function syncPlayerLocation(player, regionWorld) {
  const size = regionWorld.renderedTileSize || regionWorld.tileSize;
  const cellX = Math.max(0, Math.min(regionWorld.columns - 1, Math.floor(player.x / size)));
  const cellZ = Math.max(0, Math.min(regionWorld.rows - 1, Math.floor(player.y / size)));
  player.location = createWorldLocation({
    worldId: regionWorld.id,
    layerId: regionWorld.layerId,
    region: regionWorld.region,
    chunk: { x: Math.floor(cellX / regionWorld.chunkCellSize), z: Math.floor(cellZ / regionWorld.chunkCellSize) },
    position: { x: cellX % regionWorld.chunkCellSize, y: 0, z: cellZ % regionWorld.chunkCellSize }
  });
}

function transitionRegion(world, player) {
  let regionX = player.location.region.x;
  let regionZ = player.location.region.z;
  const current = getRegionWorld(world, regionX, player.location.region.y, regionZ);

  if (player.x < 0) { player.x += current.width; regionX -= 1; }
  if (player.x >= current.width) { player.x -= current.width; regionX += 1; }
  if (player.y < 0) { player.y += current.height; regionZ -= 1; }
  if (player.y >= current.height) { player.y -= current.height; regionZ += 1; }

  const next = getRegionWorld(world, regionX, player.location.region.y, regionZ);
  syncPlayerLocation(player, next);
  return next;
}

function updatePlayerMovement(player, world) {
  if (!player.ready) return;
  const { horizontal, vertical, isMoving, direction } = computeDirection(player.inputs);
  player.isMoving = isMoving;
  const regionWorld = getRegionWorld(world, player.location.region.x, player.location.region.y, player.location.region.z);

  if (isMoving) {
    const length = Math.hypot(horizontal, vertical) || 1;
    tryMove(player, (horizontal / length) * player.stats.speed, (vertical / length) * player.stats.speed, regionWorld);
    player.direction = direction;
  }

  transitionRegion(world, player);
}

module.exports = { updatePlayerMovement, syncPlayerLocation, transitionRegion };
