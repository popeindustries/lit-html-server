/**
 * Convert "syncIterable" to an AsyncIterable
 *
 * @param { Iterable } syncIterable
 * @returns { AsyncIterable }
 */
export async function* createAsyncIterable(syncIterable) {
  for (const elem of syncIterable) {
    yield elem;
  }
}
