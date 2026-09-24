const grass = require('./grass');
const water = require('./water');
const deepWater = require('./deepWater');
const stone = require('./stone');
const debug = require('./debug');

const cells = new Map([
  [grass.id, grass],
  [water.id, water],
  [deepWater.id, deepWater],
  [stone.id, stone],
  [debug.id, debug]
]);

function getCell(cellId) {
  return cells.get(cellId) || debug;
}

function getCellList() {
  return Array.from(cells.values());
}

module.exports = {
  cells,
  getCell,
  getCellList
};
