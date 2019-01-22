/**
 * @typedef templateResult { import('./template-result.js).templateResult }
 */
import { bufferResult } from './template-result-bufferer.js';

/**
 * Render a template result to a string resolving Promise
 *
 * @param { templateResult } result
 * @returns { Promise<string> }
 */
export function promiseTemplateRenderer(result) {
  return bufferResult(result);
}
