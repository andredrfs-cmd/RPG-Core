const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const { PORT, HOST, WORLD, TICK_RATE, TICK_INTERVAL, COLORS } = require('./config/gameConfig');
const { createPlayer, serializePlayer } = require('./entities/player/playerEntity');
const { updatePlayerMovement } = require('./systems/movementSystem');
const { createStaticServer } = require('./web/staticServer');
const { attachWebSocketHandlers, sendToOpenPlayers } = require('./network/websocketServer');

const players = new Map();
let tickCount = 0;

function broadcastState() {
  const payload = JSON.stringify({
    type: 'TICK_UPDATE',
    tick: tickCount,
    world: WORLD,
    players: Array.from(players.values())
      .filter((player) => player.ready)
      .map(serializePlayer)
  });

  sendToOpenPlayers(players, payload);
}

const httpServer = http.createServer(
  createStaticServer(path.join(__dirname, '..', 'client'))
);
const websocketServer = new WebSocketServer({ server: httpServer });

attachWebSocketHandlers(websocketServer, players, {
  world: WORLD,
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
  broadcastState();
}, TICK_INTERVAL);

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 RPG-Core disponível em http://localhost:${PORT}`);
  console.log(`🗺️ Mundo: ${WORLD.columns}x${WORLD.rows} blocos de ${WORLD.tileSize}px`);
  console.log(`🎮 Tick rate: ${TICK_RATE} ticks/segundo`);
});
