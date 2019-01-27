/**
 * @typedef TemplateResultProcessor
 * @property { (renderer: TemplateResultRenderer, stack: Array<any>) => void } process
 */
/**
 * @typedef TemplateResultRenderer
 * @property { boolean } awaitingPromise
 * @property { (chunk: string) => boolean } push
 * @property { (err: Error) => void } destroy
 */
import { isPromise } from './is.js';
import { isTemplateResult } from './template-result.js';

/**
 * Class for the default TemplateResult processor
 * used by Promise/Stream TemplateRenderers.
 *
 * @implements TemplateResultProcessor
 */
export class DefaultTemplateResultProcessor {
  /**
   * Process "stack" and push chunks to "renderer"
   *
   * @param { TemplateResultRenderer } renderer
   * @param { Array<any> } stack
   */
  process(renderer, stack) {
    while (!renderer.awaitingPromise) {
      let chunk = stack[0];
      let breakLoop = false;
      let popStack = true;

      if (chunk === undefined) {
        return renderer.push(null);
      }

      if (isTemplateResult(chunk)) {
        popStack = false;
        chunk = getTemplateResultChunk(chunk, stack);
      }

      // Skip if finished reading TemplateResult (null) or empty string
      if (chunk !== null && chunk !== '') {
        if (typeof chunk === 'string') {
          if (!renderer.push(chunk)) {
            breakLoop = true;
          }
        } else if (isPromise(chunk)) {
          breakLoop = true;
          renderer.awaitingPromise = true;
          stack.unshift(chunk);
          chunk
            .then((chunk) => {
              renderer.awaitingPromise = false;
              stack[0] = chunk;
              this.process(renderer, stack);
            })
            .catch((err) => {
              renderer.destroy(err);
            });
        } else if (Array.isArray(chunk)) {
          popStack = false;
          stack = chunk.concat(stack);
        } else {
          return renderer.destroy(Error('unknown chunk type:', chunk));
        }
      }

      if (popStack) {
        stack.shift();
      }

      if (breakLoop) {
        break;
      }
    }
  }
}

/**
 * Retrieve next chunk from "result".
 * Adds nested TemplateResults to the stack if necessary.
 *
 * @param { TemplateResult } result
 * @param { Array<any> } stack
 */
function getTemplateResultChunk(result, stack) {
  let chunk = result.readChunk();

  // Skip empty strings
  if (chunk === '') {
    chunk = result.readChunk();
  }

  // Handle nested result
  if (isTemplateResult(chunk)) {
    // Add to top of stack
    stack.unshift(chunk);
    chunk = getTemplateResultChunk(chunk, stack);
  }

  // Finished reading, dispose
  if (chunk === null) {
    stack.shift();
  }

  return chunk;
}
