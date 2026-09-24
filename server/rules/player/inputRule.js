function parseInputs(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    up: value.up === true,
    down: value.down === true,
    left: value.left === true,
    right: value.right === true
  };
}

module.exports = {
  parseInputs
};
