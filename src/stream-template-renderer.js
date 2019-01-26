/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { isPromise } from './is.js';
import { Readable } from 'stream';
import { TemplateResult } from './template-result.js';

/**
 * A custom Readable stream class that renders a TemplateResult
 */
export class StreamTemplateRenderer extends Readable {
  /**
   * Create a Readable stream instance.
   * Note that, by default, the "result" will be emptied of elements during render,
   * and should be considered single use.
   * Set "options.destructive = false" to allow for reuse.
   *
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { object } [options]
   * @param { object } [options.destructive = true] - destroy "result" while rendering ("true"), or operate on a shallow copy ("false")
   * @returns { Readable }
   */
  constructor(result /* , options = { destructive: true } */) {
    super({ autoDestroy: true });

    this.stack = [result];
  }

  /**
   * Process internal stack
   *
   * @returns { void }
   */
  async process() {
    /* eslint no-constant-condition: 0 */
    while (true) {
      let chunk = this.stack[0];

      if (chunk === undefined) {
        return this.push(null);
      }

      if (chunk instanceof TemplateResult) {
        chunk = getTemplateResultChunk(chunk, this.stack);
      } else {
        this.stack.shift();
      }

      console.log(`chunk: "${chunk}"`);

      // Skip if finished reading TemplateResult (null) or empty string
      if (chunk !== null && chunk !== '') {
        if (typeof chunk === 'string') {
          if (!this.push(chunk)) {
            break;
          }
        } else if (isPromise(chunk)) {
          try {
            this.stack[0] = await chunk;
          } catch (err) {
            return this.destroy(err);
          }
        } else if (Array.isArray(chunk)) {
          this.stack = chunk.concat(this.stack);
        } else {
          return this.destroy(Error('unknown chunk type:', chunk));
        }
      }
    }
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    this.process();
  }

  /**
   * Extend Readalbe.destroy()
   *
   * @param { Error } [err]
   */
  _destroy(err) {
    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    this.stack = [];
    this.removeAllListeners();
  }
}

function getTemplateResultChunk(result, stack) {
  let chunk = result.read();

  if (chunk instanceof TemplateResult) {
    // Add to top of stack
    stack.unshift(chunk);
    chunk = getTemplateResultChunk(chunk, stack);
  }

  // Finished reading, destroy
  if (chunk === null) {
    result.destroy();
    stack.shift();
  }

  return chunk;
}
