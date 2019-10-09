/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isNodePart } from '../index.js';

/**
 * Render items of an AsyncIterable
 *
 * @type { (value: AsyncIterable<unknown>) => (part: Part) => void }
 */
export const asyncAppend = directive((value) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `asyncAppend` directive can only be used in text nodes');
  }
  part.setValue(value);
});
