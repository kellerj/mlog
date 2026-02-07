#!/usr/bin/env node

/**
 * @file Server startup script.
 * @author Jonathan Keller
 */
import chalk from 'chalk';
import http from 'node:http';

import app from './app.js';

const server = http.createServer(app);

const port = process.env.PORT || '3000';
app.set('port', port);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      throw new Error(`Port ${port} requires elevated privileges`);
    case 'EADDRINUSE':
      throw new Error(`Port ${port} is already in use`);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  process.stdout.write(chalk.green(`Server Up and Listening on http://${addr.address}:${addr.port}\n`));
}

server.listen(port, '127.0.0.1');
server.on('error', onError);
server.on('listening', onListening);
