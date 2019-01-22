import { bufferResult } from './template-result-bufferer.js';

/**
 * Render a template result to a string resolving Promise
 * @param {Array<string|Promise<string>>} result
 * @returns {Promise<string>}
 */
export function promiseTemplateRenderer(result) {
  return bufferResult(result);
}
