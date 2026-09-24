const {
  CHUNK_CELL_SIZE,
  REGION_CHUNK_SIZE,
  REGION_CELL_SIZE
} = require('../config/worldConfig');
const { getCell } = require('../cells/cellRegistry');

const REGION_SEED = 18473;
const GRASS_CHANCE = 0.8;

function hashCell(seed, x, z) {
  let value = Math.imul(seed ^ Math.imul(x, 374761393), 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

function cellKey(x, z) {
  return `${x},${z}`;
}

function generateRegion({ regionX = 0, regionY = 0, regionZ = 0, seed = REGION_SEED } = {}) {
  const cells = [];
  const regionSeed = seed ^ Math.imul(regionX, 73856093) ^ Math.imul(regionY, 19349663) ^ Math.imul(regionZ, 83492791);

  for (let z = 0; z < REGION_CELL_SIZE; z += 1) {
    for (let x = 0; x < REGION_CELL_SIZE; x += 1) {
      const value = hashCell(regionSeed, x + regionX * REGION_CELL_SIZE, z + regionZ * REGION_CELL_SIZE);
      cells.push({
        x,
        y: 0,
        z,
        cellId: value < GRASS_CHANCE ? 'grass' : 'stone'
      });
    }
  }

  return {
    seed,
    region: { x: regionX, y: regionY, z: regionZ },
    chunkCellSize: CHUNK_CELL_SIZE,
    regionChunkSize: REGION_CHUNK_SIZE,
    regionCellSize: REGION_CELL_SIZE,
    cells
  };
}

function createWorld({ seed = REGION_SEED, regionX = 0, regionY = 0, regionZ = 0 } = {}) {
  const generatedRegion = generateRegion({ seed, regionX, regionY, regionZ });
  const cellsByKey = new Map(generatedRegion.cells.map((cell) => [cellKey(cell.x, cell.z), cell.cellId]));

  return {
    id: 'overworld',
    layerId: 'surface',
    seed,
    region: generatedRegion.region,
    width: REGION_CELL_SIZE * 32,
    height: REGION_CELL_SIZE * 32,
    tileSize: 32,
    renderedTileSize: 32,
    logicalCellSize: 16,
    columns: REGION_CELL_SIZE,
    rows: REGION_CELL_SIZE,
    chunkCellSize: CHUNK_CELL_SIZE,
    regionChunkSize: REGION_CHUNK_SIZE,
    viewDistanceChunks: 1,
    cells: generatedRegion.cells,
    cellsByKey,
    cellDefinitions: [getCell('grass'), getCell('stone'), getCell('debug')]
  };
}

module.exports = {
  generateRegion,
  createWorld,
  cellKey
};
