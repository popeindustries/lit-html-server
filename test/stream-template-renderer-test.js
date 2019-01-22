// Disable Prettier
import { html as h, renderToStream as render } from '../src/index.js';
import { expect } from 'chai';
import getStream from 'get-stream';

describe('Stream template renderer', () => {
  describe('text', () => {
    it.only('should render a plain text template', async () => {
      const result = h`text`;
      expect(await getStream(render(result))).to.equal('text');
    });
    it('should render a template with text value', async () => {
      const result = h`${'text'}`;
      expect(await render(result)).to.equal('text');
    });
    it('should render a template with number value', async () => {
      const result = h`${1}`;
      expect(await render(result)).to.equal('1');
    });
    it('should render a template with boolean value', async () => {
      const result = h`${true}`;
      expect(await render(result)).to.equal('true');
    });
    it('should render a template with null value', async () => {
      const result = h`${null}`;
      expect(await render(result)).to.equal('null');
    });
    it('should render a template with undefined value', async () => {
      const result = h`${undefined}`;
      expect(await render(result)).to.equal('');
    });
    it('should render a template with array value', async () => {
      const result = h`${[1, 2, 3]}`;
      expect(await render(result)).to.equal('123');
    });
    it('should render a template with deeply nested array value', async () => {
      const result = h`${[1, 2, [3, [4, 5]]]}`;
      expect(await render(result)).to.equal('12345');
    });
    it('should render a template with sync iterator value', async () => {
      const array = ['hello ', Promise.resolve('there '), 'world', [", how's ", 'it ', 'going']];
      const result = h`Well ${array[Symbol.iterator]()}?`;
      expect(await render(result)).to.equal('Well hello there world, how&#x27;s it going?');
    });
    it('should render a template with nested template value', async () => {
      const result = h`some ${h`text`}`;
      expect(await render(result)).to.equal('some text');
    });
    it('should render a template with array of nested template values', async () => {
      const result = h`some ${[1, 2, 3].map((i) => h`${i}`)} text`;
      expect(await render(result)).to.equal('some 123 text');
    });
    it('should render a template with Promise value', async () => {
      const result = h`${Promise.resolve('some')} text`;
      expect(await render(result)).to.equal('some text');
    });
    it('should render a template with Promise template value', async () => {
      const result = h`${Promise.resolve(h`some`)} text`;
      expect(await render(result)).to.equal('some text');
    });
    it('should not render a template with Promise errors', async () => {
      const result = h`${Promise.reject(Error('errored!'))}`;
      try {
        const html = await render(result);
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should not render a template with Promises that throw errors', async () => {
      const result = h`${new Promise(() => {
        throw Error('errored!');
      })}`;
      try {
        const html = await render(result);
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
  });

  describe('attributes', () => {
    it('should render a template with quoted text attribute', async () => {
      const value = 'text';
      const result = h`<div a="${value}"></div>`;
      expect(await render(result)).to.equal('<div a="text"></div>');
    });
    it('should render a template with quoted array attribute', async () => {
      const value = [1, 2, 3];
      const result = h`<div a="${value}"></div>`;
      expect(await render(result)).to.equal('<div a="123"></div>');
    });
    it('should render a template with unquoted attribute', async () => {
      const value = 'text';
      const result = h`<div a=${value}></div>`;
      expect(await render(result)).to.equal('<div a="text"></div>');
    });
    it('should render a template with quoted attribute and extra whitespace', async () => {
      const value = 'text';
      const result = h`<div a = " ${value} "></div>`;
      expect(await render(result)).to.equal('<div a=" text "></div>');
    });
    it('should render a template with quoted attribute and extra strings', async () => {
      const value = 'text';
      const result = h`<div a="some ${value}"></div>`;
      expect(await render(result)).to.equal('<div a="some text"></div>');
    });
    it('should render a template with quoted attribute and multiple strings/values', async () => {
      const value = 'text';
      const result = h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      expect(await render(result)).to.equal('<div a="this is some text">node</div>');
    });
    it('should render a template with boolean attribute', async () => {
      const value = true;
      const result = h`<div ?a="${value}"></div>`;
      expect(await render(result)).to.equal('<div a></div>');
    });
    it('should render a template with event attribute', async () => {
      const result = h`<div @a="${'some event'}"></div>`;
      expect(await render(result)).to.equal('<div ></div>');
    });
    it('should render a template with property attribute', async () => {
      const result = h`<div .a="${'some prop'}"></div>`;
      expect(await render(result)).to.equal('<div ></div>');
    });
    it('should render a template with nested template attribute', async () => {
      const result = h`<div a="some ${h`text`}"></div>`;
      expect(await render(result)).to.equal('<div a="some text"></div>');
    });
    it('should render a template with nested template array attribute', async () => {
      const result = h`<div a="some ${[h`1`, h`2`, h`3`]}"></div>`;
      expect(await render(result)).to.equal('<div a="some 123"></div>');
    });
    it('should render a template with Promise text attribute', async () => {
      const result = h`<div a="some ${Promise.resolve('text')}"></div>`;
      expect(await render(result)).to.equal('<div a="some text"></div>');
    });
    it('should render a template with Promise array attribute', async () => {
      const result = h`<div a="some ${Promise.resolve([1, 2, 3])}"></div>`;
      expect(await render(result)).to.equal('<div a="some 123"></div>');
    });
    it('should render a template with Promise template attribute', async () => {
      const result = h`<div a="some ${Promise.resolve(h`text`)}"></div>`;
      expect(await render(result)).to.equal('<div a="some text"></div>');
    });
    it('should render a template with multiple Promise templates attribute', async () => {
      const result = h`<div a="some ${Promise.resolve(h`text`)} here ${Promise.resolve(
        h`too`
      )}"></div>`;
      expect(await render(result)).to.equal('<div a="some text here too"></div>');
    });
    it('should not render a template attribute with Promise errors', async () => {
      const result = h`<div a="some ${Promise.reject(Error('errored!'))}"></div>`;
      try {
        const html = await render(result);
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should not render a template attribute with Promise that throws errors', async () => {
      const result = h`<div a="some ${new Promise(() => {
        throw Error('errored!');
      })}"></div>`;
      try {
        const html = await render(result);
        expect(html).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
  });
});
