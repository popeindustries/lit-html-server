import { expect } from 'chai';
import getStream from 'get-stream';
import promiseAsyncHtmlTemplate from '../src/promiseAsyncHtmlTemplate.js';
import { Readable } from 'stream';
import streamAsyncHtmlTemplate from '../src/streamAsyncHtmlTemplate.js';

function makeStream() {
  return new Readable({
    read: function() {}
  });
}

describe('streamAsyncHtmlTemplate()', () => {
  describe('server', () => {
    it('should interpolate primitive values', async () => {
      expect(await getStream(streamAsyncHtmlTemplate`hello ${'there'} ${1} ${true}`)).to.equal(
        'hello there 1 true'
      );
    });
    it('should interpolate null interpolations', async () => {
      expect(
        await getStream(
          streamAsyncHtmlTemplate`Hello ${'there'}, welcome to the ${undefined} ${null} test`
        )
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
      expect(await getStream(streamAsyncHtmlTemplate`First ${stream1} then ${stream2}!`)).to.equal(
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
      expect(await getStream(streamAsyncHtmlTemplate`${stream1}`)).to.equal('abcd');
    });
    it('should intepolate promises returning strings', async () => {
      const promise = Promise.resolve('hello');
      expect(await getStream(streamAsyncHtmlTemplate`${promise} world`)).to.equal('hello world');
    });
    it('should interpolate promises returning streams', async () => {
      const stream1 = makeStream();
      const promise = Promise.resolve(stream1);
      stream1.push('hello');
      stream1.push(null);
      expect(await getStream(streamAsyncHtmlTemplate`${promise} world`)).to.equal('hello world');
    });
    it('should interpolate arrays', async () => {
      const stream1 = makeStream();
      const stream2 = makeStream();
      stream1.push('there ');
      stream2.push('world');
      stream1.push(null);
      stream2.push(null);
      const array = ['hello ', Promise.resolve(stream1), stream2, [", how's ", 'it ', 'going']];
      expect(await getStream(streamAsyncHtmlTemplate`Well ${array}?`)).to.equal(
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
      expect(await getStream(streamAsyncHtmlTemplate`Well ${array[Symbol.iterator]()}?`)).to.equal(
        'Well hello there world, how&#x27;s it going?'
      );
    });
    it('should concatenate multiple strings together and emit as a single chunk', (done) => {
      const promise = Promise.resolve('d');
      const out = streamAsyncHtmlTemplate`a ${'b'} c ${promise} e ${['f', ' g']}`;
      let chunks = [];
      out.on('data', (chunk) => chunks.push(chunk.toString()));
      out.on('end', () => {
        expect(chunks).eql(['a b c ', 'd e f g']);
        done();
      });
    });
    it('should forward stream errors', (done) => {
      const s = makeStream();
      const out = streamAsyncHtmlTemplate`${s}`;
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
      const out = streamAsyncHtmlTemplate`${s}`;
      out.on('close', () => {
        expect(destroyed).to.equal(true);
        done();
      });
      out.destroy();
    });
    it('should destroy source streams on Promise error', (done) => {
      const promise = Promise.reject(Error('destroyed'));
      const out = streamAsyncHtmlTemplate`${promise} world`;
      out.on('error', (err) => {
        expect(err.message).to.equal('destroyed');
        done();
      });
    });
    it('should destroy source streams on thrown error in Promise', (done) => {
      const promise = new Promise(() => {
        throw Error('destroyed');
      });
      const out = streamAsyncHtmlTemplate`${promise} world`;
      out.on('error', (err) => {
        expect(err.message).to.equal('destroyed');
        done();
      });
    });
  });

  describe('browser', () => {
    it('should interpolate primitive values', async () => {
      expect(await promiseAsyncHtmlTemplate`hello ${'there'} ${1} ${true}`).to.equal(
        'hello there 1 true'
      );
    });
    it('should interpolate null interpolations', async () => {
      expect(
        await promiseAsyncHtmlTemplate`Hello ${'there'}, welcome to the ${undefined} ${null} test`
      ).to.equal('Hello there, welcome to the  null test');
    });
    it('should intepolate promises returning strings', async () => {
      const promise = Promise.resolve('hello');
      expect(await promiseAsyncHtmlTemplate`${promise} world`).to.equal('hello world');
    });
    it('should interpolate arrays', async () => {
      const array = ['hello ', Promise.resolve('there '), 'world', [", how's ", 'it ', 'going']];
      expect(await promiseAsyncHtmlTemplate`Well ${array}?`).to.equal(
        'Well hello there world, how&#x27;s it going?'
      );
    });
    it('should interpolate sync iterators', async () => {
      const array = ['hello ', Promise.resolve('there '), 'world', [", how's ", 'it ', 'going']];
      expect(await promiseAsyncHtmlTemplate`Well ${array[Symbol.iterator]()}?`).to.equal(
        'Well hello there world, how&#x27;s it going?'
      );
    });
    it('should reject on Promise error', (done) => {
      const promise = Promise.reject(Error('destroyed'));
      promiseAsyncHtmlTemplate`${promise} world`.catch((err) => {
        expect(err.message).to.equal('destroyed');
        done();
      });
    });
  });
});
