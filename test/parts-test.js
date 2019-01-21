import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  nothing,
  PropertyAttributePart
} from '../src/parts.js';
import { directive } from '../src/directive.js';
import { expect } from 'chai';
import { TemplateResult } from '../src/template-result.js';

describe('parts', () => {
  describe('NodePart', () => {
    it('should resolve a string value', () => {
      const part = new NodePart();
      expect(part.getHTML('text')).to.equal('text');
    });
    it('should resolve a number value', () => {
      const part = new NodePart();
      expect(part.getHTML(1)).to.equal('1');
    });
    it('should resolve a boolean value', () => {
      const part = new NodePart();
      expect(part.getHTML(true)).to.equal('true');
    });
    it('should resolve a null value', () => {
      const part = new NodePart();
      expect(part.getHTML(null)).to.equal('null');
    });
    it('should resolve an undefined value', () => {
      const part = new NodePart();
      expect(part.getHTML(undefined)).to.equal('');
    });
    it('should resolve an array value', () => {
      const part = new NodePart();
      expect(part.getHTML([1, 2, 3])).to.deep.equal(['1', '2', '3']);
    });
    it('should resolve an nested array value', () => {
      const part = new NodePart();
      expect(part.getHTML([1, 2, [3, [4, 5]]])).to.deep.equal(['1', '2', '3', '4', '5']);
    });
    it('should resolve an iterator value');
    it('should resolve a string Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve('text');
      expect(await part.getHTML(promise)).to.equal('text');
    });
    it('should resolve a number Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(1);
      expect(await part.getHTML(promise)).to.equal('1');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(true);
      expect(await part.getHTML(promise)).to.equal('true');
    });
    it('should resolve a null Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(null);
      expect(await part.getHTML(promise)).to.equal('null');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(undefined);
      expect(await part.getHTML(promise)).to.equal('');
    });
    it('should resolve an array Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve([1, 2, 3]);
      expect(await part.getHTML(promise)).to.deep.equal(['1', '2', '3']);
    });
    it('should handle Promise errors');
    it('should pass through a TemplateResult', () => {
      const part = new NodePart();
      const value = new TemplateResult();
      expect(part.getHTML(value)).to.equal(value);
    });
    it('should resolve an array of TemplateResults', () => {
      const part = new NodePart();
      const value = [new TemplateResult(), new TemplateResult()];
      expect(part.getHTML(value)).to.deep.equal(value);
    });
  });

  describe('AttributePart', () => {
    it('should resolve a string value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString(['test'])).to.equal('a="test"');
    });
    it('should resolve a number value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([1])).to.equal('a="1"');
    });
    it('should resolve a boolean value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([true])).to.equal('a="true"');
    });
    it('should resolve a null value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([null])).to.equal('a="null"');
    });
    it('should resolve an undefined value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([undefined])).to.equal('a="undefined"');
    });
    it('should resolve multiple values', () => {
      const part = new AttributePart('a', ['b', 'd', '']);
      expect(part.getString(['c', 'e'])).to.equal('a="bcde"');
    });
    it('should resolve an array value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([[1, 2, 3]])).to.equal('a="123"');
    });
    it('should resolve a deeply nested array value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([[[1], 2, [3, [4, 5]]]])).to.equal('a="12345"');
    });
    it('should resolve a directive value', () => {
      const d = directive(() => () => {
        return 'directive';
      });
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([d()])).to.equal('a="directive"');
    });
    it('should resolve a directive value returning nothing', () => {
      const d = directive(() => () => {
        return nothing;
      });
      const part = new AttributePart('a', ['', '']);
      expect(part.getString([d()])).to.equal('');
    });
    it('should resolve a Promise value');
  });

  describe('BooleanAttributePart', () => {
    it('should resolve truthy values', () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(part.getString([true])).to.equal('a');
      expect(part.getString(['true'])).to.equal('a');
      expect(part.getString([1])).to.equal('a');
    });
    it('should resolve falsey values', () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(part.getString([false])).to.equal('');
      expect(part.getString([''])).to.equal('');
      expect(part.getString([0])).to.equal('');
      expect(part.getString([null])).to.equal('');
      expect(part.getString([undefined])).to.equal('');
    });
    it('should resolve a Promise value');
  });

  describe('EventAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new EventAttributePart('a', ['', '']);
      expect(part.getString(['text'])).to.equal('');
    });
  });

  describe('PropertyAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new PropertyAttributePart('a', ['', '']);
      expect(part.getString(['text'])).to.equal('');
    });
  });
});
