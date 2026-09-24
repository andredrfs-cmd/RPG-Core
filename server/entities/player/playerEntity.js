const { WORLD } = require('../../config/gameConfig');
const { createWorldLocation } = require('../../coordinates/worldCoordinates');
const { createBaseStats } = require('../../rules/stats/baseStatsRule');

function createPlayer(socket, idNumber, world = WORLD, colors = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff']) {
  const id = `player_${idNumber}`;

  return {
    id,
    name: null,
    ready: false,
    x: Math.round(world.width / 2),
    y: Math.round(world.height / 2),
    location: createWorldLocation({
      worldId: 'overworld',
      layerId: 'surface',
      position: {
        x: Math.floor(world.columns / 2),
        y: 0,
        z: Math.floor(world.rows / 2)
      }
    }),
    color: colors[(idNumber - 1) % colors.length],
    direction: 'down',
    isMoving: false,
    inputs: { up: false, down: false, left: false, right: false },
    stats: createBaseStats(),
    socket
  };
}

function serializePlayer(player) {
  return {
    id: player.id,
    name: player.name,
    x: Math.round(player.x * 100) / 100,
    y: Math.round(player.y * 100) / 100,
    location: player.location,
    color: player.color,
    direction: player.direction,
    isMoving: player.isMoving
  };
}

module.exports = {
  createPlayer,
  serializePlayer
};
