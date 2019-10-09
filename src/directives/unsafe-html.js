/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isNodePart, unsafePrefixString } from '../index.js';

/**
 * Render "value" without HTML escaping
 *
 * @type { (value: unknown) => (part: Part) => void }
 */
export const unsafeHTML = directive((value) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `unsafeHTML` directive can only be used in text nodes');
  }
  part.setValue(`${unsafePrefixString}${value}`);
});
