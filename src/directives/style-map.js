import { directive, isAttributePart } from '../common.js';

/**
 * Apply CSS properties, where 'styleInfo' keys and values are added as CSS properties.
 * Only applies to 'style' attribute.
 */
export const styleMap = directive((styleInfo) => (part) => {
  if (!isAttributePart(part) || part.name !== 'style') {
    throw Error('The `styleMap` directive can only be used in the `style` attribute');
  }

  const styles = /** @type { { [name: string]: string } } */ (styleInfo);
  let value = '';

  for (const key in styles) {
    value += `${value.length ? '; ' : ''}${key}: ${styles[key]}`;
  }

  part.setValue(value);
});
