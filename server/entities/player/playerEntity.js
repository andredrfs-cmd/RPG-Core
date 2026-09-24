const { PLAYER_SIZE } = require('../../config/gameConfig');
const { createWorldLocation } = require('../../coordinates/worldCoordinates');
const { createBaseStats } = require('../../rules/stats/baseStatsRule');

function createPlayer(socket, idNumber, regionWorld, colors = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff']) {
  const id = `player_${idNumber}`;
  const centerX = Math.round(regionWorld.width / 2);
  const centerY = Math.round(regionWorld.height / 2);
  const region = regionWorld.region;

  return {
    id,
    name: null,
    ready: false,
    x: centerX,
    y: centerY,
    location: createWorldLocation({
      worldId: regionWorld.id,
      layerId: regionWorld.layerId,
      region,
      position: { x: Math.floor(centerX / regionWorld.tileSize), y: 0, z: Math.floor(centerY / regionWorld.tileSize) }
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

module.exports = { createPlayer, serializePlayer };
