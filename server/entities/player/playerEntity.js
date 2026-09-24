const { createBaseStats } = require('../../rules/stats/baseStatsRule');
const { createWorldLocation } = require('../../coordinates/worldCoordinates');

function createPlayer(socket, idNumber, regionWorld, colors) {
  const id = `player_${idNumber}`;
  const x = Math.round(regionWorld.width / 2);
  const y = Math.round(regionWorld.height / 2);
  return {
    id, name: null, ready: false, x, y,
    location: createWorldLocation({ worldId: regionWorld.id, layerId: regionWorld.layerId, region: regionWorld.region }),
    color: colors[(idNumber - 1) % colors.length], direction: 'down', isMoving: false,
    inputs: { up: false, down: false, left: false, right: false }, stats: createBaseStats(), socket
  };
}

function serializePlayer(player) {
  return { id: player.id, name: player.name, x: Math.round(player.x * 100) / 100, y: Math.round(player.y * 100) / 100, location: player.location, color: player.color, direction: player.direction, isMoving: player.isMoving };
}

module.exports = { createPlayer, serializePlayer };
