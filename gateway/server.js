import path from 'node:path';
import { fileURLToPath } from 'node:url';
import celigoLogger from '@celigo/logger';
import cors from 'cors';
import express from 'express';

const { logger } = celigoLogger;
const gatewayDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.resolve(gatewayDirectory, '../build');

/** All gateway environment reads and safe local defaults live here. */
const config = {
  port: Number(process.env.GATEWAY_PORT) || 4001,
  allowedOrigins: (process.env.GATEWAY_ALLOWED_ORIGINS ??
    'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

const app = express();

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || config.allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed to load this remote'));
    },
  })
);

/** The stable manifest URL must always revalidate after a deployment. */
app.get('/remoteEntry.js', (_request, response, next) => {
  response.set('Cache-Control', 'no-cache, must-revalidate');
  response.sendFile(path.join(buildDirectory, 'remoteEntry.js'), (error) => {
    if (error) next(error);
  });
});

/** Content-hashed assets can be cached permanently. */
app.use(
  '/assets',
  express.static(path.join(buildDirectory, 'assets'), {
    immutable: true,
    maxAge: '365d',
  })
);

app.use(express.static(buildDirectory, { index: false }));
app.get('*', (_request, response) => {
  response.sendFile(path.join(buildDirectory, 'index.html'));
});

app.use((error, request, response, _next) => {
  logger.error(
    `logName=gatewayRequestFailed, path=${request.path}, errorName=${error.name}`
  );
  response.status(403).type('text/plain').send('Forbidden');
});

app.listen(config.port);
