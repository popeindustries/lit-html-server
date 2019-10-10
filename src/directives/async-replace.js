/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isNodePart } from '../index.js';

/**
 * Render items of an AsyncIterable, replacing previous items as they are resolved.
 * Not possible to render more than once in a server context, so only the first item is rendered.
 *
 * @type { (value: AsyncIterable<unknown>, mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined) => (part: Part) => void }
 */
export const asyncReplace = directive((value, mapper) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `asyncReplace` directive can only be used in text nodes');
  }

  part.setValue(
    value.next().then(({ value }) => {
      if (mapper !== undefined) {
        value = mapper(value, 0);
      }

      return value;
    })
  );
});
