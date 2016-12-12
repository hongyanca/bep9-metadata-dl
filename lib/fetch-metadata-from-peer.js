const Protocol = require('bittorrent-protocol');
const ut_metadata = require('ut_metadata');
const addrToIPPort = require('addr-to-ip-port');
const randombytes = require('randombytes');
const bencode = require('bencode');
const crypto = require('crypto');
const net = require('net');
const utils = require('./utils');
const defaults = require('./defaults');

/*
 * If opts is specified, then the default options (shown below) will be overridden.
 *  {
 *    selfId: String,       // infohash of this DHT node. (default: a random infohash)
 *    socket: net.Socket,   // If not specified, a new socket will be created
 *    timeout: Number,      // Sets the socket to timeout after inactivity (default=5000)
 *  }
 */
module.exports = (infohash, peerAddress, opts = {}, callbackFn) => {
  utils.validateArgs(infohash, opts, callbackFn);
  const selfId = opts.selfId || randombytes(20);
  const socket = opts.socket || new net.Socket();
  const timeout = opts.timeout || defaults.DEFAULT_SOCKET_TIMEOUT;
  const peer = (typeof peerAddress === 'string') ?
    { address: addrToIPPort(peerAddress)[0], port: addrToIPPort(peerAddress)[1] } : peerAddress;

  return new Promise(function(resolve, reject) {
    socket.setTimeout(timeout, () => {
      socket.destroy();
      const err = new Error(`socket timeout after ${timeout}ms`);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });

    socket.connect(peer.port, peer.address, () => {
      const wire = new Protocol();
      socket.pipe(wire).pipe(socket);
      wire.use(ut_metadata());

      wire.handshake(infohash, selfId, { dht:true });
      wire.on('handshake', (ih, ip) => wire.ut_metadata.fetch());
      wire.ut_metadata.on('metadata', function (rawMetadata) {
        let metadata = null;
        try {
          metadata = bencode.decode(rawMetadata);
          const infohashOfRawMetadata = crypto.createHash('sha1').update(bencode.encode(metadata.info)).digest('hex');
          // Verify the infohash of received metadata.
          if (infohashOfRawMetadata.toString('hex') !== infohash) { metadata = null; }
        } catch (err) { metadata = null };
        socket.destroy();
        if (metadata === null) { return socket.emit('error', new Error('fail to fetch metadata')); }
        if (callbackFn) { callbackFn(null, metadata); }
        resolve(metadata);
      })
    });

    socket.on('error', err => {
      !socket.destroyed && socket.destroy();
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });
  });
};