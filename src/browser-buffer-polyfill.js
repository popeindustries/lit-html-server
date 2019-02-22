/* global window */
/* eslint no-unused-vars: 0 */
const Buffer = (typeof window !== 'undefined' && window.Buffer) || {
  /**
   * Determine if 'buffer' is a buffer
   *
   * @param { any } buffer
   * @returns { boolean }
   */
  isBuffer(buffer) {
    return typeof buffer === 'string';
  },

  /**
   * Create buffer from 'string'
   *
   * @param { string } string
   * @returns { string }
   */
  from(string) {
    return typeof string === 'string' ? string : String(string);
  },

  /**
   * Join 'buffers' into a single string
   *
   * @param { Array<any> } buffers
   * @param { number } [length]
   * @returns { string }
   */
  concat(buffers, length) {
    let string = '';

    for (let i = 0, n = buffers.length; i < n; i++) {
      const buffer = buffers[i];

      string += typeof buffer === 'string' ? buffer : String(buffer);
    }

    if (length !== undefined && string.length > length) {
      string = string.slice(0, length);
    }

    return string;
  }
};
