import { drawWorld } from './worldRenderer.js';

export function renderGame(ctx, canvas, world, camera, players, localPlayerId) {
  const localPlayer = players.find((player) => player.id === localPlayerId) || null;
  drawWorld(ctx, canvas, world, camera, localPlayer);

  players.forEach((player) => {
    const size = 24;
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    const left = screenX - size / 2;
    const top = screenY - size / 2;

    ctx.fillStyle = player.color;
    ctx.fillRect(left, top, size, size);

    if (player.id === localPlayerId) {
      ctx.strokeStyle = '#7dff7d';
      ctx.lineWidth = 3;
      ctx.strokeRect(left - 2, top - 2, size + 4, size + 4);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(player.name || player.id, screenX, top - 8);
  });
}
