const { getRegionWorld } = require('./proceduralWorld');

function regionMatches(first, second) {
  return first?.x === second?.x && first?.y === second?.y && first?.z === second?.z;
}

function getRegion(world, location) {
  return getRegionWorld(world, location.region.x, location.region.y, location.region.z);
}

function getCell(world, location) {
  const region = getRegion(world, location);
  const key = `${location.chunk.x * region.chunkCellSize + location.position.x},${location.chunk.z * region.chunkCellSize + location.position.z}`;
  return region.cellsByKey.get(key) || 'debug';
}

function isWalkable(world, location) {
  const cellId = getCell(world, location);
  return cellId === 'grass' || cellId === 'stone';
}

module.exports = { regionMatches, getRegion, getCell, isWalkable };
