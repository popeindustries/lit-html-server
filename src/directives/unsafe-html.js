import { directive, isChildPart, unsafePrefixString } from '../shared.js';

/**
 * Render "value" without HTML escaping
 */
export const unsafeHTML = directive((value) => (part) => {
  if (!isChildPart(part)) {
    throw Error('The `unsafeHTML` directive can only be used in text nodes');
  }
  part.setValue(`${unsafePrefixString}${value}`);
});
