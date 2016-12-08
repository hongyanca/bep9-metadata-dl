const fetchMetadata = require('../index');

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

fetchMetadata(INFO_HASH, { maxConns: 10, fetchTimeout: 30000, socketTimeout: 5000 })
  .then(metadata => {
    console.log(`[Promise] ${metadata.info.name.toString('utf-8')}`);
  }).catch(err => {
  console.log(err);
});

// fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', {timeout: 5000},
//   (err, metadata) => {
//     if (err) {
//       console.log(err);
//       process.exit(1);
//     }
//     console.log(`[Callback] ${metadata.name.toString('utf-8')}`);
//   }
// );
//
// fetchMetadata.fromPeer(INFO_HASH, 'IP_ADDRESS:PORT', {timeout: 5000})
//   .then(metadata => {
//     console.log(`[Promise] ${metadata.name.toString('utf-8')}`);
//   })
//   .catch(err => {
//     console.log(err);
//     process.exit(1);
//   });