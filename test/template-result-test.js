import { expect } from 'chai';
// Disable Prettier
import { html as h } from '../src/index.js';

describe('Template Result', () => {
  describe('text', () => {
    it('should process a plain text template', () => {
      const result = h`text`;
      expect(result).to.deep.equal(['text']);
    });
    it('should process a template with value', () => {
      const result = h`some ${'text'} here`;
      expect(result).to.deep.equal(['some text here']);
    });
    it('should process a template with number value', async () => {
      const result = h`some number ${1}`;
      expect(result).to.deep.equal(['some number 1']);
    });
    it('should process a template with boolean value', async () => {
      const result = h`this is ${true}`;
      expect(result).to.deep.equal(['this is true']);
    });
    it('should process a template with null value', async () => {
      const result = h`${null}`;
      expect(result).to.deep.equal(['null']);
    });
    it('should process a template with undefined value', async () => {
      const result = h`${undefined}`;
      expect(result).to.deep.equal(['']);
    });
    it('should process a template with array value', async () => {
      const result = h`some numbers ${[1, 2, 3]}`;
      expect(result).to.deep.equal(['some numbers 123']);
    });
    it('should process a template with deeply nested array value', async () => {
      const result = h`a lot of numbers ${[1, 2, [3, [4, 5]]]} here`;
      expect(result).to.deep.equal(['a lot of numbers 12345 here']);
    });
    it('should process a template with nested template value', () => {
      const result = h`some nested ${h`text`}`;
      expect(result).to.deep.equal(['some nested text']);
    });
    it('should process a template with Promise value', () => {
      const result = h`some ${Promise.resolve('text')} here`;
      expect(result[0]).to.equal('some ');
      expect(result[1]).to.be.instanceOf(Promise);
      expect(result[2]).to.equal(' here');
    });
    it('should process a template with nested template with Promise value', () => {
      const result = h`some nested ${h`${Promise.resolve('text')} in here too`}`;
      expect(result[0]).to.equal('some nested ');
      expect(result[1]).to.be.instanceOf(Promise);
      expect(result[2]).to.equal(' in here too');
    });
  });

  describe('attributes', () => {
    it('should process a template with quoted attribute value', () => {
      const value = 'text';
      const result = h`<div a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should process a template with unquoted attribute value', () => {
      const value = 'text';
      const result = h`<div a=${value}></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should process a template with quoted attribute value and extra whitespace', () => {
      const value = 'text';
      const result = h`<div a = " ${value} "></div>`;
      expect(result).to.deep.equal(['<div a=" text "></div>']);
    });
    it('should process a template with quoted attribute value and extra strings', () => {
      const value = 'text';
      const result = h`<div a="some ${value}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
    it('should process a template with quoted attribute and multiple strings/values', () => {
      const value = 'text';
      const result = h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      expect(result).to.deep.equal(['<div a="this is some text">node</div>']);
    });
    it('should process a template with boolean attribute value', () => {
      const value = true;
      const result = h`<div ?a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a></div>']);
    });
    it('should process a template with event attribute value', () => {
      const result = h`<div @a="${'some event'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should process a template with property attribute value', () => {
      const result = h`<div .a="${'some prop'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should process a template with nested template attribute value', () => {
      const result = h`<div a="some ${h`text`}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
    it('should process a template with Promise attribute value', () => {
      const result = h`<div a="some ${Promise.resolve('text')}"></div>`;
      expect(result[0]).to.equal('<div ');
      expect(result[1]).to.be.instanceOf(Promise);
      expect(result[2]).to.equal('></div>');
    });
  });
});
