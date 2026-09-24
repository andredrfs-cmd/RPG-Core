const {
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
} = require('../config/worldConfig');

function assertInteger(value, name) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} precisa ser um número inteiro.`);
  }
}

function createRegion(x = 0, y = 0, z = 0) {
  assertInteger(x, 'region.x');
  assertInteger(y, 'region.y');
  assertInteger(z, 'region.z');
  return { x, y, z };
}

function createChunk(x = 0, z = 0) {
  assertInteger(x, 'chunk.x');
  assertInteger(z, 'chunk.z');
  return { x, z };
}

function createPosition(x = 0, y = 0, z = 0) {
  if (![x, y, z].every(Number.isFinite)) {
    throw new TypeError('position deve conter apenas números finitos.');
  }
  return { x, y, z };
}

function createWorldLocation({
  worldId = 'overworld',
  layerId = 'surface',
  region = createRegion(),
  chunk = createChunk(),
  position = createPosition()
} = {}) {
  if (!worldId || !layerId) {
    throw new TypeError('worldId e layerId são obrigatórios.');
  }

  return {
    worldId,
    layerId,
    region: createRegion(region.x, region.y, region.z),
    chunk: createChunk(chunk.x, chunk.z),
    position: createPosition(position.x, position.y, position.z)
  };
}

function getChunkCoordinates(cellX, cellZ) {
  assertInteger(cellX, 'cellX');
  assertInteger(cellZ, 'cellZ');

  return {
    x: Math.floor(cellX / CHUNK_CELL_SIZE),
    z: Math.floor(cellZ / CHUNK_CELL_SIZE)
  };
}

function getRegionCoordinates(cellX, cellZ, regionY = 0) {
  assertInteger(cellX, 'cellX');
  assertInteger(cellZ, 'cellZ');
  assertInteger(regionY, 'regionY');

  return {
    x: Math.floor(cellX / REGION_CELL_SIZE),
    y: regionY,
    z: Math.floor(cellZ / REGION_CELL_SIZE)
  };
}

function getCellCoordinates(cellX, cellZ) {
  assertInteger(cellX, 'cellX');
  assertInteger(cellZ, 'cellZ');

  return {
    x: ((cellX % CHUNK_CELL_SIZE) + CHUNK_CELL_SIZE) % CHUNK_CELL_SIZE,
    z: ((cellZ % CHUNK_CELL_SIZE) + CHUNK_CELL_SIZE) % CHUNK_CELL_SIZE
  };
}

function getRegionChunkCoordinates(cellX, cellZ) {
  const chunk = getChunkCoordinates(cellX, cellZ);

  return {
    x: ((chunk.x % REGION_CHUNK_SIZE) + REGION_CHUNK_SIZE) % REGION_CHUNK_SIZE,
    z: ((chunk.z % REGION_CHUNK_SIZE) + REGION_CHUNK_SIZE) % REGION_CHUNK_SIZE
  };
}

function getGlobalCellCoordinates(location) {
  const { region, chunk, position } = createWorldLocation(location);

  return {
    x: (region.x * REGION_CELL_SIZE) + (chunk.x * CHUNK_CELL_SIZE) + position.x,
    y: position.y,
    z: (region.z * REGION_CELL_SIZE) + (chunk.z * CHUNK_CELL_SIZE) + position.z
  };
}

function sameWorldSpace(first, second) {
  return first.worldId === second.worldId && first.layerId === second.layerId;
}

module.exports = {
  createRegion,
  createChunk,
  createPosition,
  createWorldLocation,
  getChunkCoordinates,
  getRegionCoordinates,
  getCellCoordinates,
  getRegionChunkCoordinates,
  getGlobalCellCoordinates,
  sameWorldSpace
};
