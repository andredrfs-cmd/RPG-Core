const TILE_STYLES = {
  grass: { color: '#4f8f45', line: '#42783a' },
  water: { color: '#2876b8', line: '#23669f' },
  deep_water: { color: '#123c73', line: '#0e315e' },
  stone: { color: '#777b82', line: '#62666d' },
  debug: { color: '#ff00ff', line: '#ff8cff' }
};

function getTileType(column, row, world) {
  if (column < 0 || row < 0 || column >= world.columns || row >= world.rows) return 'debug';
  const isBorder = column === 0 || row === 0 || column === world.columns - 1 || row === world.rows - 1;
  return isBorder ? 'water' : 'grass';
}

export function drawWorld(ctx, canvas, world, camera) {
  const tileSize = world.renderedTileSize || world.tileSize;
  const firstColumn = Math.floor(camera.x / tileSize) - 1;
  const firstRow = Math.floor(camera.y / tileSize) - 1;
  const lastColumn = Math.ceil((camera.x + canvas.width) / tileSize) + 1;
  const lastRow = Math.ceil((camera.y + canvas.height) / tileSize) + 1;

  ctx.fillStyle = TILE_STYLES.debug.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const tile = TILE_STYLES[getTileType(column, row, world)] || TILE_STYLES.debug;
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
