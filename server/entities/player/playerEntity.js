const { createBaseStats } = require('../../rules/stats/baseStatsRule');
const { WORLD } = require('../../config/gameConfig');

function createPlayer(socket, idNumber, world = WORLD, colors = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff']) {
  const id = `player_${idNumber}`;

  return {
    id,
    name: null,
    ready: false,
    x: Math.round(world.width / 2),
    y: Math.round(world.height / 2),
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
    color: player.color,
    direction: player.direction,
    isMoving: player.isMoving
  };
}

module.exports = {
  createPlayer,
  serializePlayer
};
