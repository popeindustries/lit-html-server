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

/**
 * Convert stream to a Promise
 *
 * @param { import('stream').Readable } stream
 * @returns { Promise<string> }
 */
export function streamAsPromise(stream) {
  return new Promise((resolve, reject) => {
    let result = '';
    stream.on('error', reject);
    stream.on('data', (chunk) => {
      result += chunk.toString();
    });
    stream.on('end', () => {
      resolve(result);
    });
  });
}
