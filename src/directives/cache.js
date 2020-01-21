import { directive, isNodePart } from '../common.js';

/**
 * Enables fast switching between multiple templates by caching previous results.
 * Not possible/desireable to cache between server-side requests, so this is a no-op.
 */
export const cache = directive((value) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `cache` directive can only be used in text nodes');
  }
  part.setValue(value);
});
