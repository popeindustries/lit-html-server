/**
 * @typedef TemplateResultProcessor
 * @property { (renderer: TemplateResultRenderer, stack: Array<any>, [highWaterMark: number]) => function } getProcessor
 */
/**
 * @typedef TemplateResultRenderer
 * @property { (chunk: Buffer) => boolean } push
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
   * @param { number } [highWaterMark] - byte length to buffer before pushing data
   * @returns { () => void }
   */
  getProcessor(renderer, stack, highWaterMark = 0) {
    const buffer = [];
    let bufferLength = 0;
    let paused = false;

    return function process() {
      while (!paused) {
        let chunk = stack[0];
        let breakLoop = false;
        let popStack = true;

        if (chunk === undefined) {
          if (highWaterMark > 0 && buffer.length > 0) {
            renderer.push(Buffer.concat(buffer, bufferLength));
          }
          return renderer.push(null);
        }

        if (isTemplateResult(chunk)) {
          popStack = false;
          chunk = getTemplateResultChunk(chunk, stack);
        }

        // Skip if finished reading TemplateResult (null)
        if (chunk !== null) {
          if (Buffer.isBuffer(chunk)) {
            let shouldPush = true;

            // Buffer data if highWaterMark set
            if (highWaterMark > 0) {
              buffer.push(chunk);
              bufferLength += chunk.length;
              // Flush buffered data if over highWaterMark
              if (bufferLength > highWaterMark) {
                chunk = Buffer.concat(buffer, bufferLength + chunk.length);
                bufferLength = buffer.length = 0;
              } else {
                shouldPush = false;
              }
            }
            if (shouldPush) {
              // Pause if backpressure triggered
              if (!renderer.push(chunk)) {
                breakLoop = true;
              }
            }
          } else if (isPromise(chunk)) {
            // Flush buffered data before waiting for Promise
            if (highWaterMark > 0) {
              renderer.push(Buffer.concat(buffer, bufferLength));
              bufferLength = buffer.length = 0;
            }
            breakLoop = true;
            paused = true;
            stack.unshift(chunk);
            chunk
              .then((chunk) => {
                paused = false;
                stack[0] = chunk;
                process();
              })
              .catch((err) => {
                destroy(stack);
                renderer.destroy(err);
              });
          } else if (Array.isArray(chunk)) {
            // An existing TemplateResult will have already set this to "false",
            // so only remove existing Array if there is no active TemplateResult
            if (popStack === true) {
              popStack = false;
              stack.shift();
            }
            stack.unshift(...chunk);
          } else {
            destroy(stack);
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
    };
  }
}

/**
 * Permanently destroy all remaining TemplateResults in "stack".
 * (Triggered on error)
 *
 * @param { Array<any> } stack
 */
function destroy(stack) {
  if (stack.length > 0) {
    for (const chunk of stack) {
      if (isTemplateResult(chunk)) {
        chunk.destroy(true);
      }
    }
  }
  stack.length = 0;
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
  if (Buffer.isBuffer(chunk) && chunk.length === 0) {
    chunk = result.readChunk();
  }

  // Finished reading, dispose
  if (chunk === null) {
    stack.shift();
  } else if (isTemplateResult(chunk)) {
    // Add to top of stack
    stack.unshift(chunk);
    chunk = getTemplateResultChunk(chunk, stack);
  }

  return chunk;
}
