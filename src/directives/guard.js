import { directive } from '../index.js';

export const guard = directive(guardDirective);

/**
 * Guard against re-render.
 * Not possible to compare against previous render in a server context,
 * so this is a no-op.
 *
 * @param { unknown } value
 * @param { () => unknown } fn
 * @returns { (part: NodePart) => void }
 */
function guardDirective(value, fn) {
  return function(part) {
    part.setValue(fn());
  };
}
