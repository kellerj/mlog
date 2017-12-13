#!/usr/bin/env node

/**
 * @file Server startup script.
 * @author Jonathan Keller
 */
import chalk from 'chalk';
import http from 'http';

// const LOG = require('debug')('tt:server');

import app from './app';

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      throw new Error(`Port ${port} requires elevated privileges`);
    case 'EADDRINUSE':
      throw new Error(`Port ${port} is already in use`);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  process.stdout.write(chalk.green(`Server Up and Listening on http://${addr.address}:${addr.port}\n`));
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, '127.0.0.1');
server.on('error', onError);
server.on('listening', onListening);
