/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { isPromise } from './is.js';
import { Readable } from 'stream';

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
   * @param { object } [options.chunkSize = 16384] - the string character length to push to the consumer each read request
   * @returns { Readable }
   */
  constructor(result, options = { destructive: true }) {
    const highWaterMark = options.highWaterMark || 16384;

    super({ autoDestroy: true, highWaterMark });

    this.canPushData = true;
    this.done = false;
    this.buffer = '';
    this.index = 0;

    this._process(options.destructive ? result : result.slice())
      .then(() => {
        this.done = true;
        this._drainBuffer();
      })
      .catch((err) => {
        this.destroy(err);
      });
  }

  /**
   * Process TemplateResult stack
   *
   * @param { TemplateResult } stack
   * @returns { Promise<void> }
   */
  async _process(stack) {
    let chunk;

    while ((chunk = stack.shift()) !== undefined) {
      if (typeof chunk === 'string') {
        this.buffer += chunk;
        chunk = '';
        this._drainBuffer();
      } else if (Array.isArray(chunk)) {
        stack = chunk.concat(stack);
      } else if (isPromise(chunk)) {
        stack.unshift(await chunk);
      } else {
        throw Error('unknown value type:', chunk);
      }
    }
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    this.canPushData = true;
    this._drainBuffer();
  }

  /**
   * Write all buffered content to stream.
   * Returns "false" if write triggered backpressure, otherwise "true".
   *
   * @returns { void }
   */
  _drainBuffer() {
    if (!this.canPushData) {
      return false;
    }

    const bufferLength = this.buffer.length;

    if (this.index < bufferLength) {
      // Strictly speaking we shouldn't compare character length with byte length, but close enough
      const length = Math.min(bufferLength - this.index, this.readableHighWaterMark);

      this.canPushData = this.push(this.buffer.slice(this.index, this.index + length));
      this.index += length;
    } else if (this.done) {
      this.push(null);
    }
  }

  /**
   * Extend Readalbe.destroy()
   *
   * @param { Error } [err]
   */
  _destroy(err) {
    if (this.done) {
      return;
    }

    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    this.canPushData = false;
    this.done = true;
    this.buffer = '';
    this.index = 0;
    this.removeAllListeners();
  }
}
