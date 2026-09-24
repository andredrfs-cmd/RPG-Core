function registerPlayerName(player, name) {
  player.name = name;
  player.ready = true;
  return player;
}

module.exports = {
  registerPlayerName
};
