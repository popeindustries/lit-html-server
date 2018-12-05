'use srict';

const { html, render, renderToString } = require('../lib/index.js');
const { html: browserHtml, renderToString: browserRenderToString } = require('../lib/browser.js');
const { expect } = require('chai');
const getStream = require('get-stream');
const { normalizeWhitespace } = require('./utils.js');

describe('render()', () => {
  it('should return a Readable stream when rendering a synchronous template', async () => {
    const template = html`
      <h1>Some ${'title'}</h1>
    `;
    expect(normalizeWhitespace(await getStream(render(template)))).to.equal('<h1>Some title</h1>');
  });
  it('should return a Readable stream when rendering an asynchronous template', async () => {
    const template = html`
      <h1>Some ${Promise.resolve('title')}</h1>
    `;
    expect(normalizeWhitespace(await getStream(render(template)))).to.equal('<h1>Some title</h1>');
  });
});

describe('renderToString()', () => {
  it('should return a Promise when rendering a synchronous template', async () => {
    const template = html`
      <h1>Some ${'title'}</h1>
    `;
    expect(normalizeWhitespace(await renderToString(template))).to.equal('<h1>Some title</h1>');
  });
  it('should return a Promise when rendering an asynchronous template', async () => {
    const template = html`
      <h1>Some ${Promise.resolve('title')}</h1>
    `;
    expect(normalizeWhitespace(await renderToString(template))).to.equal('<h1>Some title</h1>');
  });
});

describe('browser', () => {
  describe('renderToString()', () => {
    it('should return a Promise when rendering a synchronous template', async () => {
      const template = browserHtml`<h1>Some ${'title'}</h1>`;
      expect(normalizeWhitespace(await browserRenderToString(template))).to.equal(
        '<h1>Some title</h1>'
      );
    });
    it('should return a Promise when rendering an asynchronous template', async () => {
      const template = browserHtml`<h1>Some ${Promise.resolve('title')}</h1>`;
      expect(normalizeWhitespace(await browserRenderToString(template))).to.equal(
        '<h1>Some title</h1>'
      );
    });
  });
});
