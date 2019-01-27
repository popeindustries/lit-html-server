/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
/**
 * @typedef TemplateResultProcessor { import('./default-template-result-processor.js).TemplateResultProcessor }
 */
/**
 * @typedef TemplateResultRenderer { import('./default-template-result-renderer.js).TemplateResultRenderer }
 */

/**
 * A class for rendering a template result to a string resolving Promise
 */
export class PromiseTemplateRenderer {
  /**
   * Constructor
   *
   * @param { TemplateResult } result
   * @param { TemplateResultProcessor } processor
   * @returns { Promise<string> }
   */
  constructor(result, processor) {
    return new Promise((resolve, reject) => {
      let buffer = '';

      processor.process(
        {
          awaitingPromise: false,
          push(chunk) {
            if (chunk === null) {
              resolve(buffer);
            } else {
              buffer += chunk;
            }
            return true;
          },
          destroy(err) {
            buffer = '';
            reject(err);
          }
        },
        [result]
      );
    });
  }
}
