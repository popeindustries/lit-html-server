/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive } from '../index.js';

/**
 * Guard against re-render.
 * Not possible to compare against previous render in a server context,
 * so this is a no-op.
 *
 * @type { (value: unknown, fn: () => unknown) => (part: Part) => void }
 */
export const guard = directive((value, fn) => (part) => {
  part.setValue(fn());
});
