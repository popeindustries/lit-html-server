// Disable Prettier
import { expect } from 'chai';
import { html as h } from '../src/index.js';

describe('Template Result', () => {
  describe('text', () => {
    it('should process a plain text template', () => {
      const result = h`text`;
      expect(result.read().toString()).to.equal('text');
    });
    it('should process a template with value', () => {
      const result = h`some ${'text'} here`;
      expect(result.read().toString()).to.equal('some text here');
    });
    it('should process a template with number value', async () => {
      const result = h`some number ${1}`;
      expect(result.read().toString()).to.equal('some number 1');
    });
    it('should process a template with boolean value', async () => {
      const result = h`this is ${true}`;
      expect(result.read().toString()).to.equal('this is true');
    });
    it('should process a template with null value', async () => {
      const result = h`${null}`;
      expect(result.read().toString()).to.equal('null');
    });
    it('should process a template with undefined value', async () => {
      const result = h`${undefined}`;
      expect(result.read().toString()).to.equal('');
    });
    it('should process a template with array value', async () => {
      const result = h`some numbers ${[1, 2, 3]}`;
      expect(result.read().toString()).to.equal('some numbers 123');
    });
    it('should process a template with deeply nested array value', async () => {
      const result = h`a lot of numbers ${[1, 2, [3, [4, 5]]]} here`;
      expect(result.read().toString()).to.equal('a lot of numbers 12345 here');
    });
    it('should process a template with Promise value', async () => {
      const result = h`some ${Promise.resolve('text')} here`;
      const chunks = result.read();
      expect(chunks[0].toString()).to.equal('some ');
      expect((await chunks[1]).toString()).to.equal('text');
      expect(chunks[2].toString()).to.equal(' here');
    });
  });

  describe('attributes', () => {
    it('should process a template with quoted attribute value', () => {
      const value = 'text';
      const result = h`<div a="${value}"></div>`;
      expect(result.read().toString()).to.equal('<div a="text"></div>');
    });
    it('should process a template with unquoted attribute value', () => {
      const value = 'text';
      const result = h`<div a=${value}></div>`;
      expect(result.read().toString()).to.equal('<div a="text"></div>');
    });
    it('should process a template with quoted attribute value and extra whitespace', () => {
      const value = 'text';
      const result = h`<div a = " ${value} "></div>`;
      expect(result.read().toString()).to.equal('<div a=" text "></div>');
    });
    it('should process a template with quoted attribute value and extra strings', () => {
      const value = 'text';
      const result = h`<div a="some ${value}"></div>`;
      expect(result.read().toString()).to.equal('<div a="some text"></div>');
    });
    it('should process a template with quoted attribute and multiple strings/values', () => {
      const value = 'text';
      const result = h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      expect(result.read().toString()).to.equal('<div a="this is some text">node</div>');
    });
    it('should process a template with boolean attribute value', () => {
      const value = true;
      const result = h`<div ?a="${value}"></div>`;
      expect(result.read().toString()).to.equal('<div a></div>');
    });
    it('should process a template with event attribute value', () => {
      const result = h`<div @a="${'some event'}"></div>`;
      expect(result.read().toString()).to.equal('<div ></div>');
    });
    it('should process a template with property attribute value', () => {
      const result = h`<div .a="${'some prop'}"></div>`;
      expect(result.read().toString()).to.equal('<div ></div>');
    });
    it('should not process a template with nested template attribute value', () => {
      const result = h`<div a="some ${h`text`}"></div>`;
      expect(result.read().toString()).to.equal('<div a="some [object Object]"></div>');
    });
    it('should process a template with Promise attribute value', async () => {
      const result = h`<div a="some ${Promise.resolve('text')}"></div>`;
      const chunks = result.read();
      expect(chunks[0].toString()).to.equal('<div ');
      expect((await chunks[1]).toString()).to.equal('a="some text"');
      expect(chunks[2].toString()).to.equal('></div>');
    });
  });
});
