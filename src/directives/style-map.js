import { directive } from '../directive.js';

/**
 * Apply CSS properties.
 * Only applies to 'style' attribute.
 * 'styleInfo' keys and values are added as CSS properties
 * @param {object} styleInfo
 * @returns {function}
 */
export const styleMap = directive((styleInfo) => (part) => {
  if (!part.isAttribute || part.attributeName !== 'style') {
    throw Error('The `styleMap` directive must be used in the `style` attribute');
  }

  let value = '';

  for (const key in styleInfo) {
    value += `${value.length ? '; ' : ''}${key}: ${styleInfo[key]}`;
  }

  part.setValue(value);
});
