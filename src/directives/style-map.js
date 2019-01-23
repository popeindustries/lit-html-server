import { directive } from '../index.js';

export const styleMap = directive(styleMapDirective);

/**
 * Apply CSS properties, where 'styleInfo' keys and values are added as CSS properties.
 * Only applies to 'style' attribute.
 *
 * @param { object } styleInfo
 * @returns { (part: AttributePart) => void }
 */
function styleMapDirective(styleInfo) {
  return function(part) {
    if (part.constructor.name !== 'AttributePart' || part.name !== 'style') {
      throw Error('The `styleMap` directive must be used in the `style` attribute');
    }

    let value = '';

    for (const key in styleInfo) {
      value += `${value.length ? '; ' : ''}${key}: ${styleInfo[key]}`;
    }

    part.setValue(value);
  };
}
