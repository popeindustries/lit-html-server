import { directive, isAttributePart } from '../index.js';

export const classMap = directive(classMapDirective);

/**
 * Applies CSS classes, where'classInfo' keys are added as class names if values are truthy.
 * Only applies to 'class' attribute.
 *
 * @param { object } classInfo
 * @returns { (part: AttributePart) => void }
 */
function classMapDirective(classInfo) {
  return function(part) {
    if (!isAttributePart(part) || part.name !== 'class') {
      throw Error('The `classMap` directive can only be used in the `class` attribute');
    }

    let value = '';

    for (const key in classInfo) {
      if (classInfo[key]) {
        value += `${value.length ? ' ' : ''}${key}`;
      }
    }

    part.setValue(value);
  };
}
