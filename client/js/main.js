import { createNetwork } from './network.js';
import { createInputController } from './input.js';
import { createCamera } from './camera.js';
import { renderGame } from './renderer.js';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const statusElement = document.querySelector('#status');
const nameScreen = document.querySelector('#nameScreen');
const nameForm = document.querySelector('#nameForm');
const nameInput = document.querySelector('#nameInput');
const nameError = document.querySelector('#nameError');
const nameButton = nameForm.querySelector('button');
const playerPanelName = document.querySelector('#playerPanelName');
const playerHp = document.querySelector('#playerHp');

const defaultWorld = {
  width: canvas.width,
  height: canvas.height,
  tileSize: 32,
  renderedTileSize: 32,
  logicalCellSize: 16,
  columns: 20,
  rows: 20
};
let world = defaultWorld;
let players = [];
let localPlayerId = null;
let localPlayerName = null;
let hasEnteredWorld = false;

function getLocalPlayer() {
  return players.find((player) => player.id === localPlayerId) || null;
}

function setStatus(message, color) {
  statusElement.textContent = message;
  if (color) statusElement.style.color = color;
}

function updatePlayerPanel() {
  const player = getLocalPlayer();
  playerPanelName.textContent = player ? (player.name || player.id) : 'Aguardando entrada...';
  if (player && player.stats) playerHp.textContent = `${player.stats.hp} / ${player.stats.maxHp}`;
}

function showNameScreen(suggestedName) {
  nameInput.value = suggestedName || '';
  nameError.textContent = '';
  nameButton.disabled = false;
  nameScreen.classList.remove('is-hidden');
  nameInput.focus();
  nameInput.select();
}

function hideNameScreen() {
  nameScreen.classList.add('is-hidden');
  nameButton.disabled = false;
}

const network = createNetwork({
  onStatus(status) {
    if (status === 'open') setStatus('Conectado — escolha um nome para entrar', '#63e6be');
    if (status === 'close') {
      setStatus('Desconectado do servidor', '#ff8787');
      nameButton.disabled = true;
    }
    if (status === 'error') setStatus('Erro ao conectar ao servidor', '#ff8787');
  },
  onMessage(data) {
    if (data.type === 'INIT') {
      localPlayerId = data.id;
      world = data.world || world;
      showNameScreen(data.suggestedName || data.id);
    }
    if (data.type === 'NAME_ERROR') {
      nameError.textContent = data.message;
      nameButton.disabled = false;
      nameInput.focus();
      nameInput.select();
    }
    if (data.type === 'NAME_ACCEPTED') {
      localPlayerId = data.id;
      localPlayerName = data.name;
      hasEnteredWorld = true;
      hideNameScreen();
      setStatus(`Conectado como ${localPlayerName} — jogadores: ${players.length}`);
    }
    if (data.type === 'TICK_UPDATE') {
      players = data.players;
      world = data.world || world;
      updatePlayerPanel();
      if (hasEnteredWorld) setStatus(`Conectado como ${localPlayerName} — jogadores: ${players.length}`);
    }
  }
});

createInputController(
  (inputs) => network.send({ type: 'INPUT', inputs }),
  () => hasEnteredWorld && network.isOpen()
);

nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name || !network.isOpen()) return;
  nameError.textContent = '';
  nameButton.disabled = true;
  network.send({ type: 'SET_NAME', name });
});

const camera = createCamera(canvas, () => world, getLocalPlayer);

function render() {
  renderGame(ctx, canvas, world, camera.getPosition(), players, localPlayerId);
  requestAnimationFrame(render);
}

network.connect();
render();
