import { directive, nothingString } from '../index.js';

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
      return part.setValue(nothingString);
    }
    part.setValue(value);
  };
}
