const { computeDirection } = require('../rules/movement/movementRule');
const { tryMove } = require('../rules/collision/movementCollisionRule');
const { getRegionWorld } = require('../world/proceduralWorld');
const { createWorldLocation } = require('../coordinates/worldCoordinates');

function syncPlayerLocation(player, regionWorld) {
  const tileSize = regionWorld.renderedTileSize || regionWorld.tileSize;
  const cellX = Math.max(0, Math.min(regionWorld.columns - 1, Math.floor(player.x / tileSize)));
  const cellZ = Math.max(0, Math.min(regionWorld.rows - 1, Math.floor(player.y / tileSize)));
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
  const regionWorld = getRegionWorld(world, regionX, player.location.region.y, regionZ);
  let changed = false;

  if (player.x < 0) { player.x += regionWorld.width; regionX -= 1; changed = true; }
  if (player.x >= regionWorld.width) { player.x -= regionWorld.width; regionX += 1; changed = true; }
  if (player.y < 0) { player.y += regionWorld.height; regionZ -= 1; changed = true; }
  if (player.y >= regionWorld.height) { player.y -= regionWorld.height; regionZ += 1; changed = true; }

  const nextRegion = getRegionWorld(world, regionX, player.location.region.y, regionZ);
  syncPlayerLocation(player, nextRegion);
  return { regionWorld: nextRegion, changed };
}

function updatePlayerMovement(player, world) {
  if (!player.ready) return;
  const { horizontal, vertical, isMoving, direction } = computeDirection(player.inputs);
  player.isMoving = isMoving;
  let regionWorld = getRegionWorld(world, player.location.region.x, player.location.region.y, player.location.region.z);
  if (isMoving) {
    const length = Math.hypot(horizontal, vertical) || 1;
    tryMove(player, (horizontal / length) * player.stats.speed, (vertical / length) * player.stats.speed, regionWorld);
    player.direction = direction;
  }
  transitionRegion(world, player);
}

module.exports = { updatePlayerMovement, syncPlayerLocation, transitionRegion };
