'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Enables fast switching between multiple templates by caching previous results.
   * Not possible/desireable to cache between requests, so this is a no-op.
   * @param {*} value
   * @returns {function}
   */
  cache: directive((value) => (part) => {
    if (part.isAttribute) {
      throw Error('The `cache` directive must be only be used in text nodes');
    }
    part.setValue(value);
  })
};
