import { finished, PassThrough, Readable } from 'readable-stream';
import { isPromise, isStream, isSyncIterator } from './is.js';
import { removeHeader, sanitize } from './string.js';

/**
 * Asynchronous tagged template processor for HTML templates created with `htmlTemplate`.
 * Returns a Readable stream.
 * Based on https://github.com/almost/stream-template
 * @param {[string]} strings
 * @param {*} values
 * @returns {Readable}
 */
export default function asyncHtmlTemplate(strings, ...values) {
  return new AsyncHtmlTemplate(strings, values);
}

class AsyncHtmlTemplate extends Readable {
  /**
   * Constructor
   * @param {[string]} strings
   * @param {*} values
   */
  constructor(strings, values) {
    super();

    this.strings = strings;
    this.values = values;

    this.done = false;
    this.awaitingPromise = false;
    this.nestedStream = null;
    this.nestedStreamHasData = false;
    this.queue = [strings[0]];
    this.stringBuffer = [];
    this.wantsData = false;

    for (let i = 0, n = values.length; i < n; i++) {
      const value = values[i];

      // If is stream or Promise, handle downstream errors
      if (isStream(value) || isPromise(value)) {
        this.handleDownstreamErrors(value);
      }

      this.queue.push(value, strings[i + 1]);
    }

    this.once('end', () => {
      this.cleanUp();
    });
  }

  /**
   * Handle errors from interpolated stream or Promise values
   * @param {Readable|Promise} streamOrPromise
   */
  handleDownstreamErrors(streamOrPromise) {
    if (isStream(streamOrPromise)) {
      finished(streamOrPromise, (err) => {
        if (err) {
          this.destroy(err);
        }
      });
    } else {
      streamOrPromise.catch((err) => {
        this.destroy(err);
      });
    }
  }

  /**
   * Extend super.read()
   */
  _read() {
    this.processQueue();
  }

  /**
   * Process all pending queue items
   */
  processQueue() {
    if (this.done || this.awaitingPromise) {
      return;
    }

    this.wantsData = true;

    // Read data from nested stream
    if (this.nestedStream) {
      if (this.nestedStreamHasData) {
        this.nestedStreamHasData = false;

        const chunk = this.nestedStream.read();

        if (chunk != null) {
          if (this.push(chunk) === false) {
            this.wantsData = false;
          }
        }
      }
      return;
    }

    while (!this.done) {
      // Finished
      if (this.queue.length === 0) {
        // Write all buffered data, but delay closing if backpressure
        if (!this.drainStringBuffer()) {
          return;
        }
        // Close stream
        this.push(null);
        return;
      }

      let item = this.queue.shift();
      const type = typeof item;

      // TODO: add iterator support
      // TODO: add directive support?
      // Handle primitives
      if (item == null || type === 'string' || type === 'number' || type === 'boolean') {
        // Ignore undefined
        if (item === undefined) {
          item = '';
        }
        // Remove any headers added by htmlTemplate parent and/or template nesting
        this.stringBuffer.push(Buffer.from(`${removeHeader(item)}`, 'utf8'));
      } else if (Array.isArray(item) || isSyncIterator(item)) {
        // Escape before adding to queue
        this.queue = Array.from(item, sanitize).concat(this.queue);
      } else {
        // Write all buffered data, but abort if backpressure
        if (!this.drainStringBuffer()) {
          this.queue.unshift(item);
          return;
        }

        if (isStream(item)) {
          this.nestedStream = new PassThrough();
          this.nestedStreamHasData = false;
          item.pipe(this.nestedStream);
          this.nestedStream.once('end', () => {
            this.nestedStream = null;
            if (this.wantsData) {
              this.processQueue();
            }
          });
          this.nestedStream.on('readable', () => {
            this.nestedStreamHasData = true;
            if (this.wantsData) {
              this.processQueue();
            }
          });
        } else if (isPromise(item)) {
          this.awaitingPromise = true;
          item.then((result) => {
            this.awaitingPromise = false;
            // Escape before adding to queue
            this.queue.unshift(sanitize(result));
            this.processQueue();
          });
        } else {
          this.emit('error', Error(`uknown interpolation value: ${item}`));
        }

        // Loop will be manually started again above, so abort
        return;
      }
    }
  }

  /**
   * Write all buffered strings.
   * Returns `false` if write triggered backpressure, otherwise `true`
   * @returns {boolean}
   */
  drainStringBuffer() {
    if (this.stringBuffer.length > 0) {
      const toWrite = Buffer.concat(this.stringBuffer);

      this.stringBuffer.length = 0;

      if (this.push(toWrite) === false) {
        return false;
      }
    }
    return true;
  }

  /**
   * Extend super.destroy()
   * @param {Error} [err]
   */
  _destroy(err) {
    if (this.done) {
      return;
    }

    this.done = true;

    // Destroy all nested streams
    for (let i = 0, n = this.values.length; i < n; i++) {
      const value = this.values[i];

      if (isStream(value)) {
        value.destroy();
      }
    }

    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    this.cleanUp();
  }

  /**
   * Cleanup when finished/destroyed
   */
  cleanUp() {
    this.done = true;
    this.strings = null;
    this.values = null;
    this.nestedStream = null;
    this.queue = null;
    this.stringBuffer = null;
    this.removeAllListeners();
  }
}
