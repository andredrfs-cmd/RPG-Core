const {
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
} = require('../config/worldConfig');
const { getCell } = require('../cells/cellRegistry');

const REGION_SEED = 18473;
const GRASS_CHANCE = 0.8;
const RENDERED_TILE_SIZE = 32;
const VIEW_DISTANCE_CELLS = 16;
const POND_MIN_SIZE = 2;
const POND_MAX_SIZE = 4;
const POND_MIN_DISTANCE = 5;
const POND_COUNT = 6;

function hashCell(seed, x, z) {
  let value = seed;
  value = Math.imul(value ^ Math.imul(x, 374761393), 668265263);
  value = Math.imul(value ^ Math.imul(z, 1274126177), 2246822519);
  value = Math.imul(value ^ (value >>> 13), 3266489917);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

function cellKey(x, z) { return `${x},${z}`; }
function regionKey(x, y, z) { return `${x},${y},${z}`; }

function randomInt(seed, min, max) {
  return min + Math.floor(hashCell(seed, min, max) * (max - min + 1));
}

function distanceBetweenPonds(first, second) {
  const gapX = Math.max(second.x - (first.x + first.width), first.x - (second.x + second.width), 0);
  const gapZ = Math.max(second.z - (first.z + first.height), first.z - (second.z + second.height), 0);
  return Math.max(gapX, gapZ);
}

function createPonds(seed) {
  const ponds = [];
  const margin = 2;
  const maxOrigin = REGION_CELL_SIZE - POND_MAX_SIZE - margin;

  // A bounded number of attempts prevents generation from consuming the server.
  for (let index = 0; index < POND_COUNT * 8 && ponds.length < POND_COUNT; index += 1) {
    const pond = {
      x: margin + Math.floor(hashCell(seed + index * 17, index, 11) * (maxOrigin - margin + 1)),
      z: margin + Math.floor(hashCell(seed + index * 31, index, 29) * (maxOrigin - margin + 1)),
      width: POND_MIN_SIZE + Math.floor(hashCell(seed + index * 47, index, 53) * (POND_MAX_SIZE - POND_MIN_SIZE + 1)),
      height: POND_MIN_SIZE + Math.floor(hashCell(seed + index * 61, index, 71) * (POND_MAX_SIZE - POND_MIN_SIZE + 1))
    };

    if (ponds.every((existing) => distanceBetweenPonds(existing, pond) >= POND_MIN_DISTANCE)) {
      ponds.push(pond);
    }
  }

  // Guarantee visible ponds even when the random candidates are too close.
  const fallback = [
    { x: 8, z: 8, width: 3, height: 3 },
    { x: 28, z: 8, width: 3, height: 4 },
    { x: 48, z: 8, width: 4, height: 3 },
    { x: 8, z: 32, width: 4, height: 3 },
    { x: 32, z: 32, width: 3, height: 4 },
    { x: 56, z: 56, width: 3, height: 3 }
  ];

  for (const pond of fallback) {
    if (ponds.length >= POND_COUNT) break;
    if (pond.x + pond.width < REGION_CELL_SIZE - 1 && pond.z + pond.height < REGION_CELL_SIZE - 1
      && ponds.every((existing) => distanceBetweenPonds(existing, pond) >= POND_MIN_DISTANCE)) {
      ponds.push(pond);
    }
  }

  return ponds;
}

function isBorderCell(x, z) {
  return x === 0 || z === 0 || x === REGION_CELL_SIZE - 1 || z === REGION_CELL_SIZE - 1;
}

function isPondCell(ponds, x, z) {
  return ponds.some((pond) => x >= pond.x && x < pond.x + pond.width && z >= pond.z && z < pond.z + pond.height);
}

function classifyDeepWater(cellsByKey) {
  for (const cell of cellsByKey.values()) {
    if (cell.cellId !== 'water') continue;
    const neighbors = [
      cellsByKey.get(cellKey(cell.x, cell.z - 1)),
      cellsByKey.get(cellKey(cell.x, cell.z + 1)),
      cellsByKey.get(cellKey(cell.x - 1, cell.z)),
      cellsByKey.get(cellKey(cell.x + 1, cell.z))
    ];
    if (neighbors.every((neighbor) => neighbor?.cellId === 'water')) cell.cellId = 'deep_water';
  }
}

function generateRegion({ regionX = 0, regionY = 0, regionZ = 0, seed = REGION_SEED } = {}) {
  const regionSeed = seed ^ Math.imul(regionX, 73856093) ^ Math.imul(regionY, 19349663) ^ Math.imul(regionZ, 83492791);
  const ponds = createPonds(regionSeed);
  const cells = [];
  const cellsByKey = new Map();

  for (let z = 0; z < REGION_CELL_SIZE; z += 1) {
    for (let x = 0; x < REGION_CELL_SIZE; x += 1) {
      const globalX = x + regionX * REGION_CELL_SIZE;
      const globalZ = z + regionZ * REGION_CELL_SIZE;
      const floorId = hashCell(regionSeed, globalX, globalZ) < GRASS_CHANCE ? 'grass' : 'stone';
      const cell = { x, y: 0, z, cellId: isBorderCell(x, z) ? 'stone' : (isPondCell(ponds, x, z) ? 'water' : floorId) };
      cells.push(cell);
      cellsByKey.set(cellKey(x, z), cell);
    }
  }

  classifyDeepWater(cellsByKey);
  return { seed, region: { x: regionX, y: regionY, z: regionZ }, chunkCellSize: CHUNK_CELL_SIZE, regionChunkSize: REGION_CHUNK_SIZE, regionCellSize: REGION_CELL_SIZE, ponds, cells, cellsByKey };
}

function createRegionWorld({ seed = REGION_SEED, regionX = 0, regionY = 0, regionZ = 0 } = {}) {
  const generated = generateRegion({ seed, regionX, regionY, regionZ });
  return {
    id: 'overworld', layerId: 'surface', seed, region: generated.region,
    width: REGION_CELL_SIZE * RENDERED_TILE_SIZE, height: REGION_CELL_SIZE * RENDERED_TILE_SIZE,
    tileSize: RENDERED_TILE_SIZE, renderedTileSize: RENDERED_TILE_SIZE, logicalCellSize: 16,
    columns: REGION_CELL_SIZE, rows: REGION_CELL_SIZE, chunkCellSize: CHUNK_CELL_SIZE,
    regionChunkSize: REGION_CHUNK_SIZE, regionCellSize: REGION_CELL_SIZE, viewDistanceCells: VIEW_DISTANCE_CELLS,
    cells: generated.cells, cellsByKey: new Map(generated.cells.map((cell) => [cellKey(cell.x, cell.z), cell.cellId])),
    cellDefinitions: [getCell('grass'), getCell('stone'), getCell('water'), getCell('deep_water'), getCell('debug')]
  };
}

function createWorld({ seed = REGION_SEED } = {}) { return { seed, regions: new Map() }; }

function getRegionWorld(world, regionX, regionY = 0, regionZ = 0) {
  const key = regionKey(regionX, regionY, regionZ);
  if (!world.regions.has(key)) world.regions.set(key, createRegionWorld({ seed: world.seed, regionX, regionY, regionZ }));
  return world.regions.get(key);
}

function serializeRegionWorld(regionWorld) {
  const { cellsByKey, cellDefinitions, ponds, ...publicWorld } = regionWorld;
  return publicWorld;
}

module.exports = { generateRegion, createRegionWorld, createWorld, getRegionWorld, serializeRegionWorld, cellKey, CHUNK_CELL_SIZE, REGION_CHUNK_SIZE, REGION_CELL_SIZE, VIEW_DISTANCE_CELLS, POND_MIN_DISTANCE };
