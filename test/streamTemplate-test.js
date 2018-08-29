const concat = require('concat-stream');
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
  it('should interpolate string values', async () => {
    expect(await getStream(streamTemplate`hello ${'there'}`)).to.equal('hello there');
  });
  it('should interpolate stream values', (done) => {
    const stream1 = makeStream();
    const stream2 = makeStream();
    const out = streamTemplate`First ${stream1} then ${stream2}!`;
    out.pipe(
      concat(function(output) {
        expect(output.toString()).to.equal('First bread and cheese then wine and more cheese!');
        done();
      })
    );
    stream2.push('wine', 'utf8');
    stream1.push('bread', 'utf8');
    stream2.push(' and more cheese', 'utf8');
    stream2.push(null);
    stream1.push(' and cheese', 'utf8');
    stream1.push(null);
  });
  it('should wait for all data from a stream', (done) => {
    const stream1 = makeStream();
    stream1.push('a', 'utf8');
    const out = streamTemplate`${stream1}`;
    out.pipe(
      concat((output) => {
        expect(output.toString()).to.equal('abcd');
        done();
      })
    );
    stream1.push('b', 'utf8');
    setImmediate(() => {
      stream1.push('c', 'utf8');
      setTimeout(() => {
        stream1.push('d', 'utf8');
        stream1.push(null);
      }, 20);
    });
  });
  it('should intepolate promises returning strings', (done) => {
    const promise = Promise.resolve('hello');
    const out = streamTemplate`${promise} world`;
    out.pipe(
      concat((output) => {
        expect(output.toString()).to.equal('hello world');
        done();
      })
    );
  });
  it('should interpolate promises returning streams', (done) => {
    const stream1 = makeStream();
    const promise = Promise.resolve(stream1);
    const out = streamTemplate`${promise} world`;
    out.pipe(
      concat((output) => {
        expect(output.toString()).to.equal('hello world');
        done();
      })
    );
    stream1.push('hello');
    stream1.push(null);
  });
  it('should interpolate arrays', (done) => {
    const stream1 = makeStream();
    const stream2 = makeStream();
    stream1.push('there ');
    stream2.push('world');
    stream1.push(null);
    stream2.push(null);
    const array = ['hello ', Promise.resolve(stream1), stream2, [", how's ", 'it ', 'going']];
    const out = streamTemplate`Well ${array}?`;
    out.pipe(
      concat((output) => {
        expect(output.toString()).to.equal("Well hello there world, how's it going?");
        done();
      })
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
  it('should handle null interpolations', (done) => {
    const name = 'tom';
    const test = undefined;
    const out = streamTemplate`Hello ${name}, welcome to the ${test} ${null} test`;
    out.pipe(
      concat((output) => {
        expect(output.toString()).to.equal('Hello tom, welcome to the undefined null test');
        done();
      })
    );
  });
});
