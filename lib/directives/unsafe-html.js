import { directive } from '../directive.js';

/**
 * Render unescaped HTML
 * @param {string} value
 * @returns {function}
 */
export const unsafeHTML = directive((value) => (part) => {
  if (part.isAttribute) {
    throw Error('unsafeHTML can only be used in text bindings');
  }
  // Should import from '../string.js' but Rollup can't tree shake he.encode
  part.setValue(`<!-- no escape -->${value}`);
});
