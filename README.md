# bep9-metadata-dl

### Download the metadata from peers using infohash only

This module uses [bittorrent-protocol](https://github.com/feross/bittorrent-protocol), [ut_metadata](https://github.com/feross/ut_metadata) and
[torrent-discovery](https://github.com/feross/torrent-discovery) modules of [WebTorrent](https://github.com/feross/webtorrent) to download the info-dictionary part of a .torrent file using infohash of magnet links only.

## Features

- Simple API with callback and Promise interface
- Find peers from the DHT network

## install

```
npm install bep9-metadata-dl
```

## API

### `fetchMetadata(infohash, [opts], [callbackFn])`
### `fetchMetadata.fromPeer(infohash, peerAddress, [opts], [callbackFn])`

Optional options are:
```js
{ 
  maxConns: 10,           // Maximum connections to peers, (default=5) 
  fetchTimeout: 30000,    // A timer scheduled to keep looking for metadata (default=20000)
  socketTimeout: 5000,    // Sets the socket to timeout after inactivity (default=5000)
  dht: DHT instance       // Use external DHT instance (default=internael DHT instance)
}
```

### Example:
```js
const fetchMetadata = require('bep9-metadata-dl');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000 },
  (err, metadata) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`[Callback] ${metadata.info.name.toString('utf-8')}`);
});
```
### Or Promise based:
```js
const fetchMetadata = require('bep9-metadata-dl');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000 })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```
### Re-use DHT instance:
```js
const DHT = require('bittorrent-dht');
const fetchMetadata = require('bep9-metadata-dl');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458';
// infohash of ubuntu-16.04.1-desktop-amd64.iso
const INFO_HASH2 = '9f9165d9a281a9b8e782cd5176bbcc8256fd1871';
// Check https://github.com/feross/bittorrent-dht for DHT opts
const dht = new DHT({ concurrency: 32 });

// Use designated DHT instance.
fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000, dht })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});

// Re-use DHT instance.
fetchMetadata(INFO_HASH2, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000, dht })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```
### Download directly from a peer:
```js
const fetchMetadata = require('bep9-metadata-dl');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', { timeout: 5000 }, 
  (err, metadata) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`[Callback] ${metadata.info.name.toString('utf-8')}`);
});
```
### Download directly from a peer, Promise based:
```js
const fetchMetadata = require('bep9-metadata-dl');

// infohash of ubuntu-16.04.1-server-amd64.iso
const INFO_HASH = '90289fd34dfc1cf8f316a268add8354c85334458'; 

fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', { timeout: 5000 })
.then(metadata => {
  console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
}).catch(err => {
  console.log(err);
});
```

## License

MIT © [Hong Yan](https://github.com/homeryan).
