const http = require('http');
const path = require('path');
const { WebSocket, WebSocketServer } = require('ws');
const { PORT, HOST, TICK_RATE, TICK_INTERVAL, COLORS } = require('./config/gameConfig');
const { REGION_CELL_SIZE } = require('./config/worldConfig');
const { createWorld, getRegionWorld, serializeRegionWorld } = require('./world/proceduralWorld');
const { createPlayer, serializePlayer } = require('./entities/player/playerEntity');
const { updatePlayerMovement } = require('./systems/movementSystem');
const { createStaticServer } = require('./web/staticServer');
const { attachWebSocketHandlers } = require('./network/websocketServer');

const WORLD = createWorld();
const players = new Map();
let tickCount = 0;

function regionKey(region) {
  return `${region.x},${region.y},${region.z}`;
}

function sendState(player) {
  if (player.socket.readyState !== WebSocket.OPEN) return;

  const region = player.location.region;
  const regionWorld = getRegionWorld(WORLD, region.x, region.y, region.z);
  const key = regionKey(region);
  const regionChanged = player.lastSentRegionKey !== key;
  const visiblePlayers = Array.from(players.values()).filter((other) => (
    other.ready && regionKey(other.location.region) === key
  ));
  const state = {
    type: 'TICK_UPDATE',
    tick: tickCount,
    players: visiblePlayers.map(serializePlayer)
  };

  if (regionChanged) {
    state.world = serializeRegionWorld(regionWorld);
    player.lastSentRegionKey = key;
  }

  player.socket.send(JSON.stringify(state));
}

const httpServer = http.createServer(
  createStaticServer(path.join(__dirname, '..', 'client'))
);
const websocketServer = new WebSocketServer({ server: httpServer });

attachWebSocketHandlers(websocketServer, players, {
  world: getRegionWorld(WORLD, 0, 0, 0),
  colors: COLORS,
  nextPlayerId: 1,
  onPlayerCreated: (player) => {
    console.log(`🟢 ${player.id} conectou. Jogadores: ${players.size}`);
  }
});

setInterval(() => {
  tickCount += 1;
  for (const player of players.values()) {
    updatePlayerMovement(player, WORLD);
  }
  for (const player of players.values()) {
    if (player.ready) sendState(player);
  }
}, TICK_INTERVAL);

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 RPG-Core disponível em http://localhost:${PORT}`);
  console.log(`🗺️ Região: 8x8 chunks — ${REGION_CELL_SIZE}x${REGION_CELL_SIZE} células`);
  console.log(`🎮 Tick rate: ${TICK_RATE} ticks/segundo`);
});
