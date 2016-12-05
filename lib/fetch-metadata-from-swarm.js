const discover = require('./discover');
const utils = require('./utils');

const DEFAULT_MAX_CONNS = 5;
const DEFAULT_FETCH_TIMEOUT = 20000;
const DEFAULT_SOCKET_TIMEOUT = utils.DEFAULT_SOCKET_TIMEOUT;

/*
 * If opts is specified, then the default options (shown below) will be overridden.
 *  {
 *    maxConns: Number,       // Max number of connections per infohash (default=5)
 *    fetchTimeout: Number,   // A timer scheduled to keep looking for metadata (default=20000)
 *    socketTimeout: Number   // Sets the socket to timeout after inactivity (default=5000)
 *  }
 */
module.exports = (infohash, opts = {}, callbackFn) => {
  utils.validateArgs(infohash, opts, callbackFn);

  const options = Object.assign({
    maxConns: DEFAULT_MAX_CONNS,
    fetchTimeout: DEFAULT_FETCH_TIMEOUT,
    socketTimeout: DEFAULT_SOCKET_TIMEOUT},
    opts);

  return new Promise((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      const err = new Error(`fetchMetadataFromSwarm timeout after ${options.fetchTimeout}ms`);
      if (callbackFn) { callbackFn(err); }
      reject(err);
    }, options.fetchTimeout);

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
  });
}
