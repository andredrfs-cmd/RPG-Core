export function createNetwork({ onMessage, onStatus }) {
  let socket;

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.addEventListener('open', () => onStatus('open'));
    socket.addEventListener('message', (event) => onMessage(JSON.parse(event.data)));
    socket.addEventListener('close', () => onStatus('close'));
    socket.addEventListener('error', () => onStatus('error'));
  }

  function send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  function isOpen() {
    return socket && socket.readyState === WebSocket.OPEN;
  }

  return { connect, send, isOpen };
}
