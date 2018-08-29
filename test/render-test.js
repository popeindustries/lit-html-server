'use srict';

const { render, html } = require('../index.js');
const { expect } = require('chai');
const getStream = require('get-stream');

describe('render()', () => {
  it.only('should return a Readable stream when rendering a synchronous template', async () => {
    const template = html`<h1>Some ${'title'}</h1>`;
    expect(await getStream(render(template))).to.equal('<h1>Some title</h1>');
  });
  it('should return a Readable stream when rendering an asynchronous template', async () => {
    const template = html`<h1>Some ${Promise.resolve('title')}</h1>`;
    expect(await getStream(render(template))).to.equal('<h1>Some title</h1>');
  });
});
