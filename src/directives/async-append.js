/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive, isNodePart } from '../index.js';

/**
 * Render items of an AsyncIterable
 *
 * @type { (value: AsyncIterable<unknown>, mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined) => (part: Part) => void }
 */
export const asyncAppend = directive((value, mapper) => (part) => {
  if (!isNodePart(part)) {
    throw Error('The `asyncAppend` directive can only be used in text nodes');
  }

  if (mapper !== undefined) {
    value = createMappedAsyncIterable(value, mapper);
  }

  part.setValue(value);
});

async function* createMappedAsyncIterable(asyncIterable, mapper) {
  let i = 0;

  for await (const item of asyncIterable) {
    yield mapper(item, i++);
  }
}
