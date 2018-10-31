'use strict';

const { expect } = require('chai');
const promiseHtmlTemplate = require('../lib/promiseHtmlTemplate.js');

describe('promiseHtmlTemplate', () => {
  it('should interpolate primitive values', async () => {
    expect(await promiseHtmlTemplate`hello ${'there'} ${1} ${true}`).to.equal('hello there 1 true');
  });
  it('should interpolate null interpolations', async () => {
    expect(
      await promiseHtmlTemplate`Hello ${'there'}, welcome to the ${undefined} ${null} test`
    ).to.equal('Hello there, welcome to the  null test');
  });
  it('should intepolate promises returning strings', async () => {
    const promise = Promise.resolve('hello');
    expect(await promiseHtmlTemplate`${promise} world`).to.equal('hello world');
  });
  it('should interpolate arrays', async () => {
    const array = ['hello ', Promise.resolve('there '), 'world', [", how's ", 'it ', 'going']];
    expect(await promiseHtmlTemplate`Well ${array}?`).to.equal(
      'Well hello there world, how&#x27;s it going?'
    );
  });
  it('should interpolate sync iterators', async () => {
    const array = ['hello ', Promise.resolve('there '), 'world', [", how's ", 'it ', 'going']];
    expect(await promiseHtmlTemplate`Well ${array[Symbol.iterator]()}?`).to.equal(
      'Well hello there world, how&#x27;s it going?'
    );
  });
  it('should reject on Promise error', (done) => {
    const promise = Promise.reject(Error('destroyed'));
    promiseHtmlTemplate`${promise} world`.catch((err) => {
      expect(err.message).to.equal('destroyed');
      done();
    });
  });
});
