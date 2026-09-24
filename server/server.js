const http = require('http');
const path = require('path');
const { WebSocket, WebSocketServer } = require('ws');
const { PORT, HOST, TICK_RATE, TICK_INTERVAL, COLORS } = require('./config/gameConfig');
const { createWorld, getRegionWorld, serializeRegionWorld } = require('./world/proceduralWorld');
const { createPlayer, serializePlayer } = require('./entities/player/playerEntity');
const { updatePlayerMovement } = require('./systems/movementSystem');
const { createStaticServer } = require('./web/staticServer');
const { attachWebSocketHandlers } = require('./network/websocketServer');

const WORLD = createWorld();
const players = new Map();
let tickCount = 0;

function sendState(player) {
  if (player.socket.readyState !== WebSocket.OPEN) return;
  const region = player.location.region;
  const regionWorld = getRegionWorld(WORLD, region.x, region.y, region.z);
  player.socket.send(JSON.stringify({
    type: 'TICK_UPDATE',
    tick: tickCount,
    world: serializeRegionWorld(regionWorld),
    players: Array.from(players.values())
      .filter((other) => other.ready && other.location.region.x === region.x && other.location.region.y === region.y && other.location.region.z === region.z)
      .map(serializePlayer)
  }));
}

const httpServer = http.createServer(createStaticServer(path.join(__dirname, '..', 'client')));
const websocketServer = new WebSocketServer({ server: httpServer });
attachWebSocketHandlers(websocketServer, players, {
  world: getRegionWorld(WORLD, 0, 0, 0),
  colors: COLORS,
  nextPlayerId: 1,
  onPlayerCreated: (player) => console.log(`🟢 ${player.id} conectou. Jogadores: ${players.size}`)
});

setInterval(() => {
  tickCount += 1;
  for (const player of players.values()) updatePlayerMovement(player, WORLD);
  for (const player of players.values()) if (player.ready) sendState(player);
}, TICK_INTERVAL);

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 RPG-Core disponível em http://localhost:${PORT}`);
  console.log(`🗺️ Região inicial: 0,0,0 — 32x32 células`);
  console.log(`🎮 Tick rate: ${TICK_RATE} ticks/segundo`);
});
