import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  PropertyAttributePart
} from '../src/parts.js';
import { nothingString, unsafePrefixString } from '../src/string.js';
import { directive } from '../src/directive.js';
import { expect } from 'chai';

describe('Parts', () => {
  describe('NodePart', () => {
    it('should resolve a string value', () => {
      const part = new NodePart();
      expect(part.getValue('text').toString()).to.equal('text');
    });
    it('should resolve and escape a string value', () => {
      const part = new NodePart();
      expect(part.getValue('<text>').toString()).to.equal('&lt;text&gt;');
    });
    it('should resolve and not escape a string value with unsafe prefix', () => {
      const part = new NodePart();
      expect(part.getValue(`${unsafePrefixString}<text>`).toString()).to.equal('<text>');
    });
    it('should resolve a number value', () => {
      const part = new NodePart();
      expect(part.getValue(1).toString()).to.equal('1');
    });
    it('should resolve a boolean value', () => {
      const part = new NodePart();
      expect(part.getValue(true).toString()).to.equal('true');
    });
    it('should resolve a null value', () => {
      const part = new NodePart();
      expect(part.getValue(null).toString()).to.equal('null');
    });
    it('should resolve an undefined value', () => {
      const part = new NodePart();
      expect(part.getValue(undefined).toString()).to.equal('');
    });
    it('should resolve an array value', () => {
      const part = new NodePart();
      expect(part.getValue([1, 2, 3]).map((v) => v.toString())).to.deep.equal(['1', '2', '3']);
    });
    it('should resolve an nested array value', () => {
      const part = new NodePart();
      expect(part.getValue([1, 2, [3, [4, 5]]]).map((v) => v.toString())).to.deep.equal([
        '1',
        '2',
        '3',
        '4',
        '5'
      ]);
    });
    it('should resolve a sync iterator value', () => {
      const part = new NodePart();
      const array = ['hello ', 'world'];
      expect(part.getValue(array[Symbol.iterator]()).map((v) => v.toString())).to.deep.equal([
        'hello ',
        'world'
      ]);
    });
    it('should resolve a string Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve('text');
      expect((await part.getValue(promise)).toString()).to.equal('text');
    });
    it('should resolve a number Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(1);
      expect((await part.getValue(promise)).toString()).to.equal('1');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(true);
      expect((await part.getValue(promise)).toString()).to.equal('true');
    });
    it('should resolve a null Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(null);
      expect((await part.getValue(promise)).toString()).to.equal('null');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve(undefined);
      expect((await part.getValue(promise)).toString()).to.equal('');
    });
    it('should resolve an array Promise value', async () => {
      const part = new NodePart();
      const promise = Promise.resolve([1, 2, 3]);
      expect((await part.getValue(promise)).map((v) => v.toString())).to.deep.equal([
        '1',
        '2',
        '3'
      ]);
    });
    it('should handle Promise errors', async () => {
      const part = new NodePart();
      const promise = Promise.reject(Error('errored!'));
      try {
        const result = await part.getValue(promise);
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
    it('should resolve a directive value', () => {
      const d = directive(() => (part) => {
        part.setValue('directive');
      });
      const part = new NodePart();
      expect(part.getValue(d()).toString()).to.equal('directive');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(() => (part) => {
        part.setValue(nothingString);
      });
      const part = new NodePart();
      expect(part.getValue(d()).toString()).to.equal('');
    });
  });

  describe('AttributePart', () => {
    it('should resolve a string value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue(['text']).toString()).to.equal('a="text"');
    });
    it('should resolve a number value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([1]).toString()).to.equal('a="1"');
    });
    it('should resolve a boolean value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([true]).toString()).to.equal('a="true"');
    });
    it('should resolve a null value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([null]).toString()).to.equal('a="null"');
    });
    it('should resolve an undefined value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([undefined]).toString()).to.equal('a="undefined"');
    });
    it('should resolve multiple values', () => {
      const part = new AttributePart('a', [Buffer.from('b'), Buffer.from('d'), Buffer.from('')]);
      expect(part.getValue(['c', 'e']).toString()).to.equal('a="bcde"');
    });
    it('should resolve an array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([[1, 2, 3]]).toString()).to.equal('a="123"');
    });
    it('should resolve a deeply nested array value', () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([[[1], 2, [3, [4, 5]]]]).toString()).to.equal('a="12345"');
    });
    it('should resolve a directive value', () => {
      const d = directive(() => (part) => {
        part.setValue('directive');
      });
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([d()]).toString()).to.equal('a="directive"');
    });
    it('should resolve a directive value returning "nothing"', () => {
      const d = directive(() => (part) => {
        part.setValue(nothingString);
      });
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([d()]).toString()).to.equal('');
    });
    it('should resolve a string Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from(' here')]);
      expect((await part.getValue([Promise.resolve('text')])).toString()).to.equal('a="text here"');
    });
    it('should resolve a number Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(1)])).toString()).to.equal('a="1"');
    });
    it('should resolve a boolean Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(true)])).toString()).to.equal('a="true"');
    });
    it('should resolve a null Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(null)])).toString()).to.equal('a="null"');
    });
    it('should resolve an undefined Promise value', async () => {
      const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(undefined)])).toString()).to.equal(
        'a="undefined"'
      );
    });
    it('should handle Promise errors', async () => {
      try {
        const part = new AttributePart('a', [Buffer.from(''), Buffer.from('')]);
        const promise = Promise.reject(Error('errored!'));
        const result = await part.getValue([promise]);
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'errored!');
      }
    });
  });

  describe('BooleanAttributePart', () => {
    it('should resolve truthy values', () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([true]).toString()).to.equal('a');
      expect(part.getValue(['true']).toString()).to.equal('a');
      expect(part.getValue([1]).toString()).to.equal('a');
    });
    it('should resolve falsey values', () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue([false]).toString()).to.equal('');
      expect(part.getValue(['']).toString()).to.equal('');
      expect(part.getValue([0]).toString()).to.equal('');
      expect(part.getValue([null]).toString()).to.equal('');
      expect(part.getValue([undefined]).toString()).to.equal('');
    });
    it('should resolve a truthy Promise value', async () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(true)])).toString()).to.equal('a');
      expect((await part.getValue([Promise.resolve('true')])).toString()).to.equal('a');
      expect((await part.getValue([Promise.resolve(1)])).toString()).to.equal('a');
    });
    it('should resolve a falsey Promise value', async () => {
      const part = new BooleanAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect((await part.getValue([Promise.resolve(false)])).toString()).to.equal('');
      expect((await part.getValue([Promise.resolve('')])).toString()).to.equal('');
      expect((await part.getValue([Promise.resolve(0)])).toString()).to.equal('');
      expect((await part.getValue([Promise.resolve(null)])).toString()).to.equal('');
      expect((await part.getValue([Promise.resolve(undefined)])).toString()).to.equal('');
    });
  });

  describe('EventAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new EventAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue(['text']).toString()).to.equal('');
    });
  });

  describe('PropertyAttributePart', () => {
    it('should resolve to empty string', () => {
      const part = new PropertyAttributePart('a', [Buffer.from(''), Buffer.from('')]);
      expect(part.getValue(['text']).toString()).to.equal('');
    });
  });
});
