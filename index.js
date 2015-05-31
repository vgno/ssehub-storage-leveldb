'use strict';

var runAfter = require('lodash.after');
var level = require('level');
var sub = require('level-sublevel');
var util = require('util');
var events = require('events');

function LevelDbStorage(config) {
    this.config = config;
    this.dbs = {};
    this.msgNumber = 0;
}

util.inherits(LevelDbStorage, events.EventEmitter);

LevelDbStorage.prototype.connect = function(callback) {
    if (!this.client) {
        this.client = sub(level(this.config.dataPath, { valueEncoding: 'json' }));

        this.client.on('error', function(e) {
            this.emit('error', e);
        }.bind(this));
    }

    if (callback) {
        process.nextTick(callback);
    }

    return this.client;
};

LevelDbStorage.prototype.getDbForPath = function(path) {
    if (!this.client) {
        this.connect();
    }

    var db = this.dbs[path];
    if (!db) {
        db = this.dbs[path] = this.client.sublevel(path);
    }

    return db;
};

LevelDbStorage.prototype.storeMessage = function(path, msg, options, callback) {
    var key = invertKey(Date.now() + '-' + (++this.msgNumber));
    this.getDbForPath(path).put(key, msg, options || {}, callback);
};

LevelDbStorage.prototype.getMessages = function(path, limit, callback) {
    var items = [];
    this.getDbForPath(path).createValueStream({ limit: limit })
        .on('error', function(err) {
            callback(err);
        })
        .on('data', function(data) {
            items.push(data);
        })
        .on('end', function() {
            callback(null, items);
        });
};

LevelDbStorage.prototype.disconnect = function(callback) {
    var client = this.client;
    var numPaths = Object.keys(this.dbs).length;

    if (!client) {
        return process.nextTick(callback);
    } else if (numPaths === 0) {
        return client.close(callback);
    }

    var whenDone = runAfter(numPaths, function() {
        client.close(callback);
    });

    for (var sublvl in this.dbs) {
        this.dbs[sublvl].close(whenDone);
    }
};

function invertKey(s) {
    return (s + '').split('').map(invertChar).join('');
}

function invertChar(c) {
    return String.fromCharCode(255 - c.charCodeAt(0));
}

module.exports = LevelDbStorage;
