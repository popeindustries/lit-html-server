import { directive, isNodePart } from '../common.js';

/**
 * Render items of an AsyncIterable, replacing previous items as they are resolved.
 * Not possible to render more than once in a server context, so only the first item is rendered.
 */
export const asyncReplace = directive((value, mapper) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `asyncReplace` directive can only be used in text nodes');
  }

  const val = /** @type { AsyncIterableIterator<unknown> } */ (value);
  const map = /** @type { (value: unknown, index: number) => unknown } */ (mapper);

  part.setValue(
    val.next().then(({ value }) => {
      if (mapper !== undefined) {
        value = map(value, 0);
      }

      return value;
    })
  );
});
