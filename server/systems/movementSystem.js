const { computeDirection } = require('../rules/movement/movementRule');
const { tryMove } = require('../rules/collision/movementCollisionRule');
const { transitionRegion } = require('../world/proceduralWorld');

function updatePlayerMovement(player, world) {
  if (!player.ready) return;
  const { horizontal, vertical, isMoving, direction } = computeDirection(player.inputs);
  player.isMoving = isMoving;
  if (!isMoving) return;

  const length = Math.hypot(horizontal, vertical) || 1;
  tryMove(player, (horizontal / length) * player.stats.speed, (vertical / length) * player.stats.speed, world);
  transitionRegion(world, player);
  player.direction = direction;
}

module.exports = { updatePlayerMovement };
