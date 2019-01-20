import { AttributePart } from '../parts.js';
import { directive } from '../directive.js';

export const classMap = directive(classMapDirective);

/**
 * Applies CSS classes, where'classInfo' keys are added as class names if values are truthy.
 * Only applies to 'class' attribute.
 * @param {object} classInfo
 * @returns {(part: AttributePart) => string}
 */
function classMapDirective(classInfo) {
  return function(part) {
    if (!(part instanceof AttributePart) || part.name !== 'class') {
      throw Error('The `classMap` directive must be used in the `class` attribute');
    }

    let value = '';

    for (const key in classInfo) {
      if (classInfo[key]) {
        value += `${value.length ? ' ' : ''}${key}`;
      }
    }

    return value;
  };
}
