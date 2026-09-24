const fs = require('fs');
const path = require('path');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function createStaticServer(clientDirectory) {
  const clientRoot = path.resolve(clientDirectory);

  return function serveClient(request, response) {
    const requestPath = new URL(request.url, 'http://localhost').pathname;
    const requestedPath = requestPath === '/' ? '/index.html' : requestPath;
    const filePath = path.resolve(path.join(clientRoot, requestedPath));

    if (filePath !== clientRoot && !filePath.startsWith(`${clientRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Acesso negado');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500, {
          'Content-Type': 'text/plain; charset=utf-8'
        });
        response.end(error.code === 'ENOENT' ? 'Arquivo não encontrado' : 'Erro interno');
        return;
      }

      response.writeHead(200, {
        'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      });
      response.end(content);
    });
  };
}

module.exports = { createStaticServer };
