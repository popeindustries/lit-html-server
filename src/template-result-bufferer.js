/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { isPromise } from './is.js';

/**
 * Buffer strings from "result" and store them on "accumulator"
 *
 * @param { TemplateResult } result
 * @param { object } [accumulator]
 * @returns { Promise<string> }
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
  let stack = result.slice();
  let chunk;

  accumulator.buffer = '';

  while ((chunk = stack.shift()) !== undefined) {
    if (typeof chunk === 'string') {
      accumulator.bufferChunk(chunk);
    } else if (Array.isArray(chunk)) {
      stack = chunk.concat(stack);
    } else if (isPromise(chunk)) {
      stack.unshift(await chunk);
    } else {
      throw Error('unknown value type', chunk);
    }
  }

  return accumulator.buffer;
}
