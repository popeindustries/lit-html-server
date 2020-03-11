import { directive, isAttributePart, nothing } from '../shared.js';

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 */
export const ifDefined = directive((value) => (part) => {
  if (value === undefined && isAttributePart(part)) {
    return part.setValue(nothing);
  }
  part.setValue(value);
});
