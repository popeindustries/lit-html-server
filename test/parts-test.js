import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  nothing,
  PropertyAttributePart,
  unsafeStringPrefix
} from '../src/parts.js';
import { directive } from '../src/directive.js';
import { expect } from 'chai';

describe('Parts', () => {
  describe('NodePart', () => {
    it('should resolve a string value', () => {
      const part = new NodePart();
      expect(part.getValue('text')).to.equal('text');
    });
    it('should resolve and escape a string value', () => {
      const part = new NodePart();
      expect(part.getValue('<text>')).to.equal('&lt;text&gt;');
    });
    it('should resolve and not escape a string value with unsafe prefix', () => {
      const part = new NodePart();
      expect(part.getValue(`${unsafeStringPrefix}<text>`)).to.equal('<text>');
    });
    it('should resolve a number value', () => {
      const part = new NodePart();
      expect(part.getValue(1)).to.equal('1');
    });
    it('should resolve a boolean value', () => {
      const part = new NodePart();
      expect(part.getValue(true)).to.equal('true');
    });
    it('should resolve a null value', () => {
      const part = new NodePart();
      expect(part.getValue(null)).to.equal('null');
    });
    it('should resolve an undefined value', () => {
      const part = new NodePart();
      expect(part.getValue(undefined)).to.equal('');
    });
    it('should resolve an array value', () => {
      const part = new NodePart();
      expect(part.getValue([1, 2, 3])).to.deep.equal(['1', '2', '3']);
    });
    it('should resolve an nested array value', () => {
      const part = new NodePart();
      expect(part.getValue([1, 2, [3, [4, 5]]])).to.deep.equal(['1', '2', '3', '4', '5']);
    });
    it('should resolve an iterator value');
    it('should resolve a string Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve('text');
      expect(await part.getValue(promise)).to.equal('text');
    });
    it('should resolve a number Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(1);
      expect(await part.getValue(promise)).to.equal('1');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(true);
      expect(await part.getValue(promise)).to.equal('true');
    });
    it('should resolve a null Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(null);
      expect(await part.getValue(promise)).to.equal('null');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(undefined);
      expect(await part.getValue(promise)).to.equal('');
    });
    it('should resolve an array Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve([1, 2, 3]);
      expect(await part.getValue(promise)).to.deep.equal(['1', '2', '3']);
    });
    it('should handle Promise errors');
    it('should resolve a directive value', () => {
      const d = directive(() => () => {
        return 'directive';
      });
      const part = new NodePart();
      expect(part.getValue(d())).to.equal('directive');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(() => () => {
        return nothing;
      });
      const part = new NodePart();
      expect(part.getValue(d())).to.equal('');
    });
    it('should pass through a nested template result', () => {
      const part = new NodePart();
      const value = [''];
      value.isTemplateResult = true;
      expect(part.getValue(value)).to.equal(value);
    });
    it('should flatten an array of template results', () => {
      const part = new NodePart();
      const value1 = ['1'];
      value1.isTemplateResult = true;
      const value2 = ['2'];
      value2.isTemplateResult = true;
      expect(part.getValue([value1, value2])).to.deep.equal(['1', '2']);
    });
  });

  describe('AttributePart', () => {
    it('should resolve a string value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue(['text'])).to.equal('a="text"');
    });
    it('should resolve a number value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([1])).to.equal('a="1"');
    });
    it('should resolve a boolean value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([true])).to.equal('a="true"');
    });
    it('should resolve a null value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([null])).to.equal('a="null"');
    });
    it('should resolve an undefined value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([undefined])).to.equal('a="undefined"');
    });
    it('should resolve multiple values', () => {
      const part = new AttributePart('a', ['b', 'd', '']);
      expect(part.getValue(['c', 'e'])).to.equal('a="bcde"');
    });
    it('should resolve an array value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([[1, 2, 3]])).to.equal('a="123"');
    });
    it('should resolve a deeply nested array value', () => {
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([[[1], 2, [3, [4, 5]]]])).to.equal('a="12345"');
    });
    it('should resolve a directive value', () => {
      const d = directive(() => () => {
        return 'directive';
      });
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([d()])).to.equal('a="directive"');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(() => () => {
        return nothing;
      });
      const part = new AttributePart('a', ['', '']);
      expect(part.getValue([d()])).to.equal('');
    });
    it('should resolve a string Promise value', async () => {
      const part = new AttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve('text')])).to.equal('a="text"');
    });
    it('should resolve a number Promise value', async () => {
      const part = new AttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(1)])).to.equal('a="1"');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new AttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(true)])).to.equal('a="true"');
    });
    it('should resolve a null Promise value', async () => {
      const part = new AttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(null)])).to.equal('a="null"');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new AttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(undefined)])).to.equal('a="undefined"');
    });
  });

  describe('BooleanAttributePart', () => {
    it('should resolve truthy values', () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(part.getValue([true])).to.equal('a');
      expect(part.getValue(['true'])).to.equal('a');
      expect(part.getValue([1])).to.equal('a');
    });
    it('should resolve falsey values', () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(part.getValue([false])).to.equal('');
      expect(part.getValue([''])).to.equal('');
      expect(part.getValue([0])).to.equal('');
      expect(part.getValue([null])).to.equal('');
      expect(part.getValue([undefined])).to.equal('');
    });
    it('should resolve a truthy Promise value', async () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(true)])).to.equal('a');
      expect(await part.getValue([Promise.resolve('true')])).to.equal('a');
      expect(await part.getValue([Promise.resolve(1)])).to.equal('a');
    });
    it('should resolve a falsey Promise value', async () => {
      const part = new BooleanAttributePart('a', ['', '']);
      expect(await part.getValue([Promise.resolve(false)])).to.equal('');
      expect(await part.getValue([Promise.resolve('')])).to.equal('');
      expect(await part.getValue([Promise.resolve(0)])).to.equal('');
      expect(await part.getValue([Promise.resolve(null)])).to.equal('');
      expect(await part.getValue([Promise.resolve(undefined)])).to.equal('');
    });
  });

  describe('EventAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new EventAttributePart('a', ['', '']);
      expect(part.getValue(['text'])).to.equal('');
    });
  });

  describe('PropertyAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new PropertyAttributePart('a', ['', '']);
      expect(part.getValue(['text'])).to.equal('');
    });
  });
});
