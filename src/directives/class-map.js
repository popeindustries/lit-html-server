import { directive, isAttributePart } from '../shared.js';

/**
 * Applies CSS classes, where'classInfo' keys are added as class names if values are truthy.
 * Only applies to 'class' attribute.
 *
 * @type { (classInfo: { [name: string]: string | boolean | number }) => (part: Part) => void }
 */
export const classMap = directive((classInfo) => (part) => {
  if (!isAttributePart(part) || part.name !== 'class') {
    throw Error('The `classMap` directive can only be used in the `class` attribute');
  }

  const classes = /** @type { { [name: string]: string } } */ (classInfo);
  let value = '';

  for (const key in classes) {
    if (classes[key]) {
      value += `${value.length ? ' ' : ''}${key}`;
    }
  }

  part.setValue(value);
});
