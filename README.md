# ssehub-storage-leveldb

[![npm version](http://img.shields.io/npm/v/ssehub-storage-leveldb.svg?style=flat-square)](http://browsenpm.org/package/ssehub-storage-leveldb)[![Build Status](http://img.shields.io/travis/vgno/ssehub-storage-leveldb/master.svg?style=flat-square)](https://travis-ci.org/vgno/ssehub-storage-leveldb)[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/vgno/ssehub-storage-leveldb.svg?style=flat-square)](https://codeclimate.com/github/vgno/ssehub-storage-leveldb)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ssehub-storage-leveldb.svg?style=flat-square)](https://codeclimate.com/github/vgno/ssehub-storage-leveldb/)

LevelDB storage for the node SSE Hub backend.

## Installing

```
npm install --save ssehub-storage-leveldb
```

## Basic usage

In your `ssehub-backend` installation, `config.js`:

```js
var LevelStorage = require('ssehub-storage-leveldb');
var level = new LevelStorage({
    dataPath: '/some/path/to/data'
});

module.exports = {
    storage: level
};
```

## License

MIT-licensed. See LICENSE.
