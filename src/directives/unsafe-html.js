import { directive, isNodePart, unsafePrefixString } from '../index.js';

export const unsafeHTML = directive(unsafeHTMLDirective);

/**
 * Render "value" without HTML escaping
 *
 * @param { string } value
 * @returns { (part: NodePart) => void }
 */
function unsafeHTMLDirective(value) {
  return function(part) {
    if (!isNodePart(part)) {
      throw Error('The `unsafeHTML` directive can only be used in text nodes');
    }
    part.setValue(`${unsafePrefixString}${value}`);
  };
}
