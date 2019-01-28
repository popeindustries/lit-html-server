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
      let stack = [result];
      let chunks = [];

      processor.process(
        {
          awaitingPromise: false,
          push(chunk) {
            if (chunk === null) {
              resolve(Buffer.concat(chunks).toString());
            } else {
              chunks.push(chunk);
            }
            return true;
          },
          destroy(err) {
            chunks.length = 0;
            chunks = undefined;
            stack.length = 0;
            stack = undefined;
            reject(err);
          }
        },
        stack
      );
    });
  }
}
