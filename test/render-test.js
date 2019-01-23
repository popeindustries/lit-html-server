import { html as h, renderToStream, renderToString } from '../src/index.js';
import { expect } from 'chai';
import getStream from 'get-stream';

describe('Rendering', () => {
  it('should render a template', async () => {
    const data = { title: 'title', body: 'this is body text' };
    const result = h`<main><h1>${data.title}</h1><div>${data.body}</div></main>`;
    const expected = '<main><h1>title</h1><div>this is body text</div></main>';
    expect(await renderToString(result)).to.equal(expected);
    expect(await getStream(renderToStream(result))).to.equal(expected);
  });
  it('should render a template with nested template', async () => {
    const data = { title: 'title', body: 'this is body text' };
    const nested = (body) => h`<div>${body}</div>`;
    const result = h`<main><h1>${data.title}</h1>${nested(data.body)}</main>`;
    const expected = '<main><h1>title</h1><div>this is body text</div></main>';
    expect(await renderToString(result)).to.equal(expected);
    expect(await getStream(renderToStream(result))).to.equal(expected);
  });
  it('should render a template with nested async template', async () => {
    const data = { title: 'title', body: 'this is body text' };
    const nested = async (body) => h`<div>${body}</div>`;
    const result = h`<main><h1>${data.title}</h1>${nested(data.body)}</main>`;
    const expected = '<main><h1>title</h1><div>this is body text</div></main>';
    expect(await renderToString(result)).to.equal(expected);
    expect(await getStream(renderToStream(result))).to.equal(expected);
  });
  it('should render a template with deeply nested sync/async templates', async () => {
    const data = { title: 'title', body: 'this is body text' };
    const nestedVeryDeep = async () => ['and ', "don't ", 'forget ', ['this']];
    const nestedDeep = async () => h`<div>this too ${nestedVeryDeep()}</div>`;
    const nested = async (body) => h`<div>${body} ${nestedDeep()}</div>`;
    const result = h`<main><h1>${data.title}</h1>${nested(data.body)}</main>`;
    const expected =
      '<main><h1>title</h1><div>this is body text <div>this too and don&#x27;t forget this</div></div></main>';
    expect(await renderToString(result)).to.equal(expected);
    expect(await getStream(renderToStream(result))).to.equal(expected);
  });
});
