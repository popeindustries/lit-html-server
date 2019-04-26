/**
 * @typedef TemplateResultProcessor
 * @property { (renderer: TemplateResultRenderer, stack: Array<any>, [highWaterMark: number]) => function } getProcessor
 */
/**
 * @typedef TemplateResultRenderer
 * @property { (chunk: Buffer) => boolean } push
 * @property { (err: Error) => void } destroy
 */
import { isAsyncIterator, isIteratorResult, isPromise } from './is.js';
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

    function flushBuffer() {
      if (buffer.length > 0) {
        const keepPushing = renderer.push(Buffer.concat(buffer, bufferLength));

        bufferLength = buffer.length = 0;
        return keepPushing;
      }
    }

    return function process() {
      while (!paused) {
        let chunk = stack[0];
        let breakLoop = false;
        let popStack = true;

        // Done
        if (chunk === undefined) {
          flushBuffer();
          return renderer.push(null);
        }

        if (isTemplateResult(chunk)) {
          popStack = false;
          chunk = getTemplateResultChunk(chunk, stack);
        }

        // Skip if finished reading TemplateResult (null)
        if (chunk !== null) {
          if (Buffer.isBuffer(chunk)) {
            buffer.push(chunk);
            bufferLength += chunk.length;
            // Flush buffered data if over highWaterMark
            if (bufferLength > highWaterMark) {
              // Pause if backpressure triggered
              breakLoop = !flushBuffer();
            }
          } else if (isPromise(chunk)) {
            // Flush buffered data before waiting for Promise
            flushBuffer();
            breakLoop = true;
            paused = true;
            // Add pending Promise for value to stack
            stack.unshift(chunk);
            chunk
              .then((chunk) => {
                paused = false;
                // Handle IteratorResults from AsyncIterator
                if (isIteratorResult(chunk)) {
                  if (chunk.done) {
                    // Clear resolved Promise
                    stack.shift();
                    // Clear AsyncIterator
                    stack.shift();
                  } else {
                    // Replace resolved Promise with IteratorResult value
                    stack[0] = chunk.value;
                  }
                } else {
                  // Replace resolved Promise with value
                  stack[0] = chunk;
                }
                process();
              })
              .catch((err) => {
                destroy(stack);
                renderer.destroy(err);
              });
          } else if (Array.isArray(chunk)) {
            // First remove existing Array if at top of stack (not added by pending TemplateResult)
            if (stack[0] === chunk) {
              popStack = false;
              stack.shift();
            }
            stack.unshift(...chunk);
          } else if (isAsyncIterator(chunk)) {
            popStack = false;
            // Add AsyncIterator to stack (will be cleared when done iterating)
            if (stack[0] !== chunk) {
              stack.unshift(chunk);
            }
            // Add pending Promise for IteratorResult to stack
            stack.unshift(chunk[Symbol.asyncIterator]().next());
          } else {
            destroy(stack);
            return renderer.destroy(Error(`unknown chunk type: ${chunk}`));
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
