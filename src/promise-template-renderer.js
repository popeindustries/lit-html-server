/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 * @typedef TemplateResultProcessor { import('./default-template-result-processor.js).TemplateResultProcessor }
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
   * @param { boolean } [asBuffer]
   * @returns { Promise<string> }
   */
  constructor(result, processor, asBuffer = false) {
    return new Promise((resolve, reject) => {
      let stack = [result];
      let buffer = [];
      let bufferLength = 0;

      processor.getProcessor(
        {
          push(chunk) {
            if (chunk === null) {
              buffer = Buffer.concat(buffer, bufferLength);
              resolve(asBuffer ? buffer : buffer.toString());
            } else {
              buffer.push(chunk);
              bufferLength += chunk.length;
            }
            return true;
          },
          destroy(err) {
            buffer.length = stack.length = bufferLength = 0;
            buffer = undefined;
            stack = undefined;
            reject(err);
          }
        },
        stack
      )();
    });
  }
}
