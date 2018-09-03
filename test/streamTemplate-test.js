'use strict';

const { expect } = require('chai');
const getStream = require('get-stream');
const { Readable } = require('readable-stream');
const streamTemplate = require('../lib/streamTemplate.js');

function makeStream() {
  return new Readable({
    read: function() {}
  });
}

describe('streamTemplate()', () => {
  it('should interpolate primitive values', async () => {
    expect(await getStream(streamTemplate`hello ${'there'} ${1} ${true}`)).to.equal(
      'hello there 1 true'
    );
  });
  it('should interpolate null interpolations', async () => {
    expect(
      await getStream(streamTemplate`Hello ${'there'}, welcome to the ${undefined} ${null} test`)
    ).to.equal('Hello there, welcome to the  null test');
  });
  it('should interpolate stream values', async () => {
    const stream1 = makeStream();
    const stream2 = makeStream();
    stream2.push('wine', 'utf8');
    stream1.push('bread', 'utf8');
    stream2.push(' and more cheese', 'utf8');
    stream2.push(null);
    stream1.push(' and cheese', 'utf8');
    stream1.push(null);
    expect(await getStream(streamTemplate`First ${stream1} then ${stream2}!`)).to.equal(
      'First bread and cheese then wine and more cheese!'
    );
  });
  it('should wait for all data from a stream', async () => {
    const stream1 = makeStream();
    stream1.push('a', 'utf8');
    stream1.push('b', 'utf8');
    setImmediate(() => {
      stream1.push('c', 'utf8');
      setTimeout(() => {
        stream1.push('d', 'utf8');
        stream1.push(null);
      }, 20);
    });
    expect(await getStream(streamTemplate`${stream1}`)).to.equal('abcd');
  });
  it('should intepolate promises returning strings', async () => {
    const promise = Promise.resolve('hello');
    expect(await getStream(streamTemplate`${promise} world`)).to.equal('hello world');
  });
  it('should interpolate promises returning streams', async () => {
    const stream1 = makeStream();
    const promise = Promise.resolve(stream1);
    stream1.push('hello');
    stream1.push(null);
    expect(await getStream(streamTemplate`${promise} world`)).to.equal('hello world');
  });
  it('should interpolate arrays', async () => {
    const stream1 = makeStream();
    const stream2 = makeStream();
    stream1.push('there ');
    stream2.push('world');
    stream1.push(null);
    stream2.push(null);
    const array = ['hello ', Promise.resolve(stream1), stream2, [", how's ", 'it ', 'going']];
    expect(await getStream(streamTemplate`Well ${array}?`)).to.equal(
      'Well hello there world, how&#x27;s it going?'
    );
  });
  it('should interpolate sync iterators', async () => {
    const stream1 = makeStream();
    const stream2 = makeStream();
    stream1.push('there ');
    stream2.push('world');
    stream1.push(null);
    stream2.push(null);
    const array = ['hello ', Promise.resolve(stream1), stream2, [", how's ", 'it ', 'going']];
    expect(await getStream(streamTemplate`Well ${array[Symbol.iterator]()}?`)).to.equal(
      'Well hello there world, how&#x27;s it going?'
    );
  });
  it('should concatenate multiple strings together and emit as a single chunk', (done) => {
    const promise = Promise.resolve('d');
    const out = streamTemplate`a ${'b'} c ${promise} e ${['f', ' g']}`;
    let chunks = [];
    out.on('data', (chunk) => chunks.push(chunk.toString()));
    out.on('end', () => {
      expect(chunks).eql(['a b c ', 'd e f g']);
      done();
    });
  });
  it('should forward stream errors', (done) => {
    const s = makeStream();
    const out = streamTemplate`${s}`;
    out.on('error', (err) => {
      expect(err.message).to.equal('destroyed');
      done();
    });
    s.destroy(new Error('destroyed'));
  });
  it('should destroy source streams on error', (done) => {
    let destroyed = false;
    const s = Readable({
      read: function() {},
      destroy: function() {
        destroyed = true;
      }
    });
    const out = streamTemplate`${s}`;
    out.on('close', () => {
      expect(destroyed).to.equal(true);
      done();
    });
    out.destroy();
  });
  it('should destroy source streams on Promise error', (done) => {
    const promise = Promise.reject(Error('destroyed'));
    const out = streamTemplate`${promise} world`;
    out.on('error', (err) => {
      expect(err.message).to.equal('destroyed');
      done();
    });
  });
});
