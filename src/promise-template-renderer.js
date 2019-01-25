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
   * @param { object } [options]
   * @param { object } [options.destructive = true] - destroy "result" while rendering ("true"), or operate on a shallow copy ("false")
   * @returns { Promise<string> }
   */
  constructor(result, options = { destructive: true }) {
    return reduce(options.destructive ? result : result.slice());
  }
}

/**
 * Reduce TemplateResult to a single string resolving Promise
 *
 * @param { TemplateResult } stack
 * @returns { Promise<string> }
 */
async function reduce(stack) {
  let buffer = '';
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
