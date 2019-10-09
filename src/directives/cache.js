/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isNodePart } from '../index.js';

/**
 * Enables fast switching between multiple templates by caching previous results.
 * Not possible/desireable to cache between server-side requests, so this is a no-op.
 *
 * @type { (value: unknown) => (part: Part) => void }
 */
export const cache = directive((value) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `cache` directive can only be used in text nodes');
  }
  part.setValue(value);
});
