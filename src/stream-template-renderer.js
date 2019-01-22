/**
 * @typedef templateResult { import('./template-result.js).templateResult }
 */
import { bufferResult } from './template-result-bufferer.js';
import { Readable } from 'stream';

/**
 * Render a template result to a Readable stream
 *
 * @param { templateResult } result
 * @param { object } [options] Readable options
 * @see https://nodejs.org/api/stream.html#stream_new_stream_readable_options
 * @returns { Readable }
 */
export function streamTemplateRenderer(result, options = {}) {
  return new TemplateResultStream(result, options);
}

/**
 * A custom Readable stream class
 */
class TemplateResultStream extends Readable {
  /**
   * Constructor
   *
   * @param { templateResult } result
   */
  constructor(result, options) {
    super({ autoDestroy: true, ...options });

    this.canPushData = true;
    this.done = false;
    this.buffer = '';
    this.index = 0;

    bufferResult(result, this)
      .then(() => {
        this.done = true;
        this._drainBuffer();
      })
      .catch((err) => {
        this.destroy(err);
      });
  }

  /**
   * Push "chunk" onto buffer
   * (Called by "bufferResult" utility)
   *
   * @param { string } chunk
   */
  bufferChunk(chunk) {
    this.buffer += chunk;
    this._drainBuffer();
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
   * @returns { boolean }
   */
  _drainBuffer() {
    if (!this.canPushData) {
      return false;
    }

    const bufferLength = this.buffer.length;

    if (this.index < bufferLength) {
      // Strictly speaking we shouldn't compare character length with byte length, but close enough
      const length = Math.min(bufferLength - this.index, this.readableHighWaterMark);
      const chunk = this.buffer.slice(this.index, this.index + length);

      this.canPushData = this.push(chunk, 'utf8');
      this.index += length;
    } else if (this.done) {
      this.push(null);
    }

    return this.canPushData;
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
