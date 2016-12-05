const Discovery = require('torrent-discovery');
const ut_metadata = require('ut_metadata');
const net = require('net');
const fetchMetadataFromPeer = require('./fetch-metadata-from-peer');
const utils = require('./utils');
const SocketPool = require('./socket-pool');

const THIS_PORT = 65534;    // THIS_PORT is used when an announce message has been sent to the DHT.
const SELF_ID = utils.randomInfohash();

module.exports = (infohash, opts = {}) => {
  const discovery = new Discovery({ infoHash: infohash, peerId: SELF_ID, port: THIS_PORT, dht: true });

  const peerQueue = [];
  const socketPool = SocketPool.createSocketPool();

  discovery.on('peer', peer => {
    const peerAddress = utils.stringToAddressObj(peer);
    peerAddress && (peerAddress.port != THIS_PORT) && discovery.emit('_bmd_peer_found', peerAddress);
  });

  discovery.on('_bmd_peer_found', peerAddress => {
    if (socketPool.size >= opts.maxConns) { return peerQueue.push(peerAddress); }
    const { socket, socketId } = socketPool.createSocket();
    fetchMetadataFromPeer(infohash, peerAddress, { selfId: SELF_ID, socket, timeout: opts.socketTimeout })
      .then(metadata => {
        socketPool.destroyAllSockets();
        // console.log(`peer: ${peerAddress.address}:${peerAddress.port}`);       // <--DEBUG---------------------------
        discovery.emit('_bmd_metadata', metadata);
        discovery.removeAllListeners().destroy();
      })
      .catch(err => {
        // console.log(err);                                                      // <--DEBUG---------------------------
        socketPool.destroySocket(socketId);
        if (peerQueue.length > 0) { discovery.emit('_bmd_peer_found', peerQueue.shift()); }
      })
  });

  return discovery;
}