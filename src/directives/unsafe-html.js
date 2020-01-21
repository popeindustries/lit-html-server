import { directive, isNodePart, unsafePrefixString } from '../common.js';

/**
 * Render "value" without HTML escaping
 */
export const unsafeHTML = directive((value) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `unsafeHTML` directive can only be used in text nodes');
  }
  part.setValue(`${unsafePrefixString}${value}`);
});
