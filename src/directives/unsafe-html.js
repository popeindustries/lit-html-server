import { directive, unsafeStringPrefix } from '../index.js';

export const unsafeHTML = directive(unsafeHTMLDirective);

/**
 * Render "value" without HTML escaping
 *
 * @param { string } value
 * @returns { (part: NodePart) => void }
 */
function unsafeHTMLDirective(value) {
  return function(part) {
    if (part.constructor.name !== 'NodePart') {
      throw Error('unsafeHTML can only be used in text bindings');
    }
    part.setValue(`${unsafeStringPrefix}${value}`);
  };
}
