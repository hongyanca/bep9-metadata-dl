const net = require('net');

class SocketPool {
  constructor() {
    this._pool = new Map();
    this._socketId = 0;
  }

  get size() {
    return this._pool.size;
  }

  createSocket() {
    const socket = new net.Socket();
    this._pool.set(++this._socketId, socket);
    return { socket, socketId: this._socketId };
  }

  destroySocket(socketId) {
    if (!this._pool.has(socketId)) return;
    const socket = this._pool.get(socketId);
    if (socket && !socket.destroyed) { socket.destroy(); }
    this._pool.delete(socketId);
  }

  destroyAllSockets() {
    for (let socket of this._pool.values()) { !socket.destroyed && socket.destroy(); }
    this._pool.clear();
  }
}

exports.createSocketPool = () => {
  return new SocketPool();
}

