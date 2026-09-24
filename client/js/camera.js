export function createCamera(canvas, getWorld, getLocalPlayer) {
  function getPosition() {
    const world = getWorld();
    const localPlayer = getLocalPlayer();
    const maxX = Math.max(0, world.width - canvas.width);
    const maxY = Math.max(0, world.height - canvas.height);
    const targetX = localPlayer ? localPlayer.x - canvas.width / 2 : 0;
    const targetY = localPlayer ? localPlayer.y - canvas.height / 2 : 0;

    return {
      x: Math.max(0, Math.min(targetX, maxX)),
      y: Math.max(0, Math.min(targetY, maxY))
    };
  }

  return { getPosition };
}
