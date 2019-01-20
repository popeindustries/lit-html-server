import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  PropertyAttributePart
} from '../src/parts.js';
import { expect } from 'chai';

describe('parts', () => {
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
    it('should resolve a Promise value');
    it('should resolve a directive value');
    it('should resolve a directive value returning nothing');
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
