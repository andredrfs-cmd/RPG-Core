const {
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
} = require('../config/worldConfig');
const { getCell } = require('../cells/cellRegistry');

const REGION_SEED = 18473;
const GRASS_CHANCE = 0.8;
const RENDERED_TILE_SIZE = 32;
const VIEW_DISTANCE_CELLS = 5;

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

function generateRegion({ regionX = 0, regionY = 0, regionZ = 0, seed = REGION_SEED } = {}) {
  const cells = [];
  const regionSeed = seed ^ Math.imul(regionX, 73856093) ^ Math.imul(regionY, 19349663) ^ Math.imul(regionZ, 83492791);

  for (let z = 0; z < REGION_CELL_SIZE; z += 1) {
    for (let x = 0; x < REGION_CELL_SIZE; x += 1) {
      const globalX = x + regionX * REGION_CELL_SIZE;
      const globalZ = z + regionZ * REGION_CELL_SIZE;
      const cellId = hashCell(regionSeed, globalX, globalZ) < GRASS_CHANCE ? 'grass' : 'stone';
      cells.push({ x, y: 0, z, cellId });
    }
  }
  return { seed, region: { x: regionX, y: regionY, z: regionZ }, cells };
}

function createRegionWorld({ seed = REGION_SEED, regionX = 0, regionY = 0, regionZ = 0 } = {}) {
  const generated = generateRegion({ seed, regionX, regionY, regionZ });
  return {
    id: 'overworld', layerId: 'surface', seed, region: generated.region,
    width: REGION_CELL_SIZE * RENDERED_TILE_SIZE,
    height: REGION_CELL_SIZE * RENDERED_TILE_SIZE,
    tileSize: RENDERED_TILE_SIZE, renderedTileSize: RENDERED_TILE_SIZE,
    logicalCellSize: 16, columns: REGION_CELL_SIZE, rows: REGION_CELL_SIZE,
    chunkCellSize: CHUNK_CELL_SIZE, regionChunkSize: REGION_CHUNK_SIZE,
    regionCellSize: REGION_CELL_SIZE, viewDistanceCells: VIEW_DISTANCE_CELLS,
    cells: generated.cells,
    cellsByKey: new Map(generated.cells.map((cell) => [cellKey(cell.x, cell.z), cell.cellId])),
    cellDefinitions: [getCell('grass'), getCell('stone'), getCell('debug')]
  };
}

function createWorld({ seed = REGION_SEED } = {}) {
  return { seed, regions: new Map() };
}

function getRegionWorld(world, regionX, regionY = 0, regionZ = 0) {
  const key = regionKey(regionX, regionY, regionZ);
  if (!world.regions.has(key)) world.regions.set(key, createRegionWorld({ seed: world.seed, regionX, regionY, regionZ }));
  return world.regions.get(key);
}

function serializeRegionWorld(regionWorld) {
  const { cellsByKey, cellDefinitions, ...publicWorld } = regionWorld;
  return publicWorld;
}

module.exports = {
  generateRegion, createRegionWorld, createWorld, getRegionWorld,
  serializeRegionWorld, cellKey, CHUNK_CELL_SIZE, REGION_CHUNK_SIZE,
  REGION_CELL_SIZE, VIEW_DISTANCE_CELLS
};
