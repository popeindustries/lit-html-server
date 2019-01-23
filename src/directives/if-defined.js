import { directive, nothing } from '../index.js';

export const ifDefined = directive(ifDefinedDirective);

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 *
 * @param { any } value
 * @returns { (part: AttributePart) => void }
 */
function ifDefinedDirective(value) {
  return function(part) {
    if (value === undefined && part.constructor.name === 'AttributePart') {
      return part.setValue(nothing);
    }
    part.setValue(value);
  };
}
