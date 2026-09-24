function computeDirection(inputs) {
  const horizontal = Number(inputs.right) - Number(inputs.left);
  const vertical = Number(inputs.down) - Number(inputs.up);

  const isMoving = horizontal !== 0 || vertical !== 0;

  let direction = 'down';
  if (horizontal > 0) direction = 'right';
  else if (horizontal < 0) direction = 'left';
  else if (vertical > 0) direction = 'down';
  else if (vertical < 0) direction = 'up';

  return {
    horizontal,
    vertical,
    isMoving,
    direction
  };
}

module.exports = {
  computeDirection
};
