/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive } from '../index.js';
import { isPrimitive } from '../is.js';

/**
 * Renders one of a series of values, including Promises, in priority order.
 * Not possible to render more than once in a server context, so primitive
 * sync values are prioritised over async, unless there are no more pending
 * values, in which case the last value is always rendered regardless.
 *
 * @type { (...args: Array<unknown>) => (part: Part) => void }
 */
export const until = directive((...args) => (part) => {
  for (let i = 0, n = args.length; i < n; i++) {
    const value = args[i];

    // Render sync values immediately,
    // or last value (async included) if no more values pending
    if (isPrimitive(value) || i === n - 1) {
      part.setValue(value);
    }
  }
});
