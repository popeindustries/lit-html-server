/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isPropertyPart } from '../index.js';

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 *
 * @type { (value: unknown) => (part: Part) => void }
 */
export const hydrate = directive((value) => (part) => {
  if (value !== undefined && isPropertyPart(part)) {
    return part.setValue(JSON.stringify(value));
  }
  part.setValue(value);
});
