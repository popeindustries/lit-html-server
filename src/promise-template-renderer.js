/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { bufferResult } from './template-result-bufferer.js';

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
    return bufferResult(result);
  }
}
