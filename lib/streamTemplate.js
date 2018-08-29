'use strict';

const { finished, PassThrough, Readable } = require('readable-stream');
const { removeHeader, sanitize } = require('./string.js');

/**
 * Tagged template processor for HTML templates returning a Readable stream.
 * Based on https://github.com/almost/stream-template
 * @param {[string]} strings
 * @param {...string|number|boolean|Array|Promise|Readable} values
 * @returns {Readable}
 */
module.exports = function streamTemplate(strings, ...values) {
  return new TemplateStream(strings, values);
};

class TemplateStream extends Readable {
  constructor(strings, values) {
    super();

    this.strings = strings;
    this.values = values;

    this.done = false;
    this.awaitingPromise = false;
    this.currentStream = null;
    this.currentStreamHasData = false;
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

  _read() {
    this.processQueue();
  }

  processQueue() {
    if (this.done || this.awaitingPromise) {
      return;
    }

    this.wantsData = true;

    if (this.currentStream) {
      if (this.currentStreamHasData) {
        this.currentStreamHasData = false;

        const chunk = this.currentStream.read();

        if (chunk != null) {
          if (this.push(chunk) === false) {
            this.wantsData = false;
          }
        }
      }
      return;
    }

    while (!this.done) {
      if (this.queue.length === 0) {
        if (!this.drainStringBuffer()) {
          return;
        }
        this.push(null);
        return;
      }

      const item = this.queue.shift();
      const type = typeof item;

      if (item == null || type === 'string' || type === 'number' || type === 'boolean') {
        this.stringBuffer.push(Buffer.from(`${removeHeader(item)}`, 'utf8'));
      } else if (Array.isArray(item)) {
        this.queue = item.map(sanitize).concat(this.queue);
      } else {
        if (!this.drainStringBuffer()) {
          this.queue.unshift(item);
          return;
        }

        if (isStream(item)) {
          this.currentStream = new PassThrough();
          this.currentStreamHasData = false;
          item.pipe(this.currentStream);
          this.currentStream.once('end', () => {
            this.currentStream = null;
            if (this.wantsData) {
              this.processQueue();
            }
          });
          this.currentStream.on('readable', () => {
            this.currentStreamHasData = true;
            if (this.wantsData) {
              this.processQueue();
            }
          });
        } else if (isPromise(item)) {
          this.awaitingPromise = true;
          item.then((result) => {
            this.awaitingPromise = false;
            this.queue.unshift(sanitize(result));
            this.processQueue();
          });
        } else {
          throw Error(`uknown interpolation value: ${item}`);
        }

        return;
      }
    }
  }

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

  _destroy(err) {
    if (this.done) {
      return;
    }

    this.done = true;

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

  cleanUp() {
    this.done = true;
    this.strings = null;
    this.values = null;
    this.currentStream = null;
    this.queue = null;
    this.stringBuffer = null;
    this.removeAllListeners();
  }
}

function isStream(stream) {
  return stream != null && stream.pipe != null;
}

function isPromise(promise) {
  return promise != null && promise.then != null;
}
