import { expect } from 'chai';
// Disable Prettier
import { html as h } from '../src/index.js';

describe('Template result', () => {
  describe('text', () => {
    it('should process a plain text template', () => {
      const result = h`text`;
      expect(result).to.deep.equal(['text']);
    });
    it('should process a template with value', () => {
      const result = h`some ${'text'}`;
      expect(result).to.deep.equal(['some text']);
    });
    it('should process a template with nested template value', () => {
      const result = h`some ${h`text`}`;
      expect(result).to.deep.equal(['some text']);
    });
  });

  describe('attributes', () => {
    it('should process a template with quoted attribute', () => {
      const value = 'text';
      const result = h`<div a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should process a template with unquoted attribute', () => {
      const value = 'text';
      const result = h`<div a=${value}></div>`;
      expect(result).to.deep.equal(['<div a="text"></div>']);
    });
    it('should process a template with quoted attribute and extra whitespace', () => {
      const value = 'text';
      const result = h`<div a = " ${value} "></div>`;
      expect(result).to.deep.equal(['<div a=" text "></div>']);
    });
    it('should process a template with quoted attribute and extra strings', () => {
      const value = 'text';
      const result = h`<div a="some ${value}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
    it('should process a template with quoted attribute and multiple strings/values', () => {
      const value = 'text';
      const result = h`<div a="this is ${'some'} ${value}">${'node'}</div>`;
      expect(result).to.deep.equal(['<div a="this is some text">node</div>']);
    });
    it('should process a template with boolean attribute', () => {
      const value = true;
      const result = h`<div ?a="${value}"></div>`;
      expect(result).to.deep.equal(['<div a></div>']);
    });
    it('should process a template with event attribute', () => {
      const result = h`<div @a="${'some event'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should process a template with property attribute', () => {
      const result = h`<div .a="${'some prop'}"></div>`;
      expect(result).to.deep.equal(['<div ></div>']);
    });
    it('should process a template with nested template attribute', () => {
      const result = h`<div a="some ${h`text`}"></div>`;
      expect(result).to.deep.equal(['<div a="some text"></div>']);
    });
  });
});
