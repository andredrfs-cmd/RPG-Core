const {
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
} = require('../config/worldConfig');
const { getCell } = require('../cells/cellRegistry');

const REGION_SEED = 18473;
const GRASS_CHANCE = 0.8;
const RENDERED_TILE_SIZE = 32;

function hashCell(seed, x, z) {
  let value = seed;
  value = Math.imul(value ^ Math.imul(x, 374761393), 668265263);
  value = Math.imul(value ^ Math.imul(z, 1274126177), 2246822519);
  value = Math.imul(value ^ (value >>> 13), 3266489917);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

function cellKey(x, z) {
  return `${x},${z}`;
}

function generateRegion({ regionX = 0, regionY = 0, regionZ = 0, seed = REGION_SEED } = {}) {
  const cells = [];
  const regionSeed = seed
    ^ Math.imul(regionX, 73856093)
    ^ Math.imul(regionY, 19349663)
    ^ Math.imul(regionZ, 83492791);

  for (let z = 0; z < REGION_CELL_SIZE; z += 1) {
    for (let x = 0; x < REGION_CELL_SIZE; x += 1) {
      const globalX = x + regionX * REGION_CELL_SIZE;
      const globalZ = z + regionZ * REGION_CELL_SIZE;
      const value = hashCell(regionSeed, globalX, globalZ);
      cells.push({ x, y: 0, z, cellId: value < GRASS_CHANCE ? 'grass' : 'stone' });
    }
  }

  return { seed, region: { x: regionX, y: regionY, z: regionZ }, cells };
}

function applyRegion(world, regionX, regionY = 0, regionZ = 0) {
  const generated = generateRegion({ seed: world.seed, regionX, regionY, regionZ });
  world.region = generated.region;
  world.cells = generated.cells;
  world.cellsByKey = new Map(generated.cells.map((cell) => [cellKey(cell.x, cell.z), cell.cellId]));
  return world;
}

function createWorld({ seed = REGION_SEED, regionX = 0, regionY = 0, regionZ = 0 } = {}) {
  const world = {
    id: 'overworld',
    layerId: 'surface',
    seed,
    width: REGION_CELL_SIZE * RENDERED_TILE_SIZE,
    height: REGION_CELL_SIZE * RENDERED_TILE_SIZE,
    tileSize: RENDERED_TILE_SIZE,
    renderedTileSize: RENDERED_TILE_SIZE,
    logicalCellSize: 16,
    columns: REGION_CELL_SIZE,
    rows: REGION_CELL_SIZE,
    chunkCellSize: CHUNK_CELL_SIZE,
    regionChunkSize: REGION_CHUNK_SIZE,
    regionCellSize: REGION_CELL_SIZE,
    viewDistanceChunks: 1,
    cells: [],
    cellsByKey: new Map(),
    cellDefinitions: [getCell('grass'), getCell('stone'), getCell('debug')],
    region: { x: regionX, y: regionY, z: regionZ }
  };

  return applyRegion(world, regionX, regionY, regionZ);
}

function transitionRegion(world, player) {
  let regionX = world.region.x;
  let regionZ = world.region.z;
  let changed = false;

  while (player.x < 0) {
    player.x += world.width;
    regionX -= 1;
    changed = true;
  }
  while (player.x >= world.width) {
    player.x -= world.width;
    regionX += 1;
    changed = true;
  }
  while (player.y < 0) {
    player.y += world.height;
    regionZ -= 1;
    changed = true;
  }
  while (player.y >= world.height) {
    player.y -= world.height;
    regionZ += 1;
    changed = true;
  }

  if (changed) applyRegion(world, regionX, world.region.y, regionZ);
  return changed;
}

module.exports = {
  generateRegion,
  createWorld,
  applyRegion,
  transitionRegion,
  cellKey,
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
};
