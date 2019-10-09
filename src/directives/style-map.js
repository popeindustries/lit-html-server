/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isAttributePart } from '../index.js';

/**
 * Apply CSS properties, where 'styleInfo' keys and values are added as CSS properties.
 * Only applies to 'style' attribute.
 *
 * @type { (styleInfo: { [name: string]: string }) => (part: Part) => void }
 */
export const styleMap = directive((styleInfo) => (part) => {
  if (!isAttributePart(part) || part.name !== 'style') {
    throw Error('The `styleMap` directive can only be used in the `style` attribute');
  }

  let value = '';

  for (const key in styleInfo) {
    value += `${value.length ? '; ' : ''}${key}: ${styleInfo[key]}`;
  }

  part.setValue(value);
});
