import { directive } from '../index.js';

/**
 * Guard against re-render.
 * Not possible to compare against previous render in a server context,
 * so this is a no-op.
 */
export const guard = directive((value, fn) => (part) => {
  const f = /** @type { () => unknown } */ (fn);

  part.setValue(f());
});
