export function createInputController(sendInputs, canSend) {
  const inputs = { up: false, down: false, left: false, right: false };
  const mapping = {
    w: 'up', arrowup: 'up',
    s: 'down', arrowdown: 'down',
    a: 'left', arrowleft: 'left',
    d: 'right', arrowright: 'right'
  };

  function update(key, pressed) {
    const direction = mapping[key.toLowerCase()];
    if (!direction || inputs[direction] === pressed) return;
    inputs[direction] = pressed;
    if (canSend()) sendInputs(inputs);
  }

  function onKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    update(event.key, true);
  }

  function onKeyUp(event) {
    update(event.key, false);
  }

  function reset() {
    Object.keys(inputs).forEach((key) => { inputs[key] = false; });
    if (canSend()) sendInputs(inputs);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', reset);

  return { reset };
}
