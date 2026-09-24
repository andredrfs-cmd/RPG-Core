const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
const TILE_SIZE = 40;
const MAP_COLUMNS = 30;
const MAP_ROWS = 22;
const WORLD = {
  width: MAP_COLUMNS * TILE_SIZE,
  height: MAP_ROWS * TILE_SIZE,
  tileSize: TILE_SIZE,
  columns: MAP_COLUMNS,
  rows: MAP_ROWS
};
const PLAYER_SIZE = 30;
const TICK_RATE = 20;
const TICK_INTERVAL = 1000 / TICK_RATE;
const COLORS = ['#00ff00', '#ff4d4d', '#00d9ff', '#ffe14d', '#ff66e8', '#ffffff'];
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 16;
const NAME_PATTERN = /^[\p{L}\p{N}_ -]+$/u;

const players = new Map();
let nextPlayerId = 1;
let tickCount = 0;

function createPlayer(socket) {
  const id = `player_${nextPlayerId++}`;
  return {
    id,
    name: null,
    ready: false,
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

function validateName(value) {
  if (typeof value !== 'string') return { valid: false, message: 'Digite um nome válido.' };
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < NAME_MIN_LENGTH) {
    return { valid: false, message: `O nome precisa ter pelo menos ${NAME_MIN_LENGTH} caracteres.` };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { valid: false, message: `O nome pode ter no máximo ${NAME_MAX_LENGTH} caracteres.` };
  }
  if (!NAME_PATTERN.test(name)) {
    return { valid: false, message: 'Use apenas letras, números, espaços, hífen ou sublinhado.' };
  }
  return { valid: true, name };
}

function isNameTaken(name, currentPlayer) {
  const normalizedName = name.toLocaleLowerCase();
  return Array.from(players.values()).some((player) => (
    player !== currentPlayer && player.name && player.name.toLocaleLowerCase() === normalizedName
  ));
}

function isWalkableAt(x, y) {
  const half = PLAYER_SIZE / 2;
  return (
    x - half >= TILE_SIZE &&
    x + half <= WORLD.width - TILE_SIZE &&
    y - half >= TILE_SIZE &&
    y + half <= WORLD.height - TILE_SIZE
  );
}

function tryMove(player, deltaX, deltaY) {
  const nextX = player.x + deltaX;
  const nextY = player.y + deltaY;
  if (isWalkableAt(nextX, player.y)) player.x = nextX;
  if (isWalkableAt(player.x, nextY)) player.y = nextY;
}

function updatePlayer(player) {
  if (!player.ready) return;
  const { inputs } = player;
  const horizontal = Number(inputs.right) - Number(inputs.left);
  const vertical = Number(inputs.down) - Number(inputs.up);
  player.isMoving = horizontal !== 0 || vertical !== 0;

  if (horizontal > 0) player.direction = 'right';
  else if (horizontal < 0) player.direction = 'left';
  else if (vertical > 0) player.direction = 'down';
  else if (vertical < 0) player.direction = 'up';

  const length = Math.hypot(horizontal, vertical) || 1;
  tryMove(player, (horizontal / length) * player.speed, (vertical / length) * player.speed);
}

function serializePlayers() {
  return Array.from(players.values()).filter((player) => player.ready).map((player) => ({
    id: player.id,
    name: player.name,
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
    if (player.socket.readyState === WebSocket.OPEN) player.socket.send(payload);
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
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? 'Arquivo não encontrado' : 'Erro interno');
      return;
    }
    const contentTypes = {
      '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    response.end(content);
  });
}

const httpServer = http.createServer(serveClient);
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (socket) => {
  const player = createPlayer(socket);
  players.set(socket, player);
  console.log(`🟢 ${player.id} conectou. Jogadores: ${players.size}`);

  socket.send(JSON.stringify({ type: 'INIT', id: player.id, suggestedName: player.id, world: WORLD }));

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());
      if (message.type === 'SET_NAME') {
        const result = validateName(message.name);
        if (!result.valid) {
          socket.send(JSON.stringify({ type: 'NAME_ERROR', message: result.message }));
          return;
        }
        if (isNameTaken(result.name, player)) {
          socket.send(JSON.stringify({ type: 'NAME_ERROR', message: 'Esse nome já está em uso. Escolha outro.' }));
          return;
        }
        player.name = result.name;
        player.ready = true;
        socket.send(JSON.stringify({ type: 'NAME_ACCEPTED', id: player.id, name: player.name }));
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
  socket.on('error', (error) => console.warn(`Erro no socket de ${player.id}:`, error.message));
});

setInterval(() => {
  tickCount += 1;
  for (const player of players.values()) updatePlayer(player);
  broadcastState();
}, TICK_INTERVAL);

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 RPG-Core disponível em http://localhost:${PORT}`);
  console.log(`🗺️ Mundo: ${MAP_COLUMNS}x${MAP_ROWS} blocos de ${TILE_SIZE}px`);
  console.log(`🎮 Tick rate: ${TICK_RATE} ticks/segundo`);
});
