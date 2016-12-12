const discover = require('./discover');
const utils = require('./utils');
const defaults = require('./defaults');

/*
 * If opts is specified, then the default options (shown below) will be overridden.
 *  {
 *    maxConns: Number,       // Max number of connections per infohash (default=5)
 *    fetchTimeout: Number,   // A timer scheduled to keep looking for metadata (default=20000)
 *    socketTimeout: Number,  // Sets the socket to timeout after inactivity (default=5000)
 *    dht: DHT instance       // Use external DHT instance (default=internael DHT instance)
 *  }
 */
module.exports = (infohash, opts = {}, callbackFn) => {
  utils.validateArgs(infohash, opts, callbackFn);

  const options = Object.assign({
    maxConns: defaults.DEFAULT_MAX_CONNS,
    fetchTimeout: defaults.DEFAULT_FETCH_TIMEOUT,
    socketTimeout: defaults.DEFAULT_SOCKET_TIMEOUT,
    dht: true},
    opts);

  return new Promise((resolve, reject) => {
    const discovery = discover(infohash, options);
    discovery.on('_bmd_metadata', metadata => {
      clearTimeout(timeoutHandle);
      if (callbackFn) { callbackFn(null, metadata); }
      resolve(metadata);
    });

    discovery.on('error', err => {
      discovery.destroy();
      clearTimeout(timeoutHandle);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    });

    const timeoutHandle = setTimeout(() => {
      const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
      discovery.emit('error', err);
    }, options.fetchTimeout);
  });
}
