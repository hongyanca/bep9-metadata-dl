const crypto = require('crypto');

exports.DEFAULT_SOCKET_TIMEOUT = 5000;

exports.randomInfohash = () =>
  crypto.createHash('sha1').update(crypto.randomBytes(20)).digest().toString('hex');

exports.validateArgs = (infohash, opts, callbackFn) => {
  if (infohash.match(/^[0-9a-fA-F]{40}$/) === null) {
    throw new Error('Invalid infohash.');
  }
  if (opts && typeof opts !== 'object') {
    throw new Error('opts argument must be a plain old Javascript object.');
  }
  if (callbackFn && typeof callbackFn != 'function') {
    throw new Error('callbackFn argument must be a Javascript function.');
  }
}

exports.stringToAddressObj = addressString => {
  if (typeof addressString !== 'string') { return null; }
  const match = /^((?:\d+\.){3}\d+):(\d+)$/.exec(addressString);
  if (match === null) { return null; }
  return { address: match[1], port: match[2] };
}