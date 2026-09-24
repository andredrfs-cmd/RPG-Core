const { computeDirection } = require('../../rules/movement/movementRule');
const { tryMove } = require('../../rules/collision/movementCollisionRule');

function updatePlayerMovement(player, world) {
  if (!player.ready) return;

  const { horizontal, vertical, isMoving, direction } = computeDirection(player.inputs);

  player.isMoving = isMoving;

  if (horizontal > 0) player.direction = 'right';
  else if (horizontal < 0) player.direction = 'left';
  else if (vertical > 0) player.direction = 'down';
  else if (vertical < 0) player.direction = 'up';

  if (!isMoving) return;

  const length = Math.hypot(horizontal, vertical) || 1;
  const deltaX = (horizontal / length) * player.stats.speed;
  const deltaY = (vertical / length) * player.stats.speed;

  tryMove(player, deltaX, deltaY, world);

  if (direction) {
    player.direction = direction;
  }
}

module.exports = {
  updatePlayerMovement
};
