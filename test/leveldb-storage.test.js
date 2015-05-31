'use strict';

var os = require('os');
var runAfter = require('lodash.after');
var pathjoin = require('path').join;
var rimraf = require('rimraf');
var expect = require('chai').expect;
var LevelStorage = require('../');

describe('leveldb storage', function() {
    var storage, dataPath;

    beforeEach(function() {
        dataPath = pathjoin(os.tmpdir(), 'ssehub-leveldb-' + Date.now());
        storage = new LevelStorage({
            dataPath: dataPath
        });
    });

    afterEach(function(done) {
        storage.disconnect(function(closeErr) {
            failOnError(closeErr);
            setTimeout(function() {
                rimraf(dataPath, function(rimErr) {
                    failOnError(rimErr);
                    done();
                });
            }, 50);
        });
    });

    it('implicitly connects', function(done) {
        storage.getMessages('/some/path', 500, function(err) {
            failOnError(err);
            done();
        });
    });

    it('can explicitly be told to connect', function(done) {
        storage.connect();
        storage.getMessages('/some/path', 500, function(err) {
            failOnError(err);
            done();
        });
    });

    it('calls callback on connect', function(done) {
        storage.connect(done);
    });

    it('only connects once', function(done) {
        var client1 = storage.connect();
        var client2 = storage.connect();
        var client3 = storage.connect(done);

        expect(client1).to.equal(client2);
        expect(client1).to.equal(client3);
    });

    it('can set and get messages', function(done) {
        var path = '/some/path';
        storage.storeMessage(path, { data: 'foobar' }, { sync: true }, function(err) {
            failOnError(err);

            storage.getMessages(path, 500, function(getErr, msgs) {
                failOnError(getErr);
                expect(msgs).to.have.length(1);
                expect(msgs[0].data).to.equal('foobar');
                done();
            });
        });
    });

    it('doesnt blow up if storeMessage is called after explicitly connecting', function(done) {
        var path = '/some/path';
        storage.connect();
        storage.storeMessage(path, { data: 'foobar' }, null, function(err) {
            failOnError(err);
            done();
        });
    });

    it('doesnt blow up if getMessages is called after explicitly connecting', function(done) {
        var path = '/some/path';
        storage.connect();
        storage.getMessages(path, 500, function(err) {
            failOnError(err);
            done();
        });
    });

    it('can fetch with limit', function(done) {
        var path = '/some/path', id = 0;

        var whenDone = runAfter(49, function() {
            storage.getMessages(path, 9, function(err, messages) {
                failOnError(err);
                expect(messages).to.have.length(9);
                expect(messages[0].data).to.equal('Message #49');
                expect(messages[8].data).to.equal('Message #41');
                done();
            });
        });

        var storeDone = function(err) {
            failOnError(err);
            whenDone();
        };

        while (++id < 50) {
            storage.storeMessage(path, { id: id, data: 'Message #' + id }, { sync: false }, storeDone);
        }
    });

    it('lifts client errors events to storage error events', function(done) {
        var err = new Error('Some error');

        storage.on('error', function(liftedError) {
            expect(liftedError).to.equal(err);
            done();
        });

        storage.connect().emit('error', err);
    });

    it('can be told to disconnect and calls callback when done', function(done) {
        storage.disconnect(function(err) {
            failOnError(err);
            done();
        });
    });

    it('can disconnect after interacting with database', function(done) {
        storage.getMessages('/some/other/path', 500, function() {
            storage.disconnect(function(err) {
                failOnError(err);
                done();
            });
        });
    });
});

function failOnError(err) {
    expect(err).to.not.be.ok;
}
