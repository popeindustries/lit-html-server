'use strict';

const { finished, PassThrough, Readable } = require('readable-stream');

module.exports = function streamTemplate(strings, ...values) {
  return new TemplateStream(strings, values);
};

class TemplateStream extends Readable {
  constructor(strings, values) {
    super();

    this.strings = strings;
    this.values = values;

    this.awaitingPromise = false;
    this.currentStream = null;
    this.currentStreamHasData = false;
    this.destroyed = false;
    this.queue = [strings[0]];
    this.stringBuffer = [];
    this.wantsData = false;

    for (let i = 0, n = values.length; i < n; i++) {
      const value = values[i];

      // If is stream or Promise, handle downstream errors
      if (isStream(value) || isPromise(value)) {
        this.handleNestedErrors(value);
      }

      this.queue.push(value, strings[i + 1]);
    }
  }

  handleNestedErrors(streamOrPromise) {
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
    if (this.destroyed || this.awaitingPromise) {
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

    while (!this.destroyed) {
      if (this.queue.length === 0) {
        if (this.stringBuffer.length > 0) {
          const toWrite = Buffer.concat(this.stringBuffer);

          this.stringBuffer.length = 0;

          if (this.push(toWrite) === false) {
            return;
          }
        }
        this.push(null);
        return;
      }

      const item = this.queue.shift();

      if (item == null || typeof item === 'string') {
        this.stringBuffer.push(Buffer.from(`${item}`, 'utf8'));
      }
    }
  }

  _destroy(err) {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

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
  }
}

function isStream(stream) {
  return stream != null && stream.pipe != null;
}

function isPromise(promise) {
  return promise != null && promise.then != null;
}
