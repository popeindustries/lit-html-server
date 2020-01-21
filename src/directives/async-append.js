import { directive, isNodePart } from '../common.js';

/**
 * Render items of an AsyncIterable
 */
export const asyncAppend = directive((value, mapper) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `asyncAppend` directive can only be used in text nodes');
  }

  const val = /** @type { AsyncIterableIterator<unknown> } */ (value);
  const map = /** @type { (value: unknown, index: number) => unknown } */ (mapper);

  if (mapper !== undefined) {
    value = createMappedAsyncIterable(val, map);
  }

  part.setValue(value);
});

/**
 * Create new asyncIterator from "asuncIterable" that maps results with "mapper"
 *
 * @param { AsyncIterableIterator<unknown> } asyncIterable
 * @param { (value: unknown, index: number) => unknown } mapper
 */
async function* createMappedAsyncIterable(asyncIterable, mapper) {
  let i = 0;

  for await (const item of asyncIterable) {
    yield mapper(item, i++);
  }
}
