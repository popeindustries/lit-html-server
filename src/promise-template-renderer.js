/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { isPromise } from './is.js';

/**
 * A class for rendering a template result to a string resolving Promise
 */
export class PromiseTemplateRenderer {
  /**
   * Constructor
   *
   * @param { TemplateResult } result
   * @returns { Promise<string> }
   */
  constructor(result) {
    return reduce(result);
  }
}

/**
 * Reduce TemplateResult to a single string resolving Promise
 *
 * @param { TemplateResult } result
 * @returns { Promise<string> }
 */
async function reduce(result) {
  let buffer = '';
  let stack = result.slice();
  let chunk;

  while ((chunk = stack.shift()) !== undefined) {
    if (typeof chunk === 'string') {
      buffer += chunk;
    } else if (Array.isArray(chunk)) {
      stack = chunk.concat(stack);
    } else if (isPromise(chunk)) {
      stack.unshift(await chunk);
    } else {
      throw Error('unknown value type:', chunk);
    }
  }

  return buffer;
}
