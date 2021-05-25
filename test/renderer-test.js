// Disable Prettier
// @ts-nocheck
import { createAsyncIterable, streamAsPromise } from './utils.js';
import { html as h, renderToStream, renderToString } from '../src/index.js';
import { expect } from 'chai';

describe('Server template render', () => {
  describe('text', () => {
    it('should render a plain text template', async () => {
      const result = () => h`text`;
      const expected = 'text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with text value', async () => {
      const result = () => h`${'text'}`;
      const expected = 'text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with number value', async () => {
      const result = () => h`${1}`;
      const expected = '1';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with boolean value', async () => {
      const result = () => h`${true}`;
      const expected = 'true';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with null value', async () => {
      const result = () => h`${null}`;
      const expected = 'null';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with undefined value', async () => {
      const result = () => h`${undefined}`;
      const expected = '';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with array value', async () => {
      const result = () => h`${[1, 2, 3]}`;
      const expected = '123';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with deeply nested array value', async () => {
      const result = () => h`${[1, 2, [3, [4, 5]]]}`;
      const expected = '12345';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with sync iterator value', async () => {
      const array = ['hello ', 'there ', 'world', [", how's ", 'it ', 'going']];
      const result = () => h`Well ${array[Symbol.iterator]()}?`;
      const expected = 'Well hello there world, how&#x27;s it going?';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with nested template value', async () => {
      const result = () => h`some ${h`text`}`;
      const expected = 'some text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with array of nested template values', async () => {
      const result = () => h`some ${[1, 2, 3].map((i) => h`${i}`)} text`;
      const expected = 'some 123 text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with Promise value', async () => {
      const result = () => h`${Promise.resolve('some')} text`;
      const expected = 'some text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with Promise template value', async () => {
      const result = () => h`${Promise.resolve(h`some`)} text`;
      const expected = 'some text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should not render a template with Promise errors', async () => {
      const result = () => h`${Promise.reject(Error('errored!'))}`;
      try {
        const html = await renderToString(result());
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should not render a template with Promises that throw errors', async () => {
      const result = () =>
        h`${new Promise(() => {
          throw Error('errored!');
        })}`;
      try {
        const html = await renderToString(result());
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should render a template with AsyncIterator value', async () => {
      const result = () => h`${createAsyncIterable(['some', ' async'])} text`;
      const expected = 'some async text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with AsyncIterator template value', async () => {
      const result = () => h`${createAsyncIterable([h`some`, h` async`])} text`;
      const expected = 'some async text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with deeply nested sync/async templates', async () => {
      const data = { title: 'title', body: 'this is body text' };
      const nestedVeryDeep = async () => ['and ', "don't ", 'forget ', ['this']];
      const nestedDeep = async () => h`<div>this too ${nestedVeryDeep()}</div>`;
      const nested = async (body) => h`<div>${body} ${nestedDeep()}</div>`;
      const result = () => h`<main><h1>${data.title}</h1>${nested(data.body)}</main>`;
      const expected =
        '<main><h1>title</h1><div>this is body text <div>this too and don&#x27;t forget this</div></div></main>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should allow multiple renders of existing template results', async () => {
      const result = h`text`;
      const expected = 'text';
      expect(await streamAsPromise(renderToStream(result))).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result))).to.equal(expected);
    });
    it('should render plain string result', async () => {
      const result = () => 'text';
      const expected = 'text';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
  });

  describe('attributes', () => {
    it('should render a template with quoted text attribute', async () => {
      const value = 'text';
      const result = () => h`<div a="${value}"></div>`;
      const expected = '<div a="text"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with quoted array attribute', async () => {
      const value = [1, 2, 3];
      const result = () => h`<div a="${value}"></div>`;
      const expected = '<div a="123"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with unquoted attribute', async () => {
      const value = 'text';
      const result = () => h`<div a=${value}></div>`;
      const expected = '<div a="text"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with quoted attribute and extra whitespace', async () => {
      const value = 'text';
      const result = () => h`<div a = " ${value} "></div>`;
      const expected = '<div a=" text "></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with quoted attribute and extra strings', async () => {
      const value = 'text';
      const result = () => h`<div a="some ${value}"></div>`;
      const expected = '<div a="some text"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with quoted attribute and multiple strings/values', async () => {
      const value = 'text';
      const result = () => h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      const expected = '<div a="this is some text">node</div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with boolean attribute', async () => {
      const value = true;
      const result = () => h`<div ?a="${value}"></div>`;
      const expected = '<div a></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with element attribute', async () => {
      const result = () => h`<div ${function () {}}></div>`;
      const expected = '<div ></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with event attribute', async () => {
      const result = () => h`<div @a="${'some event'}"></div>`;
      const expected = '<div ></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with property attribute', async () => {
      const result = () => h`<div .a="${'some prop'}"></div>`;
      const expected = '<div ></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should not render a template with nested template attribute', async () => {
      const result = () => h`<div a="some ${h`text`}"></div>`;
      const expected = '<div a="some [object Object]"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should not render a template with nested template array attribute', async () => {
      const result = () => h`<div a="some ${[h`1`, h`2`, h`3`]}"></div>`;
      const expected = '<div a="some [object Object][object Object][object Object]"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with Promise text attribute', async () => {
      const result = () => h`<div a="some ${Promise.resolve('text')} here"></div>`;
      const expected = '<div a="some text here"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with Promise array attribute', async () => {
      const result = () => h`<div a="some ${Promise.resolve([1, 2, 3])} here"></div>`;
      const expected = '<div a="some 123 here"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with Promise template attribute', async () => {
      const result = () => h`<div a="some ${Promise.resolve('text')} here"></div>`;
      const expected = '<div a="some text here"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should render a template with multiple Promise templates attribute', async () => {
      const result = () => h`<div a="some ${Promise.resolve('text')} here ${Promise.resolve('too')}"></div>`;
      const expected = '<div a="some text here too"></div>';
      expect(await renderToString(result())).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result()))).to.equal(expected);
    });
    it('should not render a template attribute with Promise errors', async () => {
      const result = () => h`<div a="some ${Promise.reject(Error('errored!'))}"></div>`;
      try {
        const html = await renderToString(result());
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should not render a template attribute with Promise that throws errors', async () => {
      const result = () =>
        h`<div a="some ${new Promise(() => {
          throw Error('errored!');
        })}"></div>`;
      try {
        const html = await renderToString(result());
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
      try {
        const html = await streamAsPromise(renderToStream(result()));
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should render a template with stringified property object when options.serializePropertyAttributes', async () => {
      const value = { some: 'text' };
      const result = () => h`<div .a="${value}"></div>`;
      const expected = '<div .a="{&quot;some&quot;:&quot;text&quot;}"></div>';
      const options = { serializePropertyAttributes: true };
      expect(await renderToString(result(), options)).to.equal(expected);
      expect(await streamAsPromise(renderToStream(result(), options))).to.equal(expected);
    });
  });
});
