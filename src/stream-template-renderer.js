import { bufferResult } from './template-result-bufferer.js';
import { Readable } from 'stream';

/**
 * Render a template result to a Readable stream
 * @param {Array<string|Promise<string>>} result
 * @param {object} [options] stream.Readable options
 * @returns {Readable}
 */
export function streamTemplateRenderer(result, options = {}) {
  return new TemplateResultStream(result, options);
}

class TemplateResultStream extends Readable {
  /**
   *
   * @param {Array<string|Promise<string>>} result
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
   * @param {string} chunk
   */
  pushChunk(chunk) {
    this.buffer += chunk;
    this._drainBuffer();
  }

  /**
   * Extend super.read()
   */
  _read() {
    this.canPushData = true;
    this._drainBuffer();
  }

  /**
   * Write all buffered content to stream.
   * Returns "false" if write triggered backpressure, otherwise "true".
   * @returns {boolean}
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
   * Extend super.destroy()
   * @param {Error} [err]
   */
  _destroy(err) {
    if (this.done) {
      return;
    }

    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    this.done = true;
    this.result = null;
    this.buffer = '';
    this.removeAllListeners();
  }
}
