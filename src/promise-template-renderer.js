import { Buffer } from 'buffer';

/**
 * A factory for rendering a template result to a string resolving Promise
 *
 * @param { TemplateResult } result
 * @param { TemplateResultProcessor } processor
 * @param { boolean } [asBuffer]
 * @param { RenderOptions } [options]
 */
export function promiseTemplateRenderer(result, processor, asBuffer = false, options) {
  return new Promise((resolve, reject) => {
    let stack = [result];
    /** @type { Array<Buffer> } */
    let buffer = [];
    let bufferLength = 0;

    processor.getProcessor(
      {
        push(chunk) {
          if (chunk === null) {
            const concatBuffer = Buffer.concat(buffer, bufferLength);
            resolve(asBuffer ? concatBuffer : concatBuffer.toString());
          } else {
            buffer.push(chunk);
            bufferLength += chunk.length;
          }
          return true;
        },
        destroy(err) {
          buffer.length = stack.length = bufferLength = 0;
          // @ts-ignore
          buffer = undefined;
          // @ts-ignore
          stack = undefined;
          reject(err);
        }
      },
      stack,
      0,
      options
    )();
  });
}
