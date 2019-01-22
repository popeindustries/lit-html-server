import { AttributePart, nothing } from '../parts.js';
import { directive } from '../directive.js';

export const ifDefined = directive(ifDefinedDirective);

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 * @param {any} value
 * @returns {(part: AttributePart) => void}
 */
function ifDefinedDirective(value) {
  return function(part) {
    if (value === undefined && part instanceof AttributePart) {
      part.setValue(nothing);
    }
    part.setValue(value);
  };
}
