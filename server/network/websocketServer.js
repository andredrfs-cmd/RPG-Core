const { WebSocket } = require('ws');
const { parseInputs } = require('../rules/player/inputRule');
const { validateName, isNameTaken } = require('../rules/player/nameRule');
const { registerPlayerName } = require('../systems/playerSystem');
const { createPlayer } = require('../entities/player/playerEntity');

function attachWebSocketHandlers(wss, players, options) {
  const { world, colors, nextPlayerId, onPlayerCreated } = options;
  let playerIdNumber = nextPlayerId;

  wss.on('connection', (socket) => {
    const player = createPlayer(socket, playerIdNumber, world, colors);
    playerIdNumber += 1;
    players.set(socket, player);
    onPlayerCreated(player);

    socket.send(JSON.stringify({
      type: 'INIT',
      id: player.id,
      suggestedName: player.id,
      world
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
}

function sendToOpenPlayers(players, payload) {
  for (const player of players.values()) {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(payload);
    }
  }
}

module.exports = { attachWebSocketHandlers, sendToOpenPlayers };
