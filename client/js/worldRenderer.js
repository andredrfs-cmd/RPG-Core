const TILE_STYLES = {
  grass: { color: '#4f8f45', line: '#42783a' },
  stone: { color: '#777b82', line: '#62666d' },
  debug: { color: '#ff00ff', line: '#ff8cff' }
};

const CHUNK_CELL_SIZE = 16;

function getCellMap(world) {
  if (world.cellsByKey instanceof Map) return world.cellsByKey;
  if (!world.cells) return new Map();
  return new Map(world.cells.map((cell) => [`${cell.x},${cell.z}`, cell.cellId]));
}

function getTileType(column, row, world, localPlayer, cellMap) {
  if (column < 0 || row < 0 || column >= world.columns || row >= world.rows) return 'debug';

  const tileSize = world.renderedTileSize || world.tileSize;
  const playerX = localPlayer ? Math.floor(localPlayer.x / tileSize) : 0;
  const playerZ = localPlayer ? Math.floor(localPlayer.y / tileSize) : 0;
  const playerChunkX = Math.floor(playerX / CHUNK_CELL_SIZE);
  const playerChunkZ = Math.floor(playerZ / CHUNK_CELL_SIZE);
  const cellChunkX = Math.floor(column / CHUNK_CELL_SIZE);
  const cellChunkZ = Math.floor(row / CHUNK_CELL_SIZE);
  const viewDistance = world.viewDistanceChunks ?? 1;

  if (Math.abs(cellChunkX - playerChunkX) > viewDistance
    || Math.abs(cellChunkZ - playerChunkZ) > viewDistance) return 'debug';

  return cellMap.get(`${column},${row}`) || 'debug';
}

export function drawWorld(ctx, canvas, world, camera, localPlayer) {
  const tileSize = world.renderedTileSize || world.tileSize;
  const firstColumn = Math.floor(camera.x / tileSize) - 1;
  const firstRow = Math.floor(camera.y / tileSize) - 1;
  const lastColumn = Math.ceil((camera.x + canvas.width) / tileSize) + 1;
  const lastRow = Math.ceil((camera.y + canvas.height) / tileSize) + 1;
  const cellMap = getCellMap(world);

  ctx.fillStyle = TILE_STYLES.debug.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const type = getTileType(column, row, world, localPlayer, cellMap);
      const tile = TILE_STYLES[type] || TILE_STYLES.debug;
      const x = column * tileSize - camera.x;
      const y = row * tileSize - camera.y;

      ctx.fillStyle = tile.color;
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.strokeStyle = tile.line;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
    }
  }
}
