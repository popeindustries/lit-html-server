// Disable Prettier
import { html as h, renderToString as render } from '../src/index.js';
import { expect } from 'chai';

describe('Promise template renderer', () => {
  describe.only('text', () => {
    it('should render a plain text template', async () => {
      const result = h`text`;
      expect(await render(result)).to.equal('text');
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
  });

  describe('attributes', () => {
    it('should render a template with quoted attribute', () => {
      const value = 'text';
      const result = h`<div a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should render a template with unquoted attribute', () => {
      const value = 'text';
      const result = h`<div a=${value}></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should render a template with quoted attribute and extra whitespace', () => {
      const value = 'text';
      const result = h`<div a = " ${value} "></div>`;
      expect(result).to.deep.equal(['<div a=" text "></div>']);
    });
    it('should render a template with quoted attribute and extra strings', () => {
      const value = 'text';
      const result = h`<div a="some ${value}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
    it('should render a template with quoted attribute and multiple strings/values', () => {
      const value = 'text';
      const result = h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      expect(result).to.deep.equal(['<div a="this is some text">node</div>']);
    });
    it('should render a template with boolean attribute', () => {
      const value = true;
      const result = h`<div ?a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a></div>']);
    });
    it('should render a template with event attribute', () => {
      const result = h`<div @a="${'some event'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should render a template with property attribute', () => {
      const result = h`<div .a="${'some prop'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should render a template with nested template attribute', () => {
      const result = h`<div a="some ${h`text`}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
  });
});
