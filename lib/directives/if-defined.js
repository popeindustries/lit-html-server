import { directive } from '../directive.js';

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 * @param {*} value
 * @returns {function}
 */
export const ifDefined = directive((value) => (part) => {
  if (value === undefined && part.isAttribute) {
    // Should import from '../string.js' but Rollup can't tree shake he.encode
    part.setValue('{__null__}');
    return;
  }
  part.setValue(value);
});
