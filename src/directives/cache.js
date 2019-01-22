import { AttributePart } from '../parts.js';
import { directive } from '../directive.js';

export const cache = directive(cacheDirective);

/**
 * Enables fast switching between multiple templates by caching previous results.
 * Not possible/desireable to cache between requests, so this is a no-op.
 * @param {any} value
 * @returns {(part: NodePart) => void}
 */
function cacheDirective(value) {
  return function(part) {
    if (part instanceof AttributePart) {
      throw Error('The `cache` directive must be only be used in text nodes');
    }
    part.setValue(value);
  };
}
