const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
const WORLD = { width: 800, height: 600 };
const PLAYER_SIZE = 30;
const TICK_RATE = 20;
const TICK_INTERVAL = 1000 / TICK_RATE;
const COLORS = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff'];

const players = new Map();
let nextPlayerId = 1;
let tickCount = 0;

function createPlayer(socket) {
  const id = `player_${nextPlayerId++}`;
  return {
    id,
    x: Math.round(WORLD.width / 2),
    y: Math.round(WORLD.height / 2),
    speed: 5,
    color: COLORS[(nextPlayerId - 2) % COLORS.length],
    direction: 'down',
    isMoving: false,
    inputs: { up: false, down: false, left: false, right: false },
    socket
  };
}

function parseInputs(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    up: value.up === true,
    down: value.down === true,
    left: value.left === true,
    right: value.right === true
  };
}

function updatePlayer(player) {
  const { inputs } = player;
  const horizontal = Number(inputs.right) - Number(inputs.left);
  const vertical = Number(inputs.down) - Number(inputs.up);

  player.isMoving = horizontal !== 0 || vertical !== 0;

  if (horizontal > 0) player.direction = 'right';
  else if (horizontal < 0) player.direction = 'left';
  else if (vertical > 0) player.direction = 'down';
  else if (vertical < 0) player.direction = 'up';

  // Normaliza a diagonal para que ela não seja mais rápida que o movimento reto.
  const length = Math.hypot(horizontal, vertical) || 1;
  player.x += (horizontal / length) * player.speed;
  player.y += (vertical / length) * player.speed;

  const half = PLAYER_SIZE / 2;
  player.x = Math.max(half, Math.min(WORLD.width - half, player.x));
  player.y = Math.max(half, Math.min(WORLD.height - half, player.y));
}

function serializePlayers() {
  return Array.from(players.values()).map((player) => ({
    id: player.id,
    x: Math.round(player.x * 100) / 100,
    y: Math.round(player.y * 100) / 100,
    color: player.color,
    direction: player.direction,
    isMoving: player.isMoving
  }));
}

function broadcastState() {
  const payload = JSON.stringify({
    type: 'TICK_UPDATE',
    tick: tickCount,
    world: WORLD,
    players: serializePlayers()
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
  const player = createPlayer(socket);
  players.set(socket, player);
  console.log(`🟢 ${player.id} conectou. Jogadores: ${players.size}`);

  socket.send(JSON.stringify({
    type: 'INIT',
    id: player.id,
    world: WORLD
  }));

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());
      if (message.type !== 'INPUT') return;

      const inputs = parseInputs(message.inputs);
      if (inputs) player.inputs = inputs;
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
  for (const player of players.values()) updatePlayer(player);
  broadcastState();
}, TICK_INTERVAL);

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 RPG-Core disponível em http://localhost:${PORT}`);
  console.log(`🎮 Tick rate: ${TICK_RATE} ticks/segundo`);
});
