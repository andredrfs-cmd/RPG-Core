const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const { PORT, HOST, WORLD, TICK_RATE, TICK_INTERVAL, COLORS } = require('./config/gameConfig');
const { parseInputs } = require('./rules/player/inputRule');
const { validateName, isNameTaken } = require('./rules/player/nameRule');
const { createPlayer, serializePlayer } = require('./entities/player/playerEntity');
const { updatePlayerMovement } = require('./systems/movementSystem');
const { registerPlayerName } = require('./systems/playerSystem');

const players = new Map();
let nextPlayerId = 1;
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

  for (const player of players.values()) {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(payload);
    }
  }
}

function serveClient(request, response) {
  const requestedPath = request.url === '/' ? '/index.html' : request.url;
  const filePath = path.normalize(path.join(__dirname, '..', 'client', requestedPath));
  const clientRoot = path.resolve(path.join(__dirname, '..', 'client'));

  if (!filePath.startsWith(clientRoot)) {
    response.writeHead(403);
    response.end('Acesso negado');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      response.end(error.code === 'ENOENT' ? 'Arquivo não encontrado' : 'Erro interno');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream'
    });
    response.end(content);
  });
}

const httpServer = http.createServer(serveClient);
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (socket) => {
  const player = createPlayer(socket, nextPlayerId, WORLD, COLORS);
  nextPlayerId += 1;
  players.set(socket, player);
  console.log(`🟢 ${player.id} conectou. Jogadores: ${players.size}`);

  socket.send(JSON.stringify({
    type: 'INIT',
    id: player.id,
    suggestedName: player.id,
    world: WORLD
  }));

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (message.type === 'SET_NAME') {
        const result = validateName(message.name);

        if (!result.valid) {
          socket.send(JSON.stringify({ type: 'NAME_ERROR', message: result.message }));
          return;
        }

        if (isNameTaken(result.name, players, player)) {
          socket.send(JSON.stringify({
            type: 'NAME_ERROR',
            message: 'Esse nome já está em uso. Escolha outro.'
          }));
          return;
        }

        registerPlayerName(player, result.name);
        socket.send(JSON.stringify({
          type: 'NAME_ACCEPTED',
          id: player.id,
          name: player.name
        }));
        console.log(`✅ ${player.id} entrou como "${player.name}".`);
        return;
      }

      if (message.type === 'INPUT' && player.ready) {
        const inputs = parseInputs(message.inputs);
        if (inputs) player.inputs = inputs;
      }
    } catch (error) {
      console.warn('Mensagem inválida recebida:', error.message);
    }
  });

  socket.on('close', () => {
    players.delete(socket);
    console.log(`🔴 ${player.id} desconectou. Jogadores: ${players.size}`);
  });

  socket.on('error', (error) => {
    console.warn(`Erro no socket de ${player.id}:`, error.message);
  });
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
