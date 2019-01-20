import { directive } from '../directive.js';
import { NodePart } from '../parts.js';

export const unsafeHTML = directive(unsafeHTMLDirective);

/**
 * Render 'value' without HTML escaping
 * @param {string} value
 * @returns {(part: NodePart) => string}
 */
function unsafeHTMLDirective(value) {
  return function(part) {
    if (!(part instanceof NodePart)) {
      throw Error('unsafeHTML can only be used in text bindings');
    }
    // TODO: flag for no-escape
    return value;
  };
}
