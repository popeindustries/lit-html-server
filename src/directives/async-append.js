/**
 * @typedef NodePart { import('../parts.js').NodePart }
 */
import { directive, isNodePart } from '../index.js';

export const asyncAppend = directive(asyncAppendDirective);

/**
 * Render items of an AsyncIterable
 *
 * @param { AsyncIterableIterator } value
 * @returns { (part: NodePart) => void }
 */
function asyncAppendDirective(value) {
  return function(part) {
    if (!isNodePart(part)) {
      throw Error('The `asyncAppend` directive can only be used in text nodes');
    }
    part.setValue(value);
  };
}
