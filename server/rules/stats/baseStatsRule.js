const { DEFAULT_PLAYER_STATS } = require('../../config/gameConfig');

function createBaseStats() {
  return {
    ...DEFAULT_PLAYER_STATS
  };
}

module.exports = {
  createBaseStats
};
