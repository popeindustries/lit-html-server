import { isPromise } from './is.js';

/**
 * Buffer strings from "result" and store them on "target"
 * @param {Array<string|Promise<string>>} result
 * @param {object} [accumulator]
 * @returns {Promise<void>}
 */
export async function bufferResult(
  result,
  accumulator = {
    buffer: '',
    bufferChunk(chunk) {
      this.buffer += chunk;
    }
  }
) {
  accumulator.buffer = '';

  for (let chunk of result) {
    if (typeof chunk === 'string') {
      accumulator.bufferChunk(chunk);
    } else if (isPromise(chunk)) {
      chunk = await chunk;
      if (typeof chunk === 'string') {
        accumulator.bufferChunk(chunk);
      } else {
        accumulator.bufferChunk(await reduce(accumulator.buffer, chunk));
      }
    }
  }

  return accumulator.buffer;
}

/**
 * Add resolved "value" to "buffer"
 * @param {string} buffer
 * @param {any} value
 * @returns {string}
 */
async function reduce(buffer, value) {
  if (typeof value === 'string') {
    buffer += value;
    return buffer;
  } else if (Array.isArray(value)) {
    return value.reduce((buffer, value) => reduce(buffer, value), buffer);
  } else if (isPromise(value)) {
    return reduce(buffer, await value);
  }
}
