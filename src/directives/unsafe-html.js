import { NodePart, unsafeStringPrefix } from '../parts.js';
import { directive } from '../directive.js';

export const unsafeHTML = directive(unsafeHTMLDirective);

/**
 * Render 'value' without HTML escaping
 * @param {string} value
 * @returns {(part: NodePart) => void}
 */
function unsafeHTMLDirective(value) {
  return function(part) {
    if (!(part instanceof NodePart)) {
      throw Error('unsafeHTML can only be used in text bindings');
    }
    part.setValue(`${unsafeStringPrefix}${value}`);
  };
}
