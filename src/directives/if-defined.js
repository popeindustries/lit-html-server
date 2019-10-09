/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isAttributePart, nothingString } from '../index.js';

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 *
 * @type { (value: unknown) => (part: Part) => void }
 */
export const ifDefined = directive((value) => (part) => {
  if (value === undefined && isAttributePart(part)) {
    return part.setValue(nothingString);
  }
  part.setValue(value);
});
