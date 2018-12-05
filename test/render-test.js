import { html as browserHtml, renderToString as browserRenderToString } from '../lib/browser.js';
import { html, render, renderToString } from '../lib/index.js';
import { expect } from 'chai';
import getStream from 'get-stream';
import { normalizeWhitespace } from './utils.js';

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
