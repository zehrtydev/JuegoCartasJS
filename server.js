import jsonServer from 'json-server';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const server = jsonServer.create();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(currentDirectory, 'src', 'data', 'db.json');
const router = jsonServer.router(databasePath);
const port = Number(process.env.PORT) || 3000;

// Railway can override this with a comma-separated CORS_ORIGINS variable.
const allowedOrigins = (process.env.CORS_ORIGINS || [
  'https://juego-cartas-js.vercel.app',
  'http://localhost:5173',
].join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

server.use((request, response, next) => {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.sendStatus(204);
  }

  return next();
});

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(router);

server.listen(port, '0.0.0.0', () => {
  console.log(`Card Battle API listening on port ${port}`);
});
